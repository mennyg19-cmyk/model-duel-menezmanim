import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { cloneOrgContent, createOrgWithDefaults } from "@/server/admin-orgs";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * E21 — clone org content (SA.6).
 * Body: { sourceOrgId, targetOrgId? } or { sourceOrgId, createTarget: { name, slug } }.
 */
export async function POST(request: Request) {
  try {
    const actor = await requireSuperAdmin();
    const body = (await request.json().catch(() => null)) as {
      sourceOrgId?: string;
      targetOrgId?: string;
      createTarget?: { name: string; slug: string; status?: string; plan?: string };
    } | null;

    if (!body?.sourceOrgId) {
      return NextResponse.json({ error: "sourceOrgId required." }, { status: 400 });
    }
    const [source] = await db.select().from(orgs).where(eq(orgs.id, body.sourceOrgId)).limit(1);
    if (!source) return NextResponse.json({ error: "Source org not found." }, { status: 404 });

    let targetId = body.targetOrgId;
    let created: { id: string; slug: string } | null = null;
    if (!targetId && body.createTarget?.name && body.createTarget?.slug) {
      const org = await createOrgWithDefaults({
        name: body.createTarget.name,
        slug: body.createTarget.slug,
        status: body.createTarget.status ?? "active",
        plan: body.createTarget.plan ?? "free",
        ownerUserId: actor.userId,
      });
      targetId = org.id;
      created = { id: org.id, slug: org.slug };
    }
    if (!targetId) {
      return NextResponse.json({ error: "targetOrgId or createTarget required." }, { status: 400 });
    }
    if (targetId === body.sourceOrgId) {
      return NextResponse.json({ error: "Cannot clone onto self." }, { status: 400 });
    }
    const [target] = await db.select().from(orgs).where(eq(orgs.id, targetId)).limit(1);
    if (!target) return NextResponse.json({ error: "Target org not found." }, { status: 404 });

    const result = await cloneOrgContent(body.sourceOrgId, targetId);
    return NextResponse.json({ ok: true, sourceOrgId: body.sourceOrgId, targetOrgId: targetId, created, ...result });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
