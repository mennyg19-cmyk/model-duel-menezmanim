import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { sponsorDto } from "../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

function parseCivilDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const rows = await prisma.sponsor.findMany({
    where: { orgId: access.orgId },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json({ sponsors: rows.map(sponsorDto) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const sponsorName = String(body.sponsorName ?? "").trim();
  if (!sponsorName) return NextResponse.json({ error: "sponsorName required" }, { status: 400 });

  const row = await prisma.sponsor.create({
    data: {
      orgId: access.orgId,
      type: String(body.type ?? "general"),
      sponsorName,
      hebrewText: (body.hebrewText as string | null) ?? null,
      englishText: (body.englishText as string | null) ?? null,
      hebrewDate: (body.hebrewDate as string | null) ?? null,
      civilDate: parseCivilDate(body.civilDate),
      isRecurring: Boolean(body.isRecurring),
      recurrenceRule: (body.recurrenceRule as string | null) ?? null,
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json({ sponsor: sponsorDto(row) }, { status: 201 });
}
