import { unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { mediaDto } from "../../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string; mediaId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId, mediaId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const row = await prisma.media.findFirst({ where: { id: mediaId, orgId: access.orgId } });
  if (!row) return NextResponse.json({ error: "Media not found" }, { status: 404 });
  return NextResponse.json({ media: mediaDto(row) });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId, mediaId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.media.findFirst({ where: { id: mediaId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });
  const body = (await request.json()) as Record<string, unknown>;
  const row = await prisma.media.update({
    where: { id: mediaId },
    data: {
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
      scheduleRules:
        body.scheduleRules !== undefined
          ? body.scheduleRules == null
            ? null
            : JSON.stringify(body.scheduleRules)
          : existing.scheduleRules,
      originalName:
        body.originalName !== undefined ? String(body.originalName) : existing.originalName,
    },
  });
  return NextResponse.json({ media: mediaDto(row) });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId, mediaId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.media.findFirst({ where: { id: mediaId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });
  try {
    await unlink(path.join(process.cwd(), "public", existing.filePath));
  } catch {
    /* ignore */
  }
  await prisma.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ ok: true });
}
