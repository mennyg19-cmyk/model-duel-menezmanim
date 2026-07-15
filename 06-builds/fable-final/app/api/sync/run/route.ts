// POST /api/sync/run — desktop-local trigger for one cloud sync cycle (AUTH_MODE=local).

import { NextResponse } from "next/server";
import { z } from "zod";
import { authMode } from "@/auth/actor";
import { runSyncCycle } from "@/server/sync-runner";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  cloudUrl: z.string().url(),
  token: z.string().min(1),
  since: z.number().default(0),
  strategy: z.enum(["last-write-wins", "server-wins", "client-wins", "manual"]).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  if (authMode() !== "local") {
    return NextResponse.json({ error: "Sync runner is desktop-only." }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  try {
    const result = await runSyncCycle(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Sync failed." }, { status: 502 });
  }
}
