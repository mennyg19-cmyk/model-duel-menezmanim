import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/db/client";
import { requireSuperAdmin } from "../../../../src/domain/super-admin";

/** E21 / F12 — users list + real actions (setSuperAdmin, removeMembership). */
export async function GET() {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      memberships: { include: { organization: true } },
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isSuperAdmin: u.isSuperAdmin,
      memberships: u.memberships.map((m) => ({
        id: m.id,
        role: m.role,
        orgId: m.orgId,
        orgSlug: m.organization.slug,
        orgName: m.organization.name,
        orgStatus: m.organization.status,
      })),
      createdAt: u.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const body = (await request.json()) as {
    action?: string;
    userId?: string;
    isSuperAdmin?: boolean;
    membershipId?: string;
  };

  if (body.action === "setSuperAdmin") {
    const userId = String(body.userId ?? "");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (userId === access.userId && body.isSuperAdmin === false) {
      return NextResponse.json({ error: "Cannot remove your own super-admin flag" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: Boolean(body.isSuperAdmin) },
    });
    return NextResponse.json({ user: { id: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin } });
  }

  if (body.action === "removeMembership") {
    const membershipId = String(body.membershipId ?? "");
    if (!membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });
    await prisma.orgMembership.delete({ where: { id: membershipId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
