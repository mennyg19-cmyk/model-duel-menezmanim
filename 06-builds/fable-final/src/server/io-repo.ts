import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  announcements,
  media,
  memorials,
  minyanSchedules,
  scheduleGroups,
  sponsors,
} from "@/db/schema";
import { getEntityDef, type EntityKey } from "@/io/entities";

const TABLES = {
  groups: scheduleGroups,
  minyanim: minyanSchedules,
  announcements,
  memorials,
  sponsors,
  media,
} as const;

async function listRowsByKey(orgId: string, key: EntityKey) {
  switch (key) {
    case "groups":
      return db.select().from(scheduleGroups).where(eq(scheduleGroups.orgId, orgId));
    case "minyanim":
      return db.select().from(minyanSchedules).where(eq(minyanSchedules.orgId, orgId));
    case "announcements":
      return db.select().from(announcements).where(eq(announcements.orgId, orgId));
    case "memorials":
      return db.select().from(memorials).where(eq(memorials.orgId, orgId));
    case "sponsors":
      return db.select().from(sponsors).where(eq(sponsors.orgId, orgId));
    case "media":
      return db.select().from(media).where(eq(media.orgId, orgId));
  }
}

export async function listEntityRows(orgId: string, key: EntityKey): Promise<Record<string, string>[]> {
  const def = getEntityDef(key);
  if (!def) throw new Error(`Unknown type "${key}".`);
  const rows = await listRowsByKey(orgId, key);
  return rows.map((row) => def.toRecord(row as Record<string, unknown>));
}

export type ImportMode = "append" | "replace";

export interface ImportOutcome {
  inserted: number;
  replaced: boolean;
}

export async function importEntityRows(
  orgId: string,
  key: EntityKey,
  records: Record<string, string>[],
  mode: ImportMode,
): Promise<ImportOutcome> {
  const def = getEntityDef(key);
  if (!def) throw new Error(`Unknown type "${key}".`);
  const table = TABLES[key];

  const values = records.map((record, i) => {
    try {
      return def.fromRecord(record, orgId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "invalid row";
      throw new Error(`Row ${i + 1}: ${message}`);
    }
  });

  await db.transaction(async (tx) => {
    if (mode === "replace") {
      await tx.delete(table).where(eq(table.orgId, orgId));
    }
    if (values.length > 0) {
      await tx.insert(table).values(values as never);
    }
  });

  return { inserted: values.length, replaced: mode === "replace" };
}

export interface OrgBackup {
  version: 1;
  exportedAt: string;
  orgId: string;
  groups: unknown[];
  minyanim: unknown[];
  announcements: unknown[];
  memorials: unknown[];
  sponsors: unknown[];
  media: unknown[];
}

export async function buildOrgBackup(orgId: string): Promise<OrgBackup> {
  const [groups, minyanRows, anns, mems, spons, med] = await Promise.all([
    listRowsByKey(orgId, "groups"),
    listRowsByKey(orgId, "minyanim"),
    listRowsByKey(orgId, "announcements"),
    listRowsByKey(orgId, "memorials"),
    listRowsByKey(orgId, "sponsors"),
    listRowsByKey(orgId, "media"),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    orgId,
    groups,
    minyanim: minyanRows,
    announcements: anns,
    memorials: mems,
    sponsors: spons,
    media: med,
  };
}

export interface RestoreOutcome {
  groups: number;
  minyanim: number;
  announcements: number;
  memorials: number;
  sponsors: number;
  media: number;
}

export async function restoreOrgBackup(orgId: string, backup: OrgBackup): Promise<RestoreOutcome> {
  if (backup.version !== 1) throw new Error("Unsupported backup version.");

  const stripIds = (rows: unknown[]): Record<string, unknown>[] =>
    (rows ?? []).map((raw) => {
      const { id: _drop, orgId: _o, createdAt: _c, updatedAt: _u, ...rest } = raw as Record<string, unknown>;
      return { ...rest, orgId };
    });

  const out: RestoreOutcome = { groups: 0, minyanim: 0, announcements: 0, memorials: 0, sponsors: 0, media: 0 };

  await db.transaction(async (tx) => {
    const insertMany = async (table: typeof scheduleGroups, rows: unknown[]): Promise<number> => {
      const values = stripIds(rows);
      if (values.length > 0) await tx.insert(table).values(values as never);
      return values.length;
    };
    out.groups = await insertMany(scheduleGroups, backup.groups);
    out.minyanim = await insertMany(minyanSchedules as never, backup.minyanim);
    out.announcements = await insertMany(announcements as never, backup.announcements);
    out.memorials = await insertMany(memorials as never, backup.memorials);
    out.sponsors = await insertMany(sponsors as never, backup.sponsors);
    out.media = await insertMany(media as never, backup.media);
  });

  return out;
}

export async function listSponsorsRaw(orgId: string) {
  return db.select().from(sponsors).where(eq(sponsors.orgId, orgId));
}

export async function listMemorialsRaw(orgId: string) {
  return db.select().from(memorials).where(eq(memorials.orgId, orgId));
}
