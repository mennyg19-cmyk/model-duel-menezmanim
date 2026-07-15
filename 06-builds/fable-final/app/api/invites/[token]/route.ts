import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireActor } from "@/auth/guards";
import type { Role } from "@/auth/model";
import { db } from "@/db/client";
import { orgInvites, orgMemberships, orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E7 GET — invite preview by token (authed). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await requireActor();
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const { token } = await params;
  const [invite] = await db.select().from(orgInvites).where(eq(orgInvites.token, token)).limit(1);
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  const [org] = await db.select({ id: orgs.id, name: orgs.name, slug: orgs.slug }).from(orgs).where(eq(orgs.id, invite.orgId)).limit(1);

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt.toISOString(),
    used: Boolean(invite.usedAt),
    expired: invite.expiresAt.getTime() < Date.now(),
    org,
  });
}

/** E7 POST — accept invite for the signed-in user. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  let actor;
  try {
    actor = await requireActor();
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const { token } = await params;
  const [invite] = await db.select().from(orgInvites).where(eq(orgInvites.token, token)).limit(1);
  if (!invite) return NextResponse.json({ error: "That invite link is not valid." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "That invite has already been used." }, { status: 409 });
  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "That invite has expired." }, { status: 410 });
  }
  if (invite.email.toLowerCase() !== actor.email.toLowerCase()) {
    return NextResponse.json({ error: "This invite was sent to a different email address." }, { status: 403 });
  }

  const existing = await db
    .select({ id: orgMemberships.id })
    .from(orgMemberships)
    .where(and(eq(orgMemberships.userId, actor.userId), eq(orgMemberships.orgId, invite.orgId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(orgMemberships).values({
      userId: actor.userId,
      orgId: invite.orgId,
      role: invite.role as Role,
    });
  }
  await db.update(orgInvites).set({ usedAt: new Date() }).where(eq(orgInvites.id, invite.id));

  const [org] = await db.select({ slug: orgs.slug }).from(orgs).where(eq(orgs.id, invite.orgId)).limit(1);
  if (!org) return NextResponse.json({ error: "Organization no longer exists." }, { status: 404 });

  return NextResponse.json({ ok: true, slug: org.slug });
}
