import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { planLimits } from "@/admin/plan-limits";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E20 — change org plan. Preserves org.id. */
export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin();
    const { orgId } = await params;
    const body = (await request.json().catch(() => null)) as { plan?: string } | null;
    const plan = body?.plan?.trim();
    if (!plan || !["free", "basic", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "plan must be free|basic|pro|enterprise." }, { status: 400 });
    }
    const [existing] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!existing) return NextResponse.json({ error: "Org not found." }, { status: 404 });
    await db.update(orgs).set({ plan }).where(eq(orgs.id, orgId));
    return NextResponse.json({ org: { id: orgId, plan, limits: planLimits(plan) } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
