import { NextRequest, NextResponse } from "next/server";
import { syncServer } from "../../../../src/core/sync/server";
import { authorizeSyncRequest, isSyncAccessError } from "../../../../src/server/sync-auth";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId")?.trim();
  if (!orgId) return NextResponse.json({ error: "orgId query required" }, { status: 400 });

  const access = await authorizeSyncRequest(request, orgId, false);
  if (isSyncAccessError(access)) return access;

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    return NextResponse.json({ error: "limit must be a positive integer" }, { status: 400 });
  }

  try {
    const response = await syncServer.pull(
      access.orgId,
      request.nextUrl.searchParams.get("cursor"),
      Math.min(requestedLimit, 500),
    );
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync pull failed";
    return NextResponse.json({ error: message }, { status: message === "Invalid sync cursor" ? 400 : 500 });
  }
}
