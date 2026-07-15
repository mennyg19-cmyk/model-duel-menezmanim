// Hybrid desktop sync cycle (runs on AUTH_MODE=local embedded server).

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";
import { applyIncoming, pullOrgChanges } from "./sync-repo";
import type { ConflictStrategy, SyncPullResponse, SyncPushResponse } from "@/core/sync/protocol";

function authHeader(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

export async function ensureLocalOrg(cloudUrl: string, token: string): Promise<string> {
  const res = await fetch(`${cloudUrl}/api/sync/whoami`, { headers: authHeader(token) });
  if (!res.ok) throw new Error(`Cloud whoami failed: ${res.status}`);
  const { org } = (await res.json()) as { org: Record<string, unknown> & { id: string } };
  const existing = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.id, org.id)).limit(1);
  if (existing.length === 0) {
    await db.insert(orgs).values(org as never).onConflictDoNothing();
  }
  return org.id;
}

export interface SyncCycleResult {
  localOrgId: string;
  pulledApplied: number;
  pushedApplied: number;
  conflicts: number;
  cursor: number;
}

export async function runSyncCycle(opts: {
  cloudUrl: string;
  token: string;
  since: number;
  strategy?: ConflictStrategy;
}): Promise<SyncCycleResult> {
  const strategy = opts.strategy ?? "last-write-wins";
  const localOrgId = await ensureLocalOrg(opts.cloudUrl, opts.token);

  const pullRes = await fetch(`${opts.cloudUrl}/api/sync/pull?since=${opts.since}`, { headers: authHeader(opts.token) });
  if (!pullRes.ok) throw new Error(`Cloud pull failed: ${pullRes.status}`);
  const pulled = (await pullRes.json()) as SyncPullResponse;
  const local = await applyIncoming(localOrgId, pulled.changes, strategy);

  const outgoing = await pullOrgChanges(localOrgId, opts.since);
  const pushRes = await fetch(`${opts.cloudUrl}/api/sync/push`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeader(opts.token) },
    body: JSON.stringify({ strategy, changes: outgoing.changes }),
  });
  if (!pushRes.ok) throw new Error(`Cloud push failed: ${pushRes.status}`);
  const pushed = (await pushRes.json()) as SyncPushResponse;

  return {
    localOrgId,
    pulledApplied: local.applied,
    pushedApplied: pushed.applied,
    conflicts: local.conflicts.length + pushed.conflicts.length,
    cursor: Math.max(pulled.cursor, outgoing.cursor, opts.since),
  };
}
