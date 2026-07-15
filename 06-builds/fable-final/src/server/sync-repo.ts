// The database side of hybrid sync (Phase 12). Pairing tokens + pull/push for
// org-owned syncable tables. Durable D17 sync_logs written on push apply (F-CORE4).

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "@/db/client";
import {
  announcements,
  displayObjects,
  media,
  memorials,
  minyanSchedules,
  scheduleGroups,
  screens,
  sponsors,
  styles,
  syncDevices,
  tukachinskyNotes,
  zmanimConfigs,
  syncLogs,
} from "@/db/schema";
import { resolveConflict } from "@/core/sync/conflicts";
import type { ConflictStrategy, SyncChange, SyncConflict, SyncableTable } from "@/core/sync/protocol";

// Each syncable table mapped to its Drizzle table. displayObjects is the odd one out
// (it hangs off a style, not an org), so it's filtered through the org's styles.
const TABLES: Record<SyncableTable, SQLiteTable> = {
  scheduleGroups,
  zmanimConfigs,
  minyanSchedules,
  announcements,
  memorials,
  sponsors,
  media,
  styles,
  displayObjects,
  screens,
  tukachinskyNotes,
};

type AnyRow = Record<string, unknown> & { id: string; updatedAt?: Date | number | null };

function ms(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return 0;
}

// ── Pairing tokens ───────────────────────────────────────────────────────────

export type SyncDeviceRow = typeof syncDevices.$inferSelect;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createDevice(orgId: string, name: string): Promise<{ token: string; device: SyncDeviceRow }> {
  const token = `mez_${randomBytes(24).toString("base64url")}`;
  const [device] = await db
    .insert(syncDevices)
    .values({ orgId, name, tokenHash: hashToken(token) })
    .returning();
  return { token, device: device! };
}

export async function listDevices(orgId: string): Promise<SyncDeviceRow[]> {
  return db.select().from(syncDevices).where(eq(syncDevices.orgId, orgId));
}

export async function revokeDevice(orgId: string, deviceId: string): Promise<void> {
  await db
    .update(syncDevices)
    .set({ revokedAt: new Date() })
    .where(and(eq(syncDevices.id, deviceId), eq(syncDevices.orgId, orgId)));
}

export async function authenticateDevice(token: string): Promise<SyncDeviceRow | null> {
  const [device] = await db.select().from(syncDevices).where(eq(syncDevices.tokenHash, hashToken(token))).limit(1);
  if (!device || device.revokedAt) return null;
  await db.update(syncDevices).set({ lastSeenAt: new Date() }).where(eq(syncDevices.id, device.id));
  return device;
}

// ── Data movement ────────────────────────────────────────────────────────────

async function orgStyleIds(orgId: string): Promise<string[]> {
  const rows = await db.select({ id: styles.id }).from(styles).where(eq(styles.orgId, orgId));
  return rows.map((r) => r.id);
}

async function readTable(table: SyncableTable, orgId: string): Promise<AnyRow[]> {
  const drizzleTable = TABLES[table] as unknown as Record<string, unknown>;
  if (table === "displayObjects") {
    const styleIds = await orgStyleIds(orgId);
    if (styleIds.length === 0) return [];
    return db.select().from(displayObjects).where(inArray(displayObjects.styleId, styleIds)) as unknown as Promise<AnyRow[]>;
  }
  const orgCol = drizzleTable["orgId"] as never;
  return db
    .select()
    .from(TABLES[table] as never)
    .where(eq(orgCol, orgId)) as unknown as Promise<AnyRow[]>;
}

export async function pullOrgChanges(orgId: string, since: number): Promise<{ changes: SyncChange[]; cursor: number }> {
  const changes: SyncChange[] = [];
  let cursor = since;
  for (const table of Object.keys(TABLES) as SyncableTable[]) {
    const rows = await readTable(table, orgId);
    for (const row of rows) {
      const updatedAt = ms(row.updatedAt ?? null);
      if (updatedAt <= since) continue;
      changes.push({ table, recordId: row.id, operation: "upsert", data: row, updatedAt });
      if (updatedAt > cursor) cursor = updatedAt;
    }
  }
  if (cursor === since) cursor = Date.now();
  return { changes, cursor };
}

async function existingRow(table: SyncableTable, id: string): Promise<AnyRow | undefined> {
  const idCol = (TABLES[table] as unknown as Record<string, unknown>)["id"] as never;
  const [row] = (await db
    .select()
    .from(TABLES[table] as never)
    .where(eq(idCol, id))
    .limit(1)) as unknown as AnyRow[];
  return row;
}

// Confirm a pushed row really belongs to this org before writing it.
async function belongsToOrg(table: SyncableTable, row: AnyRow, orgId: string, styleIds: Set<string>): Promise<boolean> {
  if (table === "displayObjects") return typeof row.styleId === "string" && styleIds.has(row.styleId);
  if (table === "tukachinskyNotes") return row.orgId === orgId; // never let a device touch the global baseline
  return row.orgId === orgId;
}

export async function applyIncoming(
  orgId: string,
  changes: SyncChange[],
  strategy: ConflictStrategy,
): Promise<{ applied: number; skipped: number; conflicts: SyncConflict[] }> {
  let applied = 0;
  let skipped = 0;
  const conflicts: SyncConflict[] = [];
  const styleIds = new Set(await orgStyleIds(orgId));

  for (const change of changes) {
    const table = TABLES[change.table];
    if (!table) {
      skipped++;
      continue;
    }
    const idCol = (table as unknown as Record<string, unknown>)["id"] as never;

    if (change.operation === "delete") {
      const existing = await existingRow(change.table, change.recordId);
      if (existing && (await belongsToOrg(change.table, existing, orgId, styleIds))) {
        await db.delete(table as never).where(eq(idCol, change.recordId));
        applied++;
        await db.insert(syncLogs).values({
          orgId,
          tableName: change.table,
          recordId: change.recordId,
          operation: "delete",
          data: { id: change.recordId },
          synced: true,
        });
      } else {
        skipped++;
      }
      continue;
    }

    const row = change.data as AnyRow | undefined;
    if (!row || !(await belongsToOrg(change.table, row, orgId, styleIds))) {
      skipped++;
      continue;
    }

    const existing = await existingRow(change.table, change.recordId);
    // The upsert matches on id alone, so a row whose id collides with ANOTHER org's
    // existing row would otherwise overwrite (and re-own) it. Refuse: only update a
    // row that already belongs to this org; otherwise it's a foreign id collision.
    if (existing && !(await belongsToOrg(change.table, existing, orgId, styleIds))) {
      skipped++;
      continue;
    }
    const outcome = resolveConflict(strategy, { updatedAt: change.updatedAt }, existing ? { updatedAt: ms(existing.updatedAt) } : undefined);
    if (outcome === "keep") {
      skipped++;
      conflicts.push({ table: change.table, recordId: change.recordId, resolved: "server" });
      continue;
    }
    if (outcome === "defer") {
      skipped++;
      conflicts.push({ table: change.table, recordId: change.recordId, resolved: "deferred" });
      continue;
    }

    await db
      .insert(table as never)
      .values(row as never)
      .onConflictDoUpdate({ target: idCol, set: row as never });
    applied++;
    if (existing) conflicts.push({ table: change.table, recordId: change.recordId, resolved: "client" });

    // F-CORE4 — durable sync feed (D17), not in-memory only.
    await db.insert(syncLogs).values({
      orgId,
      tableName: change.table,
      recordId: change.recordId,
      operation: existing ? "update" : "create",
      data: (change.data ?? { id: change.recordId }) as never,
      synced: true,
    });
  }

  return { applied, skipped, conflicts };
}
