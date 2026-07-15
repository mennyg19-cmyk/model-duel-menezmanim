// E4 — public Jewish-calendar info as JSON: Hebrew date, parsha, daf yomi,
// holiday/Omer state, and tefilah changes, all computed by the C7 engine
// (Israel vs. diaspora aware) — never hardcoded flags (F-API3).
// GET /api/calendar?org=slug&date=YYYY-MM-DD (date optional, defaults to today)

import { NextResponse } from "next/server";
import { loadOrgZmanimContext, parseDateOverride } from "@/server/org-zmanim";
import { CalendarEngine } from "@/core/calendar-engine";

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
  const engine = new CalendarEngine(ctx.inIsrael);

  return NextResponse.json({
    org: ctx.org,
    gregorianDate: date.toISOString(),
    ...engine.getAllInfo(date),
  });
}
