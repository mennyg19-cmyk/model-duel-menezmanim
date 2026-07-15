import type { SyncLog } from "@prisma/client";
import { prisma } from "../../db/client";
import type {
  ConflictStrategy,
  SyncChange,
  SyncLogEntry,
  SyncPullResponse,
  SyncPushResponse,
  SyncPushResult,
} from "./types";

type PullCursor = { timestamp: string; id: string };

function parseData(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toEntry(row: SyncLog, synced = row.synced): SyncLogEntry {
  return {
    id: row.id,
    orgId: row.orgId,
    tableName: row.tableName,
    recordId: row.recordId,
    operation: row.operation,
    data: parseData(row.data),
    timestamp: row.timestamp.toISOString(),
    clientTimestamp: row.clientTimestamp?.toISOString() ?? null,
    synced,
  };
}

function encodeCursor(row: SyncLog): string {
  return Buffer.from(
    JSON.stringify({ timestamp: row.timestamp.toISOString(), id: row.id } satisfies PullCursor),
  ).toString("base64url");
}

function decodeCursor(cursor: string): PullCursor {
  const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<PullCursor>;
  if (!decoded.timestamp || !decoded.id || Number.isNaN(Date.parse(decoded.timestamp))) {
    throw new Error("Invalid sync cursor");
  }
  return { timestamp: decoded.timestamp, id: decoded.id };
}

export class DurableSyncServer {
  async pull(orgId: string, cursor: string | null, limit: number): Promise<SyncPullResponse> {
    const decoded = cursor ? decodeCursor(cursor) : null;
    const rows = await prisma.syncLog.findMany({
      where: {
        orgId,
        ...(decoded
          ? {
              OR: [
                { timestamp: { gt: new Date(decoded.timestamp) } },
                { timestamp: new Date(decoded.timestamp), id: { gt: decoded.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ timestamp: "asc" }, { id: "asc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    if (page.length) {
      await prisma.syncLog.updateMany({
        where: { id: { in: page.map((row) => row.id) } },
        data: { synced: true },
      });
    }

    return {
      orgId,
      changes: page.map((row) => toEntry(row, true)),
      cursor: page.length ? encodeCursor(page[page.length - 1]) : cursor,
      hasMore,
    };
  }

  async push(
    orgId: string,
    changes: SyncChange[],
    strategy: ConflictStrategy,
  ): Promise<SyncPushResponse> {
    const results: SyncPushResult[] = [];
    for (const change of changes) {
      results.push(await this.pushChange(orgId, change, strategy));
    }
    return { orgId, strategy, results };
  }

  private async pushChange(
    orgId: string,
    change: SyncChange,
    strategy: ConflictStrategy,
  ): Promise<SyncPushResult> {
    const latest = await prisma.syncLog.findFirst({
      where: {
        orgId,
        tableName: change.tableName,
        recordId: change.recordId,
        operation: { not: "conflict" },
      },
      orderBy: [{ timestamp: "desc" }, { id: "desc" }],
    });
    const conflict = Boolean(
      latest && (!change.baseTimestamp || latest.timestamp.toISOString() !== change.baseTimestamp),
    );

    if (conflict && strategy === "manual") {
      const conflictRow = await prisma.syncLog.create({
        data: {
          orgId,
          tableName: change.tableName,
          recordId: change.recordId,
          operation: "conflict",
          data: JSON.stringify({
            incoming: change,
            server: latest ? toEntry(latest) : null,
          }),
          timestamp: new Date(),
          clientTimestamp: new Date(change.timestamp),
          synced: false,
        },
      });
      return {
        recordId: change.recordId,
        tableName: change.tableName,
        status: "manual",
        conflict: true,
        entry: toEntry(conflictRow),
      };
    }

    const serverWins =
      conflict &&
      (strategy === "server-wins" ||
        (strategy === "last-write-wins" &&
          latest !== null &&
          new Date(change.timestamp).getTime() <=
            (latest.clientTimestamp ?? latest.timestamp).getTime()));
    if (serverWins && latest) {
      return {
        recordId: change.recordId,
        tableName: change.tableName,
        status: "server-kept",
        conflict: true,
        entry: toEntry(latest),
      };
    }

    const row = await prisma.syncLog.create({
      data: {
        orgId,
        tableName: change.tableName,
        recordId: change.recordId,
        operation: change.operation,
        data: JSON.stringify(change.data ?? null),
        timestamp: new Date(),
        clientTimestamp: new Date(change.timestamp),
        synced: false,
      },
    });
    return {
      recordId: change.recordId,
      tableName: change.tableName,
      status: "applied",
      conflict,
      entry: toEntry(row),
    };
  }
}

export const syncServer = new DurableSyncServer();
