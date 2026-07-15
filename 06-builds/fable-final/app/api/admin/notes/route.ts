import { NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { db } from "@/db/client";
import { tukachinskyNotes } from "@/db/schema";
import { seedBaselineNotes } from "@/admin/content/notes-service";

export const dynamic = "force-dynamic";

/** E22 — super-admin global baseline CRUD. */
export async function GET() {
  try {
    await requireSuperAdmin();
    await seedBaselineNotes();
    const notes = await db
      .select()
      .from(tukachinskyNotes)
      .where(and(isNull(tukachinskyNotes.orgId), eq(tukachinskyNotes.isBaseline, true)))
      .orderBy(asc(tukachinskyNotes.hebrewMonth), asc(tukachinskyNotes.hebrewDay));
    return NextResponse.json({ notes });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = (await request.json().catch(() => null)) as {
      action?: "seed";
      hebrewMonth?: number;
      hebrewDay?: number;
      noteHebrew?: string;
      noteEnglish?: string | null;
      category?: string;
    } | null;

    if (body?.action === "seed") {
      const n = await seedBaselineNotes();
      return NextResponse.json({ ok: true, inserted: n });
    }

    if (!body?.noteHebrew?.trim() || !body.hebrewMonth || !body.hebrewDay) {
      return NextResponse.json({ error: "Fields required." }, { status: 400 });
    }
    const [row] = await db
      .insert(tukachinskyNotes)
      .values({
        orgId: null,
        hebrewMonth: Number(body.hebrewMonth),
        hebrewDay: Number(body.hebrewDay),
        noteHebrew: body.noteHebrew.trim(),
        noteEnglish: body.noteEnglish?.trim() || null,
        category: body.category || "other",
        isBaseline: true,
        isHidden: false,
      })
      .returning();
    return NextResponse.json({ note: row }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
