import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { RecurrenceRule } from "@/db/json";
import { sponsors } from "@/db/schema";

export const dynamic = "force-dynamic";

function ser(row: typeof sponsors.$inferSelect) {
  return {
    ...row,
    civilDate: row.civilDate ? row.civilDate.toISOString() : null,
  };
}

/** E11 — sponsors list/create. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.orgId, orgId))
      .orderBy(asc(sponsors.sponsorName));
    return NextResponse.json({ sponsors: rows.map(ser) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      type?: string;
      sponsorName?: string;
      hebrewText?: string | null;
      englishText?: string | null;
      hebrewDate?: string | null;
      civilDate?: string | null;
      isRecurring?: boolean;
      recurrenceRule?: RecurrenceRule | null;
      isActive?: boolean;
    } | null;
    if (!body?.sponsorName?.trim() || !body?.type?.trim()) {
      return NextResponse.json({ error: "Type and sponsor name required." }, { status: 400 });
    }
    const [row] = await db
      .insert(sponsors)
      .values({
        orgId,
        type: body.type.trim(),
        sponsorName: body.sponsorName.trim(),
        hebrewText: body.hebrewText?.trim() || null,
        englishText: body.englishText?.trim() || null,
        hebrewDate: body.hebrewDate?.trim() || null,
        civilDate: body.civilDate ? new Date(body.civilDate) : null,
        isRecurring: body.isRecurring ?? false,
        recurrenceRule: body.recurrenceRule ?? null,
        isActive: body.isActive ?? true,
      })
      .returning();
    return NextResponse.json({ sponsor: row ? ser(row) : null }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
