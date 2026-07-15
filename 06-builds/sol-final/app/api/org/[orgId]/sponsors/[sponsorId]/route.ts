import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { sponsorDto } from "../../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string; sponsorId: string }> };

function parseCivilDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId, sponsorId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const row = await prisma.sponsor.findFirst({ where: { id: sponsorId, orgId: access.orgId } });
  if (!row) return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  return NextResponse.json({ sponsor: sponsorDto(row) });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId, sponsorId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.sponsor.findFirst({ where: { id: sponsorId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  const body = (await request.json()) as Record<string, unknown>;
  const civilDate = parseCivilDate(body.civilDate);
  const row = await prisma.sponsor.update({
    where: { id: sponsorId },
    data: {
      type: body.type !== undefined ? String(body.type) : existing.type,
      sponsorName: body.sponsorName !== undefined ? String(body.sponsorName) : existing.sponsorName,
      hebrewText: body.hebrewText !== undefined ? (body.hebrewText as string | null) : existing.hebrewText,
      englishText: body.englishText !== undefined ? (body.englishText as string | null) : existing.englishText,
      hebrewDate: body.hebrewDate !== undefined ? (body.hebrewDate as string | null) : existing.hebrewDate,
      civilDate: civilDate !== undefined ? civilDate : existing.civilDate,
      isRecurring: body.isRecurring !== undefined ? Boolean(body.isRecurring) : existing.isRecurring,
      recurrenceRule:
        body.recurrenceRule !== undefined ? (body.recurrenceRule as string | null) : existing.recurrenceRule,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    },
  });
  return NextResponse.json({ sponsor: sponsorDto(row) });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId, sponsorId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const existing = await prisma.sponsor.findFirst({ where: { id: sponsorId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  await prisma.sponsor.delete({ where: { id: sponsorId } });
  return NextResponse.json({ ok: true });
}
