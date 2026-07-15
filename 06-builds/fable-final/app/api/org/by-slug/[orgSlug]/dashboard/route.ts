import { NextResponse } from "next/server";
import { AuthError } from "@/auth/guards";
import { loadDashboardStats } from "@/admin/load-dashboard";

export const dynamic = "force-dynamic";

/** Dashboard stats for P3.1 / P3.4. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  try {
    const { orgSlug } = await params;
    const stats = await loadDashboardStats(orgSlug);
    return NextResponse.json(stats);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
