// E3 — public, org-aware zmanim as JSON. Same engine the board will use; nothing hardcoded.
// GET /api/zmanim?org=slug&date=YYYY-MM-DD (date optional, defaults to today)

import { NextResponse } from "next/server";
import { loadOrgZmanimContext, parseDateOverride } from "@/server/org-zmanim";
import { ZmanimEngine } from "@/core/zmanim-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orgSlug = url.searchParams.get("org");
  if (!orgSlug) {
    return NextResponse.json({ error: "missing ?org=slug" }, { status: 400 });
  }

  const ctx = await loadOrgZmanimContext(orgSlug);
  if (!ctx) {
    return NextResponse.json({ error: "org not found" }, { status: 404 });
  }

  const date = parseDateOverride(url.searchParams.get("date")) ?? new Date();
  const engine = new ZmanimEngine({
    location: ctx.location,
    zmanim: ctx.zmanim,
    candleLightingMinutes: ctx.candleLightingMinutes,
  });

  const zmanim = engine.getZmanimForDate(date).map((zman) => ({
    type: zman.type,
    label: zman.label,
    hebrewLabel: zman.hebrewLabel,
    authority: zman.authority,
    time: zman.time ? zman.time.toISOString() : null,
  }));

  return NextResponse.json({
    org: ctx.org,
    date: date.toISOString(),
    timezone: ctx.location.timezone,
    zmanim,
  });
}
