// GET /api/sync/whoami — paired device learns its org (ids must match for hybrid).

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authenticateDevice } from "@/server/sync-repo";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  if (!token) return NextResponse.json({ error: "Missing device token." }, { status: 401 });

  const device = await authenticateDevice(token);
  if (!device) return NextResponse.json({ error: "Unknown or revoked device." }, { status: 401 });

  const [org] = await db.select().from(orgs).where(eq(orgs.id, device.orgId)).limit(1);
  if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });
  return NextResponse.json({ org });
}
