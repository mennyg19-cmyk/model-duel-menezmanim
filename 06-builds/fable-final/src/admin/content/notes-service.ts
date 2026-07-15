import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { tukachinskyNotes } from "@/db/schema";
import { TUKACHINSKY_NOTES } from "@/core/tukachinsky-notes";

function mapCategory(c: string): string {
  if (c === "halacha") return "other";
  if (c === "seasonal") return "calendar";
  if (c === "tefillah" || c === "minhag") return c;
  return "other";
}

/** Seed global baseline from C6 (F-DB3 / OP6). Idempotent. */
export async function seedBaselineNotes(): Promise<number> {
  const existing = await db
    .select({ id: tukachinskyNotes.id })
    .from(tukachinskyNotes)
    .where(and(isNull(tukachinskyNotes.orgId), eq(tukachinskyNotes.isBaseline, true)))
    .limit(1);
  if (existing.length) return 0;

  let n = 0;
  for (const note of TUKACHINSKY_NOTES) {
    await db.insert(tukachinskyNotes).values({
      orgId: null,
      hebrewMonth: note.hebrewMonth,
      hebrewDay: note.hebrewDay,
      noteHebrew: note.noteHebrew,
      noteEnglish: note.noteEnglish,
      category: mapCategory(note.category),
      isBaseline: true,
      isHidden: false,
      baselineId: null,
    });
    n++;
  }
  return n;
}

export async function listMergedNotes(orgId: string) {
  const baseline = await db
    .select()
    .from(tukachinskyNotes)
    .where(and(isNull(tukachinskyNotes.orgId), eq(tukachinskyNotes.isBaseline, true)))
    .orderBy(asc(tukachinskyNotes.hebrewMonth), asc(tukachinskyNotes.hebrewDay));

  const orgNotes = await db
    .select()
    .from(tukachinskyNotes)
    .where(eq(tukachinskyNotes.orgId, orgId))
    .orderBy(asc(tukachinskyNotes.hebrewMonth), asc(tukachinskyNotes.hebrewDay));

  const hiddenBaselineIds = new Set(
    orgNotes.filter((n) => n.isHidden && n.baselineId).map((n) => n.baselineId!),
  );
  const overridesByBaseline = new Map(
    orgNotes.filter((n) => n.baselineId && !n.isHidden).map((n) => [n.baselineId!, n]),
  );

  const merged = [];
  for (const b of baseline) {
    if (hiddenBaselineIds.has(b.id)) {
      merged.push({ ...b, _source: "hidden" as const });
      continue;
    }
    const over = overridesByBaseline.get(b.id);
    if (over) merged.push({ ...over, _source: "override" as const, _baselineId: b.id });
    else merged.push({ ...b, _source: "baseline" as const });
  }
  for (const n of orgNotes) {
    if (!n.baselineId && !n.isHidden) merged.push({ ...n, _source: "org" as const });
  }

  return { baseline, orgNotes, merged };
}
