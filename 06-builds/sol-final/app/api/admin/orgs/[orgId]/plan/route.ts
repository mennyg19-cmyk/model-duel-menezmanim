import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { requireSuperAdmin } from "../../../../../../src/domain/super-admin";

type Ctx = { params: Promise<{ orgId: string }> };

/** E20 plan change. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const { orgId } = await ctx.params;
  const body = (await request.json()) as { plan?: string };
  const plan = String(body.plan ?? "");
  if (!["free", "basic", "pro", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "plan must be free|basic|pro|enterprise" }, { status: 400 });
  }
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  const updated = await prisma.organization.update({ where: { id: org.id }, data: { plan } });
  return NextResponse.json({ org: { id: updated.id, slug: updated.slug, plan: updated.plan } });
}
