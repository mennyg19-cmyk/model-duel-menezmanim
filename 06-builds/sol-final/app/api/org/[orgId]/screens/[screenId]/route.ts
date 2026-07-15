import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";

type Ctx = { params: Promise<{ orgId: string; screenId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId, screenId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const row = await prisma.screen.findFirst({ where: { id: screenId, orgId: access.orgId } });
  if (!row) return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  return NextResponse.json({
    screen: {
      ...row,
      styleSchedules: row.styleSchedules ? JSON.parse(row.styleSchedules) : null,
      lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId, screenId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.screen.findFirst({ where: { id: screenId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  await prisma.screen.delete({ where: { id: screenId } });
  return NextResponse.json({ ok: true });
}
