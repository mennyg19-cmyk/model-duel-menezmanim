import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { memorials } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; memorialId: string }> },
) {
  try {
    const { orgId, memorialId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(memorials)
      .where(and(eq(memorials.id, memorialId), eq(memorials.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [row] = await db
      .update(memorials)
      .set({
        hebrewName: typeof body.hebrewName === "string" ? body.hebrewName.trim() : existing.hebrewName,
        englishName:
          body.englishName !== undefined
            ? ((body.englishName as string | null)?.trim() || null)
            : existing.englishName,
        hebrewFamilyName:
          body.hebrewFamilyName !== undefined
            ? ((body.hebrewFamilyName as string | null)?.trim() || null)
            : existing.hebrewFamilyName,
        hebrewBenBat:
          body.hebrewBenBat !== undefined
            ? ((body.hebrewBenBat as string | null)?.trim() || null)
            : existing.hebrewBenBat,
        relationship:
          body.relationship !== undefined
            ? ((body.relationship as string | null)?.trim() || null)
            : existing.relationship,
        donorInfo:
          body.donorInfo !== undefined ? ((body.donorInfo as string | null)?.trim() || null) : existing.donorInfo,
        hebrewYear: body.hebrewYear !== undefined ? (body.hebrewYear as number | null) : existing.hebrewYear,
        hebrewMonth: typeof body.hebrewMonth === "number" ? body.hebrewMonth : existing.hebrewMonth,
        hebrewDay: typeof body.hebrewDay === "number" ? body.hebrewDay : existing.hebrewDay,
        hebrewAdar: typeof body.hebrewAdar === "number" ? body.hebrewAdar : existing.hebrewAdar,
        civilDate:
          body.civilDate !== undefined
            ? body.civilDate
              ? new Date(body.civilDate as string)
              : null
            : existing.civilDate,
        isYahrzeit: typeof body.isYahrzeit === "boolean" ? body.isYahrzeit : existing.isYahrzeit,
        notes: body.notes !== undefined ? ((body.notes as string | null)?.trim() || null) : existing.notes,
        isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      })
      .where(and(eq(memorials.id, memorialId), eq(memorials.orgId, orgId)))
      .returning();

    return NextResponse.json({
      memorial: row
        ? { ...row, civilDate: row.civilDate ? row.civilDate.toISOString() : null }
        : null,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; memorialId: string }> },
) {
  try {
    const { orgId, memorialId } = await params;
    await requireOrgRole(orgId, "editor");
    const deleted = await db
      .delete(memorials)
      .where(and(eq(memorials.id, memorialId), eq(memorials.orgId, orgId)))
      .returning({ id: memorials.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
