import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { revokeDevice } from "@/server/sync-repo";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ orgId: string; deviceId: string }> },
) {
  try {
    const { orgId, deviceId } = await ctx.params;
    await requireOrgRole(orgId, "admin");
    await revokeDevice(orgId, deviceId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
