import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../db/client";

export const SESSION_COOKIE = "menez_session";

export type SessionUser = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
};

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "rebuild-b-dev-secret";
}

export function signSession(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, issuedAt: Date.now() })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
    };
    return data.userId ?? null;
  } catch {
    return null;
  }
}

export type AuthMode = "local" | "clerk" | "self-hosted" | "desktop";

export function authMode(): AuthMode {
  const configured = process.env.AUTH_MODE;
  if (
    configured === "local" ||
    configured === "clerk" ||
    configured === "self-hosted" ||
    configured === "desktop"
  ) {
    return configured;
  }
  return process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    ? "clerk"
    : "local";
}

export function clerkConfigured(): boolean {
  return Boolean(
    authMode() === "clerk" &&
      process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    isSuperAdmin: user.isSuperAdmin,
  };
}

export function superAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string): boolean {
  return superAdminEmails().includes(email.toLowerCase());
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
