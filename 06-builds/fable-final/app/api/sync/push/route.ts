// E5 / F-API4 — POST /api/sync/push — device Bearer token.

import { NextResponse } from "next/server";
import { z } from "zod";
import { applyIncoming, authenticateDevice } from "@/server/sync-repo";
import { isSyncableTable } from "@/core/sync/protocol";
import type { SyncChange, SyncPushResponse } from "@/core/sync/protocol";

export const dynamic = "force-dynamic";

const changeSchema = z.object({
  table: z.string(),
  recordId: z.string(),
  operation: z.enum(["upsert", "delete"]),
  data: z.record(z.unknown()).optional(),
  updatedAt: z.number(),
});

const bodySchema = z.object({
  strategy: z.enum(["last-write-wins", "server-wins", "client-wins", "manual"]).default("last-write-wins"),
  changes: z.array(changeSchema),
});

function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = bearer(request);
  if (!token) return NextResponse.json({ error: "Missing device token." }, { status: 401 });

  const device = await authenticateDevice(token);
  if (!device) return NextResponse.json({ error: "Unknown or revoked device." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad sync payload." }, { status: 400 });

  const changes = parsed.data.changes.filter((c): c is SyncChange => isSyncableTable(c.table)) as SyncChange[];
  const { applied, skipped, conflicts } = await applyIncoming(device.orgId, changes, parsed.data.strategy);
  const body: SyncPushResponse = { applied, skipped, conflicts, cursor: Date.now() };
  return NextResponse.json(body);
}
