// DK15 — local announcements feed for desktop/LAN clients.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { announcements, orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const orgSlug = new URL(request.url).searchParams.get("org") ?? "demo";
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, orgSlug)).limit(1);
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const rows = await db.select().from(announcements).where(eq(announcements.orgId, org.id));
  return NextResponse.json({ org: { id: org.id, slug: org.slug, name: org.name }, announcements: rows });
}
