export const CONFLICT_STRATEGIES = [
  "last-write-wins",
  "server-wins",
  "client-wins",
  "manual",
] as const;

export type ConflictStrategy = (typeof CONFLICT_STRATEGIES)[number];
export type SyncOperation = "upsert" | "delete";

export type SyncChange = {
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  data: unknown;
  timestamp: string;
  baseTimestamp?: string | null;
};

export type SyncMessage = SyncChange;

export type SyncBatch = {
  orgId: string;
  strategy: ConflictStrategy;
  changes: SyncMessage[];
};

export type SyncLogEntry = {
  id: string;
  orgId: string;
  tableName: string;
  recordId: string;
  operation: string;
  data: unknown;
  timestamp: string;
  clientTimestamp: string | null;
  synced: boolean;
};

export type SyncPushResult = {
  recordId: string;
  tableName: string;
  status: "applied" | "server-kept" | "manual";
  conflict: boolean;
  entry: SyncLogEntry;
};

export type SyncPullResponse = {
  orgId: string;
  changes: SyncLogEntry[];
  cursor: string | null;
  hasMore: boolean;
};

export type SyncPushResponse = {
  orgId: string;
  strategy: ConflictStrategy;
  results: SyncPushResult[];
};

export type SyncResponse = SyncPullResponse | SyncPushResponse;
