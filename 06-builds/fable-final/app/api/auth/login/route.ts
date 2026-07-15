import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { startSession } from "@/auth/cookie";
import { verifyPassword } from "@/auth/passwords";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!row?.passwordHash || !verifyPassword(password, row.passwordHash)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  await startSession({ userId: row.id, email: row.email, isSuperAdmin: row.isSuperAdmin });
  return NextResponse.json({ ok: true, userId: row.id });
}
