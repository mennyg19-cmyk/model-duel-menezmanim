import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { requireSuperAdmin } from "../../../../../../src/domain/super-admin";

type Ctx = { params: Promise<{ orgId: string }> };

/** E20 status — approve/reject/suspend/reactivate. Preserve org.id. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const { orgId } = await ctx.params;
  const body = (await request.json()) as { status?: string };
  const status = String(body.status ?? "");
  if (!["pending", "active", "suspended"].includes(status)) {
    return NextResponse.json({ error: "status must be pending|active|suspended" }, { status: 400 });
  }
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: { status },
  });
  return NextResponse.json({ org: { id: updated.id, slug: updated.slug, status: updated.status } });
}
