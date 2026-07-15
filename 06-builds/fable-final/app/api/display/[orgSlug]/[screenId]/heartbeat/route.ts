// SH.7 — wall-screen heartbeat. Public POST; records lastSeenAt on the screen row.

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orgs, screens } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string; screenId: string }> },
) {
  const { orgSlug, screenId } = await params;
  const [org] = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.slug, orgSlug)).limit(1);
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const now = new Date();
  const updated = await db
    .update(screens)
    .set({ lastSeenAt: now })
    .where(and(eq(screens.orgId, org.id), eq(screens.id, screenId)))
    .returning({ id: screens.id });

  if (updated.length === 0) return NextResponse.json({ error: "screen not found" }, { status: 404 });
  return NextResponse.json({ ok: true, at: now.toISOString() });
}
