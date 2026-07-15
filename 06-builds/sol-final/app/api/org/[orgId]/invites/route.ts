import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";

type Ctx = { params: Promise<{ orgId: string }> };

const ROLES = new Set(["owner", "admin", "editor", "viewer"]);
const INVITE_DAYS = 14;

function inviteDto(row: {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    token: row.token,
    expiresAt: row.expiresAt.toISOString(),
    usedAt: row.usedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    acceptPath: `/onboarding?invite=${row.token}`,
  };
}

/** E17 — pending invites create / list / revoke(+resend via create). */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const invites = await prisma.orgInvite.findMany({
    where: { orgId: access.orgId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invites: invites.map(inviteDto) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as { email?: string; role?: string; resendId?: string };
  if (body.resendId) {
    const existing = await prisma.orgInvite.findFirst({
      where: { id: String(body.resendId), orgId: access.orgId, usedAt: null },
    });
    if (!existing) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    const updated = await prisma.orgInvite.update({
      where: { id: existing.id },
      data: {
        expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
        token: crypto.randomUUID().replace(/-/g, ""),
      },
    });
    return NextResponse.json({ invite: inviteDto(updated) });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const role = String(body.role ?? "editor");
  if (!email || !ROLES.has(role)) {
    return NextResponse.json({ error: "email and valid role required" }, { status: 400 });
  }

  const alreadyMember = await prisma.orgMembership.findFirst({
    where: { orgId: access.orgId, user: { email } },
  });
  if (alreadyMember) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  await prisma.orgInvite.deleteMany({
    where: { orgId: access.orgId, email, usedAt: null },
  });

  const invite = await prisma.orgInvite.create({
    data: {
      orgId: access.orgId,
      email,
      role,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return NextResponse.json({ invite: inviteDto(invite) }, { status: 201 });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });

  const existing = await prisma.orgInvite.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  await prisma.orgInvite.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
