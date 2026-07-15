// DK13 — local-friendly zmanim path. Proxies to the real engine-backed /api/zmanim.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, ctx: { params: Promise<{ date: string }> }) {
  const { date } = await ctx.params;
  const url = new URL(request.url);
  const org = url.searchParams.get("org") ?? "demo";
  const target = new URL(`/api/zmanim?org=${encodeURIComponent(org)}&date=${encodeURIComponent(date)}`, url.origin);
  const res = await fetch(target, { cache: "no-store" });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
