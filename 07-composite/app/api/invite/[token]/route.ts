import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { createLoginSession, issueSessionResponse } from "@/lib/auth";
import { hashPassword } from "@/lib/passwords";
import { parseBody } from "@/lib/parse-body";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Confirming an invite sets the password (R-108): it's the only chance a
// staff row gets one, and without one there is no way to sign back in at
// /login once this one-time link is used and the session eventually expires.
const confirmSchema = z.object({ password: z.string().min(8, "Password must be at least 8 characters") });

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = await parseBody(request, confirmSchema, "Password must be at least 8 characters");
  if (!parsed.ok) return parsed.response;

  const staff = await prisma.staffUser.findUnique({ where: { inviteToken: token } });
  if (!staff || staff.status !== "PENDING") {
    return NextResponse.json({ error: "Invite is invalid or already used" }, { status: 404 });
  }
  if (!staff.invitedAt || Date.now() - staff.invitedAt.getTime() > INVITE_TTL_MS) {
    return NextResponse.json({ error: "Invite has expired. Ask a manager for a fresh one." }, { status: 410 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const confirmed = await prisma.staffUser.update({
    where: { id: staff.id },
    data: { status: "ACTIVE", confirmedAt: new Date(), inviteToken: null, passwordHash, version: { increment: 1 } },
  });
  await recordAudit({
    actor: { id: confirmed.id, email: confirmed.email },
    action: "staff_confirm",
    targetType: "StaffUser",
    targetId: confirmed.id,
  });

  const authSession = await createLoginSession(confirmed.id);
  const destination = confirmed.role === "DRIVER" ? "/driver" : "/admin";
  return issueSessionResponse(
    { staffUserId: confirmed.id, authSessionId: authSession.id },
    { ok: true, next: destination },
  );
}
