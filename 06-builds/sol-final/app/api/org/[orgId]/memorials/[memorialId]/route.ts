import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { memorialDto } from "../../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string; memorialId: string }> };

function parseCivilDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId, memorialId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const row = await prisma.memorial.findFirst({ where: { id: memorialId, orgId: access.orgId } });
  if (!row) return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  return NextResponse.json({ memorial: memorialDto(row) });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId, memorialId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.memorial.findFirst({ where: { id: memorialId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Memorial not found" }, { status: 404 });

  const body = (await request.json()) as Record<string, unknown>;
  const civilDate = parseCivilDate(body.civilDate);
  const row = await prisma.memorial.update({
    where: { id: memorialId },
    data: {
      hebrewName: body.hebrewName !== undefined ? String(body.hebrewName) : existing.hebrewName,
      englishName: body.englishName !== undefined ? (body.englishName as string | null) : existing.englishName,
      hebrewFamilyName:
        body.hebrewFamilyName !== undefined ? (body.hebrewFamilyName as string | null) : existing.hebrewFamilyName,
      hebrewBenBat: body.hebrewBenBat !== undefined ? (body.hebrewBenBat as string | null) : existing.hebrewBenBat,
      hebrewYear: body.hebrewYear !== undefined ? (body.hebrewYear == null ? null : Number(body.hebrewYear)) : existing.hebrewYear,
      hebrewMonth: body.hebrewMonth !== undefined ? Number(body.hebrewMonth) : existing.hebrewMonth,
      hebrewDay: body.hebrewDay !== undefined ? Number(body.hebrewDay) : existing.hebrewDay,
      hebrewAdar: body.hebrewAdar !== undefined ? Number(body.hebrewAdar) : existing.hebrewAdar,
      civilDate: civilDate !== undefined ? civilDate : existing.civilDate,
      isYahrzeit: body.isYahrzeit !== undefined ? Boolean(body.isYahrzeit) : existing.isYahrzeit,
      donorInfo: body.donorInfo !== undefined ? (body.donorInfo as string | null) : existing.donorInfo,
      notes: body.notes !== undefined ? (body.notes as string | null) : existing.notes,
      relationship: body.relationship !== undefined ? (body.relationship as string | null) : existing.relationship,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    },
  });
  return NextResponse.json({ memorial: memorialDto(row) });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId, memorialId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.memorial.findFirst({ where: { id: memorialId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  await prisma.memorial.delete({ where: { id: memorialId } });
  return NextResponse.json({ ok: true });
}
