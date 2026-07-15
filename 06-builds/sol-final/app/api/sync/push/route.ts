import { NextRequest, NextResponse } from "next/server";
import { syncServer } from "../../../../src/core/sync/server";
import {
  CONFLICT_STRATEGIES,
  type ConflictStrategy,
  type SyncChange,
  type SyncOperation,
} from "../../../../src/core/sync/types";
import { authorizeSyncRequest, isSyncAccessError } from "../../../../src/server/sync-auth";

const SYNCABLE_TABLES = new Set([
  "Organization",
  "Screen",
  "Style",
  "DisplayObject",
  "ScheduleGroup",
  "ZmanimConfig",
  "MinyanSchedule",
  "Announcement",
  "Memorial",
  "Sponsor",
  "Media",
  "TukachinskyNote",
]);
const MAX_CHANGES = 100;
const MAX_CHANGE_BYTES = 256 * 1_024;

function isConflictStrategy(value: unknown): value is ConflictStrategy {
  return CONFLICT_STRATEGIES.includes(value as ConflictStrategy);
}

function parseChange(value: unknown, index: number): SyncChange {
  if (!value || typeof value !== "object") throw new Error(`changes[${index}] must be an object`);
  const raw = value as Record<string, unknown>;
  const tableName = String(raw.tableName ?? "");
  const recordId = String(raw.recordId ?? "");
  const operation = String(raw.operation ?? "") as SyncOperation;
  const timestamp = String(raw.timestamp ?? "");
  const baseTimestamp =
    raw.baseTimestamp === null || raw.baseTimestamp === undefined ? null : String(raw.baseTimestamp);

  if (!SYNCABLE_TABLES.has(tableName)) {
    throw new Error(`changes[${index}].tableName is not syncable`);
  }
  if (!recordId || recordId.length > 128) {
    throw new Error(`changes[${index}].recordId must be 1–128 characters`);
  }
  if (operation !== "upsert" && operation !== "delete") {
    throw new Error(`changes[${index}].operation must be upsert or delete`);
  }
  const timestampMs = Date.parse(timestamp);
  if (Number.isNaN(timestampMs)) throw new Error(`changes[${index}].timestamp must be ISO-8601`);
  if (timestampMs > Date.now() + 5 * 60 * 1_000) {
    throw new Error(`changes[${index}].timestamp cannot be more than five minutes in the future`);
  }
  if (baseTimestamp && Number.isNaN(Date.parse(baseTimestamp))) {
    throw new Error(`changes[${index}].baseTimestamp must be ISO-8601 or null`);
  }
  if (Buffer.byteLength(JSON.stringify(raw.data ?? null), "utf8") > MAX_CHANGE_BYTES) {
    throw new Error(`changes[${index}].data exceeds 256 KiB`);
  }

  return {
    tableName,
    recordId,
    operation,
    data: raw.data ?? null,
    timestamp: new Date(timestampMs).toISOString(),
    baseTimestamp: baseTimestamp ? new Date(baseTimestamp).toISOString() : null,
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const orgId = String(body.orgId ?? "").trim();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const access = await authorizeSyncRequest(request, orgId, true);
  if (isSyncAccessError(access)) return access;

  const strategy = body.strategy ?? "last-write-wins";
  if (!isConflictStrategy(strategy)) {
    return NextResponse.json(
      { error: `strategy must be one of: ${CONFLICT_STRATEGIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.changes) || body.changes.length < 1 || body.changes.length > MAX_CHANGES) {
    return NextResponse.json(
      { error: `changes must contain 1–${MAX_CHANGES} entries` },
      { status: 400 },
    );
  }

  let changes: SyncChange[];
  try {
    changes = body.changes.map(parseChange);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid sync change" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await syncServer.push(access.orgId, changes, strategy));
  } catch {
    return NextResponse.json({ error: "Sync push could not persist changes" }, { status: 500 });
  }
}
