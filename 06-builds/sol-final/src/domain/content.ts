import type { Announcement, Memorial, Sponsor, Media, TukachinskyNote } from "@prisma/client";
import { prisma } from "../db/client";
import { TUKACHINSKY_NOTES } from "../core/tukachinsky-content";

export function announcementDto(row: Announcement) {
  return {
    id: row.id,
    orgId: row.orgId,
    title: row.title,
    titleHebrew: row.titleHebrew,
    content: row.content,
    contentHebrew: row.contentHebrew,
    scheduleRules: row.scheduleRules ? safeJson(row.scheduleRules) : null,
    priority: row.priority,
    isActive: row.isActive,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function memorialDto(row: Memorial) {
  return {
    id: row.id,
    orgId: row.orgId,
    hebrewName: row.hebrewName,
    englishName: row.englishName,
    hebrewFamilyName: row.hebrewFamilyName,
    hebrewBenBat: row.hebrewBenBat,
    hebrewYear: row.hebrewYear,
    hebrewMonth: row.hebrewMonth,
    hebrewDay: row.hebrewDay,
    hebrewAdar: row.hebrewAdar,
    civilDate: row.civilDate?.toISOString() ?? null,
    isYahrzeit: row.isYahrzeit,
    donorInfo: row.donorInfo,
    notes: row.notes,
    relationship: row.relationship,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function sponsorDto(row: Sponsor) {
  return {
    id: row.id,
    orgId: row.orgId,
    type: row.type,
    sponsorName: row.sponsorName,
    hebrewText: row.hebrewText,
    englishText: row.englishText,
    hebrewDate: row.hebrewDate,
    civilDate: row.civilDate?.toISOString() ?? null,
    isRecurring: row.isRecurring,
    recurrenceRule: row.recurrenceRule,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mediaDto(row: Media) {
  return {
    id: row.id,
    orgId: row.orgId,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    fileSize: row.fileSize,
    filePath: row.filePath,
    publicUrl: row.filePath.startsWith("uploads/") ? `/${row.filePath.replace(/\\/g, "/")}` : row.filePath,
    scheduleRules: row.scheduleRules ? safeJson(row.scheduleRules) : null,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function noteDto(row: TukachinskyNote) {
  return {
    id: row.id,
    orgId: row.orgId,
    overridesNoteId: row.overridesNoteId,
    hebrewMonth: row.hebrewMonth,
    hebrewDay: row.hebrewDay,
    noteHebrew: row.noteHebrew,
    noteEnglish: row.noteEnglish,
    category: row.category,
    source: row.source,
    isActive: row.isActive,
    isHidden: row.isHidden,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** OP6 merge: global baseline + org add/override/hide. */
export type MergedNote = ReturnType<typeof noteDto> & {
  origin: "global" | "org" | "override";
  hiddenByOrg: boolean;
  baselineId: string | null;
};

export async function mergeNotesForOrg(orgId: string): Promise<MergedNote[]> {
  const [globals, orgNotes] = await Promise.all([
    prisma.tukachinskyNote.findMany({
      where: { orgId: null, isActive: true },
      orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }, { category: "asc" }],
    }),
    prisma.tukachinskyNote.findMany({
      where: { orgId },
      orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }],
    }),
  ]);

  const hideIds = new Set(
    orgNotes.filter((n) => n.isHidden && n.overridesNoteId).map((n) => n.overridesNoteId as string),
  );
  const overrides = new Map(
    orgNotes
      .filter((n) => !n.isHidden && n.overridesNoteId)
      .map((n) => [n.overridesNoteId as string, n]),
  );
  const orgOnly = orgNotes.filter((n) => !n.overridesNoteId && n.isActive && !n.isHidden);

  const merged: MergedNote[] = [];

  for (const g of globals) {
    if (hideIds.has(g.id)) {
      const hideRow = orgNotes.find((n) => n.overridesNoteId === g.id && n.isHidden);
      merged.push({
        ...noteDto(hideRow ?? g),
        id: hideRow?.id ?? g.id,
        orgId,
        overridesNoteId: g.id,
        isHidden: true,
        origin: "override",
        hiddenByOrg: true,
        baselineId: g.id,
        noteHebrew: g.noteHebrew,
        noteEnglish: g.noteEnglish,
        hebrewMonth: g.hebrewMonth,
        hebrewDay: g.hebrewDay,
        category: g.category,
        source: g.source,
      });
      continue;
    }
    const over = overrides.get(g.id);
    if (over) {
      merged.push({
        ...noteDto(over),
        origin: "override",
        hiddenByOrg: false,
        baselineId: g.id,
      });
    } else {
      merged.push({
        ...noteDto(g),
        origin: "global",
        hiddenByOrg: false,
        baselineId: g.id,
      });
    }
  }

  for (const n of orgOnly) {
    merged.push({
      ...noteDto(n),
      origin: "org",
      hiddenByOrg: false,
      baselineId: null,
    });
  }

  return merged.sort(
    (a, b) =>
      a.hebrewMonth - b.hebrewMonth ||
      a.hebrewDay - b.hebrewDay ||
      a.category.localeCompare(b.category),
  );
}

export async function seedGlobalNotesFromCore() {
  const existing = await prisma.tukachinskyNote.count({ where: { orgId: null } });
  if (existing > 0) {
    await prisma.tukachinskyNote.deleteMany({ where: { orgId: null } });
  }
  await prisma.tukachinskyNote.createMany({
    data: TUKACHINSKY_NOTES.map((note) => ({
      orgId: null,
      hebrewMonth: note.hebrewMonth,
      hebrewDay: note.hebrewDay,
      noteHebrew: note.noteHebrew,
      noteEnglish: note.noteEnglish,
      category: note.category,
      source: note.source ?? null,
      isActive: true,
      isHidden: false,
    })),
  });
  return prisma.tukachinskyNote.count({ where: { orgId: null } });
}
