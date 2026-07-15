import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { memorials } from "@/db/schema";

export const dynamic = "force-dynamic";

type Body = {
  hebrewName?: string;
  englishName?: string | null;
  hebrewFamilyName?: string | null;
  hebrewBenBat?: string | null;
  relationship?: string | null;
  donorInfo?: string | null;
  hebrewYear?: number | null;
  hebrewMonth?: number;
  hebrewDay?: number;
  hebrewAdar?: number;
  civilDate?: string | null;
  isYahrzeit?: boolean;
  notes?: string | null;
  isActive?: boolean;
};

function ser(row: typeof memorials.$inferSelect) {
  return {
    ...row,
    civilDate: row.civilDate ? row.civilDate.toISOString() : null,
  };
}

/** E10 — memorials list/create. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select()
      .from(memorials)
      .where(eq(memorials.orgId, orgId))
      .orderBy(asc(memorials.hebrewMonth), asc(memorials.hebrewDay), asc(memorials.hebrewName));
    return NextResponse.json({ memorials: rows.map(ser) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body?.hebrewName?.trim() || !body.hebrewMonth || !body.hebrewDay) {
      return NextResponse.json({ error: "Hebrew name, month, and day required." }, { status: 400 });
    }
    const [row] = await db
      .insert(memorials)
      .values({
        orgId,
        hebrewName: body.hebrewName.trim(),
        englishName: body.englishName?.trim() || null,
        hebrewFamilyName: body.hebrewFamilyName?.trim() || null,
        hebrewBenBat: body.hebrewBenBat?.trim() || null,
        relationship: body.relationship?.trim() || null,
        donorInfo: body.donorInfo?.trim() || null,
        hebrewYear: body.hebrewYear ?? null,
        hebrewMonth: Number(body.hebrewMonth),
        hebrewDay: Number(body.hebrewDay),
        hebrewAdar: body.hebrewAdar ?? 0,
        civilDate: body.civilDate ? new Date(body.civilDate) : null,
        isYahrzeit: body.isYahrzeit ?? true,
        notes: body.notes?.trim() || null,
        isActive: body.isActive ?? true,
      })
      .returning();
    return NextResponse.json({ memorial: row ? ser(row) : null }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
