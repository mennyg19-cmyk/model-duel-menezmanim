// E5 / F-API4 — GET /api/sync/pull?since=<ms> — device Bearer token (not Clerk).

import { NextResponse } from "next/server";
import { authenticateDevice, pullOrgChanges } from "@/server/sync-repo";
import type { SyncPullResponse } from "@/core/sync/protocol";

export const dynamic = "force-dynamic";

function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const token = bearer(request);
  if (!token) return NextResponse.json({ error: "Missing device token." }, { status: 401 });

  const device = await authenticateDevice(token);
  if (!device) return NextResponse.json({ error: "Unknown or revoked device." }, { status: 401 });

  const since = Number(new URL(request.url).searchParams.get("since") ?? "0") || 0;
  const { changes, cursor } = await pullOrgChanges(device.orgId, since);
  const body: SyncPullResponse = { changes, cursor };
  return NextResponse.json(body);
}
