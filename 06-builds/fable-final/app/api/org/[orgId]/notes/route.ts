import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { tukachinskyNotes } from "@/db/schema";
import { listMergedNotes, seedBaselineNotes } from "@/admin/content/notes-service";

export const dynamic = "force-dynamic";

/** E22 — org notes list (merged baseline + org layer). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    await seedBaselineNotes();
    const data = await listMergedNotes(orgId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

/** Create org note, override, or hide baseline. */
export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      action?: "add" | "override" | "hide";
      baselineId?: string;
      hebrewMonth?: number;
      hebrewDay?: number;
      noteHebrew?: string;
      noteEnglish?: string | null;
      category?: string;
    } | null;

    if (body?.action === "hide" && body.baselineId) {
      const [row] = await db
        .insert(tukachinskyNotes)
        .values({
          orgId,
          hebrewMonth: body.hebrewMonth ?? 1,
          hebrewDay: body.hebrewDay ?? 1,
          noteHebrew: "(hidden)",
          noteEnglish: null,
          category: "other",
          isBaseline: false,
          isHidden: true,
          baselineId: body.baselineId,
        })
        .returning();
      return NextResponse.json({ note: row }, { status: 201 });
    }

    if (body?.action === "override" && body.baselineId && body.noteHebrew?.trim()) {
      const [row] = await db
        .insert(tukachinskyNotes)
        .values({
          orgId,
          hebrewMonth: body.hebrewMonth ?? 1,
          hebrewDay: body.hebrewDay ?? 1,
          noteHebrew: body.noteHebrew.trim(),
          noteEnglish: body.noteEnglish?.trim() || null,
          category: body.category || "other",
          isBaseline: false,
          isHidden: false,
          baselineId: body.baselineId,
        })
        .returning();
      return NextResponse.json({ note: row }, { status: 201 });
    }

    if (!body?.noteHebrew?.trim() || !body.hebrewMonth || !body.hebrewDay) {
      return NextResponse.json({ error: "noteHebrew, hebrewMonth, hebrewDay required." }, { status: 400 });
    }
    const [row] = await db
      .insert(tukachinskyNotes)
      .values({
        orgId,
        hebrewMonth: Number(body.hebrewMonth),
        hebrewDay: Number(body.hebrewDay),
        noteHebrew: body.noteHebrew.trim(),
        noteEnglish: body.noteEnglish?.trim() || null,
        category: body.category || "other",
        isBaseline: false,
        isHidden: false,
        baselineId: null,
      })
      .returning();
    return NextResponse.json({ note: row }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
