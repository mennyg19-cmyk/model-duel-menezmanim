import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { RecurrenceRule } from "@/db/json";
import { sponsors } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; sponsorId: string }> },
) {
  try {
    const { orgId, sponsorId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(sponsors)
      .where(and(eq(sponsors.id, sponsorId), eq(sponsors.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [row] = await db
      .update(sponsors)
      .set({
        type: typeof body.type === "string" ? body.type.trim() : existing.type,
        sponsorName: typeof body.sponsorName === "string" ? body.sponsorName.trim() : existing.sponsorName,
        hebrewText:
          body.hebrewText !== undefined
            ? ((body.hebrewText as string | null)?.trim() || null)
            : existing.hebrewText,
        englishText:
          body.englishText !== undefined
            ? ((body.englishText as string | null)?.trim() || null)
            : existing.englishText,
        hebrewDate:
          body.hebrewDate !== undefined
            ? ((body.hebrewDate as string | null)?.trim() || null)
            : existing.hebrewDate,
        civilDate:
          body.civilDate !== undefined
            ? body.civilDate
              ? new Date(body.civilDate as string)
              : null
            : existing.civilDate,
        isRecurring: typeof body.isRecurring === "boolean" ? body.isRecurring : existing.isRecurring,
        recurrenceRule:
          body.recurrenceRule !== undefined
            ? (body.recurrenceRule as RecurrenceRule | null)
            : existing.recurrenceRule,
        isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      })
      .where(and(eq(sponsors.id, sponsorId), eq(sponsors.orgId, orgId)))
      .returning();

    return NextResponse.json({
      sponsor: row ? { ...row, civilDate: row.civilDate ? row.civilDate.toISOString() : null } : null,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; sponsorId: string }> },
) {
  try {
    const { orgId, sponsorId } = await params;
    await requireOrgRole(orgId, "editor");
    const deleted = await db
      .delete(sponsors)
      .where(and(eq(sponsors.id, sponsorId), eq(sponsors.orgId, orgId)))
      .returning({ id: sponsors.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
