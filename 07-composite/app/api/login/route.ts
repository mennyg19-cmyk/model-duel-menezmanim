import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createLoginSession, issueSessionResponse } from "@/lib/auth";
import { verifyAgainstDummy, verifyPassword } from "@/lib/passwords";
import { parseBody } from "@/lib/parse-body";
import { recordAudit } from "@/lib/audit";
import { clientIp } from "@/lib/client-ip";
import { loginRateLimit } from "@/lib/rate-limit";
import { safeNextPath } from "@/lib/safe-redirect";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

// The production staff sign-in path (R-108) — without it, a session expiry
// after the one-time invite link (app/invite/[token]) was a permanent
// lockout. Generic "Invalid email or password" on every failure branch, and
// a dummy PBKDF2 run on the not-found/no-password path, so response content
// and timing don't reveal which emails have accounts (same anti-enumeration
// goal as checkoutToken's timing-safe compares).
export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema, "Email and password are required");
  if (!parsed.ok) return parsed.response;
  const { email, password, next } = parsed.data;

  const ip = clientIp(request.headers) ?? "unknown";
  if (!loginRateLimit(ip, email)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const staff = await prisma.staffUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!staff || !staff.passwordHash || staff.status !== "ACTIVE") {
    await verifyAgainstDummy(password);
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, staff.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await createLoginSession(staff.id);
  await recordAudit({
    actor: { id: staff.id, email: staff.email },
    action: "session_login",
    targetType: "StaffUser",
    targetId: staff.id,
  });
  const roleHome = staff.role === "DRIVER" ? "/driver" : "/admin";
  return issueSessionResponse(
    { staffUserId: staff.id, authSessionId: session.id },
    { ok: true, next: safeNextPath(next, roleHome) },
  );
}
