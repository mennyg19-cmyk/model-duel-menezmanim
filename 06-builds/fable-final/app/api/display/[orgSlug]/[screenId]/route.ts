// Public display snapshot JSON — same object /show renders (F-NAV2: one builder).
// GET /api/display/:orgSlug/:screenId?date=YYYY-MM-DD&bp=mobile|tablet|full

import { NextResponse } from "next/server";
import type { DisplayBreakpoint } from "@/core/style-engine";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";

const VALID_BP = new Set<DisplayBreakpoint>(["mobile", "tablet", "full"]);

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string; screenId: string }> },
) {
  const { orgSlug, screenId } = await params;
  const data = await loadBoardData(orgSlug, screenId);
  if (!data) {
    return NextResponse.json({ error: "board not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const dateOverride = parseDateOverride(url.searchParams.get("date"));
  const bpParam = url.searchParams.get("bp") as DisplayBreakpoint | null;
  const breakpoint: DisplayBreakpoint = bpParam && VALID_BP.has(bpParam) ? bpParam : "full";
  const snapshot = buildDisplaySnapshot(data, { now: new Date(), dateOverride, breakpoint });
  return NextResponse.json(snapshot);
}
