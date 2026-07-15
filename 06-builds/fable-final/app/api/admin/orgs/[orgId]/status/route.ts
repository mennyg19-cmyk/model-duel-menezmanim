import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E20 — change org status (approve/reject/suspend/reactivate). Preserves org.id. */
export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin();
    const { orgId } = await params;
    const body = (await request.json().catch(() => null)) as { status?: string } | null;
    const status = body?.status?.trim();
    if (!status || !["pending", "active", "suspended", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be pending|active|suspended|rejected." }, { status: 400 });
    }
    const [existing] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!existing) return NextResponse.json({ error: "Org not found." }, { status: 404 });
    await db.update(orgs).set({ status }).where(eq(orgs.id, orgId));
    return NextResponse.json({ org: { id: orgId, status } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
