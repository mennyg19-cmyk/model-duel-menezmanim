import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { getOrgCounts } from "@/server/admin-orgs";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * E20 + F11 — org data hub for super-admin.
 * Returns summary + deep links into normal org admin editors (super already gets owner via requireOrgRole).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin();
    const { orgId } = await params;
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });
    const counts = await getOrgCounts(orgId);
    const base = `/admin/${org.slug}`;
    return NextResponse.json({
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        plan: org.plan,
        latitude: org.latitude,
        longitude: org.longitude,
        timezone: org.timezone,
        settings: org.settings,
      },
      counts,
      editorLinks: {
        dashboard: base,
        editor: `${base}/editor`,
        screens: `${base}/screens`,
        members: `${base}/members`,
        settings: `${base}/settings`,
        display: `/display/${org.slug}`,
        mobile: `/mobile?org=${encodeURIComponent(org.slug)}`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
