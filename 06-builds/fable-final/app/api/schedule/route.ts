// DK14 — local schedule feed for desktop/LAN clients.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { minyanSchedules, orgs, scheduleGroups } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const orgSlug = new URL(request.url).searchParams.get("org") ?? "demo";
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, orgSlug)).limit(1);
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const groups = await db.select().from(scheduleGroups).where(eq(scheduleGroups.orgId, org.id));
  const rows = await db.select().from(minyanSchedules).where(eq(minyanSchedules.orgId, org.id));
  return NextResponse.json({ org: { id: org.id, slug: org.slug, name: org.name }, groups, schedules: rows });
}
