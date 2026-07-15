import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isSuperAdminEmail } from "@/auth/super-admin";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * E6 — Clerk user webhook. With CLERK_WEBHOOK_SIGNING_SECRET, verifies Svix-style
 * signed payload (t.v1). Without Clerk, accepts the same JSON body when
 * X-Dev-Webhook-Secret matches AUTH_SECRET (experiment/test path — reversible).
 */

type ClerkEmail = { id: string; email_address: string };
type ClerkUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmail[];
};

function verifySvix(rawBody: string, headers: Headers, secret: string): boolean {
  const msgId = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!msgId || !timestamp || !signatureHeader) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 60 * 5) return false;

  const signed = `${msgId}.${timestamp}.${rawBody}`;
  // Clerk secrets are often "whsec_..." base64.
  const key = secret.startsWith("whsec_") ? Buffer.from(secret.slice(6), "base64") : Buffer.from(secret, "utf-8");
  const digest = createHmac("sha256", key).update(signed).digest("base64");
  const candidates = signatureHeader.split(" ").map((part) => part.replace(/^v1,/, "").trim());
  return candidates.some((candidate) => {
    try {
      const a = Buffer.from(candidate);
      const b = Buffer.from(digest);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

async function upsertUser(data: ClerkUserData) {
  const clerkUserId = data.id;
  const emails = data.email_addresses ?? [];
  const email =
    emails.find((address) => address.id === data.primary_email_address_id)?.email_address ??
    emails[0]?.email_address ??
    "";
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
  const isSuperAdmin = email ? isSuperAdminEmail(email) : false;

  const existing = (await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1))[0];
  if (existing) {
    await db.update(users).set({ email, name, isSuperAdmin }).where(eq(users.clerkUserId, clerkUserId));
  } else if (email) {
    await db.insert(users).values({ clerkUserId, email, name, isSuperAdmin });
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  const devSecret = process.env.AUTH_SECRET?.trim() || "rebuild-a-dev-secret-change-me";

  let allowed = false;
  if (secret) {
    allowed = verifySvix(rawBody, request.headers, secret);
  } else {
    const provided = request.headers.get("x-dev-webhook-secret") ?? "";
    const a = Buffer.from(provided);
    const b = Buffer.from(devSecret);
    allowed = a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  }

  if (!allowed) return NextResponse.json({ error: "invalid signature" }, { status: 400 });

  let event: { type?: string; data?: ClerkUserData };
  try {
    event = JSON.parse(rawBody) as { type?: string; data?: ClerkUserData };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if ((event.type === "user.created" || event.type === "user.updated") && event.data?.id) {
    await upsertUser(event.data);
  } else if (event.type === "user.deleted" && event.data?.id) {
    await db.delete(users).where(eq(users.clerkUserId, event.data.id));
  }

  return NextResponse.json({ ok: true });
}
