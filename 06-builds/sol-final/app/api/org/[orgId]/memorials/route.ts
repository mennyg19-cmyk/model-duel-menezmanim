import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { memorialDto } from "../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

function parseCivilDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;

  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const rows = await prisma.memorial.findMany({
    where: { orgId: access.orgId },
    orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }, { hebrewName: "asc" }],
  });
  const filtered = q
    ? rows.filter(
        (r) =>
          r.hebrewName.toLowerCase().includes(q) ||
          (r.englishName ?? "").toLowerCase().includes(q) ||
          (r.relationship ?? "").toLowerCase().includes(q) ||
          (r.hebrewFamilyName ?? "").toLowerCase().includes(q),
      )
    : rows;
  return NextResponse.json({ memorials: filtered.map(memorialDto) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const hebrewName = String(body.hebrewName ?? "").trim();
  if (!hebrewName) return NextResponse.json({ error: "hebrewName required" }, { status: 400 });

  const row = await prisma.memorial.create({
    data: {
      orgId: access.orgId,
      hebrewName,
      englishName: (body.englishName as string | null) ?? null,
      hebrewFamilyName: (body.hebrewFamilyName as string | null) ?? null,
      hebrewBenBat: (body.hebrewBenBat as string | null) ?? null,
      hebrewYear: body.hebrewYear != null ? Number(body.hebrewYear) : null,
      hebrewMonth: Number(body.hebrewMonth ?? 1),
      hebrewDay: Number(body.hebrewDay ?? 1),
      hebrewAdar: Number(body.hebrewAdar ?? 0),
      civilDate: parseCivilDate(body.civilDate),
      isYahrzeit: body.isYahrzeit !== false,
      donorInfo: (body.donorInfo as string | null) ?? null,
      notes: (body.notes as string | null) ?? null,
      relationship: (body.relationship as string | null) ?? null,
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json({ memorial: memorialDto(row) }, { status: 201 });
}
