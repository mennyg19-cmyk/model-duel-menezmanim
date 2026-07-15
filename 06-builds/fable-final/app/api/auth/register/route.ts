import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { startSession } from "@/auth/cookie";
import { hashPassword } from "@/auth/passwords";
import { isSuperAdminEmail } from "@/auth/super-admin";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    name?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const name = body?.name?.trim() || null;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const [row] = await db
    .insert(users)
    .values({
      clerkUserId: `session:${crypto.randomUUID()}`,
      email,
      name,
      passwordHash: hashPassword(password),
      isSuperAdmin: isSuperAdminEmail(email),
    })
    .returning();

  if (!row) return NextResponse.json({ error: "Could not create account." }, { status: 500 });

  await startSession({ userId: row.id, email: row.email, isSuperAdmin: row.isSuperAdmin });
  return NextResponse.json({ ok: true, userId: row.id });
}
