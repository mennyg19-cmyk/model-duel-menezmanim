import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";

type Ctx = { params: Promise<{ orgId: string }> };

const ROLES = new Set(["owner", "admin", "editor", "viewer"]);

function memberDto(row: {
  id: string;
  role: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}) {
  return {
    id: row.id,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    user: { id: row.user.id, name: row.user.name, email: row.user.email },
  };
}

/** E16 — members list / role change / remove. Owner/admin only for writes. */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const members = await prisma.orgMembership.findMany({
    where: { orgId: access.orgId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ members: members.map(memberDto) });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as { membershipId?: string; role?: string };
  const membershipId = String(body.membershipId ?? "");
  const role = String(body.role ?? "");
  if (!membershipId || !ROLES.has(role)) {
    return NextResponse.json({ error: "membershipId and valid role required" }, { status: 400 });
  }

  const existing = await prisma.orgMembership.findFirst({
    where: { id: membershipId, orgId: access.orgId },
    include: { user: true },
  });
  if (!existing) return NextResponse.json({ error: "Membership not found" }, { status: 404 });

  if (existing.role === "owner" && role !== "owner" && !access.isSuperAdmin) {
    const owners = await prisma.orgMembership.count({ where: { orgId: access.orgId, role: "owner" } });
    if (owners <= 1) {
      return NextResponse.json({ error: "Cannot demote the last owner" }, { status: 400 });
    }
  }

  const updated = await prisma.orgMembership.update({
    where: { id: membershipId },
    data: { role },
    include: { user: true },
  });
  return NextResponse.json({ member: memberDto(updated) });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { admin: true });
  if (isAccessError(access)) return access;

  const membershipId = request.nextUrl.searchParams.get("membershipId") ?? "";
  if (!membershipId) return NextResponse.json({ error: "membershipId query required" }, { status: 400 });

  const existing = await prisma.orgMembership.findFirst({
    where: { id: membershipId, orgId: access.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  if (existing.userId === access.userId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }
  if (existing.role === "owner" && !access.isSuperAdmin) {
    const owners = await prisma.orgMembership.count({ where: { orgId: access.orgId, role: "owner" } });
    if (owners <= 1) {
      return NextResponse.json({ error: "Cannot remove the last owner" }, { status: 400 });
    }
  }

  await prisma.orgMembership.delete({ where: { id: membershipId } });
  return NextResponse.json({ ok: true });
}
