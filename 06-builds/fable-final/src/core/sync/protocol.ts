// === What's in this file ===
// The shapes the cloud and a paired desktop/display device exchange when they sync
// (C12). Pure types + a couple of constants — no DB, no network, so both sides and
// the tests share one definition.
//
// A "syncable table" is one whose rows belong to an org and travel between machines
// (schedules, content, styles, screens — NOT users/auth/locks). Each row trip is a
// SyncChange: the table, the row id, what happened, the full row, and when it last
// changed (so last-write-wins can compare).
//
// SYNCABLE_TABLES -- the allow-list of table names that may sync.
// ConflictStrategy -- how to settle a row that changed on both sides.
// SyncChange / SyncPullResponse / SyncPushRequest / SyncPushResponse -- the messages.

export const SYNCABLE_TABLES = [
  "scheduleGroups",
  "zmanimConfigs",
  "minyanSchedules",
  "announcements",
  "memorials",
  "sponsors",
  "media",
  "styles",
  "displayObjects",
  "screens",
  "tukachinskyNotes",
] as const;

export type SyncableTable = (typeof SYNCABLE_TABLES)[number];

export function isSyncableTable(name: string): name is SyncableTable {
  return (SYNCABLE_TABLES as readonly string[]).includes(name);
}

export type SyncOperation = "upsert" | "delete";

export type ConflictStrategy = "last-write-wins" | "server-wins" | "client-wins" | "manual";

export interface SyncChange {
  table: SyncableTable;
  recordId: string;
  operation: SyncOperation;
  /** The full row (for upsert). Omitted/ignored for delete. */
  data?: Record<string, unknown>;
  /** Milliseconds since epoch of the row's last change, used by last-write-wins. */
  updatedAt: number;
}

export interface SyncPullResponse {
  changes: SyncChange[];
  /** Pass this back as `since` next time to get only newer rows. */
  cursor: number;
}

export interface SyncPushRequest {
  strategy: ConflictStrategy;
  changes: SyncChange[];
}

export interface SyncConflict {
  table: SyncableTable;
  recordId: string;
  /** Who won when both sides changed the same row. */
  resolved: "server" | "client" | "deferred";
}

export interface SyncPushResponse {
  applied: number;
  skipped: number;
  conflicts: SyncConflict[];
  cursor: number;
}
