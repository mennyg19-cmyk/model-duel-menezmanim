import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { db } from "@/db/client";
import { tukachinskyNotes } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> },
) {
  try {
    await requireSuperAdmin();
    const { noteId } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(tukachinskyNotes)
      .where(and(eq(tukachinskyNotes.id, noteId), isNull(tukachinskyNotes.orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [row] = await db
      .update(tukachinskyNotes)
      .set({
        noteHebrew: typeof body.noteHebrew === "string" ? body.noteHebrew.trim() : existing.noteHebrew,
        noteEnglish:
          body.noteEnglish !== undefined
            ? ((body.noteEnglish as string | null)?.trim() || null)
            : existing.noteEnglish,
        category: typeof body.category === "string" ? body.category : existing.category,
        hebrewMonth: typeof body.hebrewMonth === "number" ? body.hebrewMonth : existing.hebrewMonth,
        hebrewDay: typeof body.hebrewDay === "number" ? body.hebrewDay : existing.hebrewDay,
      })
      .where(eq(tukachinskyNotes.id, noteId))
      .returning();

    return NextResponse.json({ note: row });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ noteId: string }> },
) {
  try {
    await requireSuperAdmin();
    const { noteId } = await params;
    const deleted = await db
      .delete(tukachinskyNotes)
      .where(and(eq(tukachinskyNotes.id, noteId), isNull(tukachinskyNotes.orgId)))
      .returning({ id: tukachinskyNotes.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
