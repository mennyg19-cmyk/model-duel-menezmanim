import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/auth/guards";
import { createOrgWithDefaults, getOrgCounts, listAllOrgs } from "@/server/admin-orgs";

export const dynamic = "force-dynamic";

/** E20 — list / create orgs (super-admin). */
export async function GET() {
  try {
    await requireSuperAdmin();
    const rows = await listAllOrgs();
    const orgsOut = await Promise.all(
      rows.map(async (o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        status: o.status,
        plan: o.plan,
        createdAt: o.createdAt.toISOString(),
        counts: await getOrgCounts(o.id),
      })),
    );
    return NextResponse.json({ orgs: orgsOut });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSuperAdmin();
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      slug?: string;
      status?: string;
      plan?: string;
      assignOwner?: boolean;
    } | null;
    if (!body?.name?.trim() || !body?.slug?.trim()) {
      return NextResponse.json({ error: "name and slug required." }, { status: 400 });
    }
    try {
      const org = await createOrgWithDefaults({
        name: body.name,
        slug: body.slug,
        status: body.status ?? "pending",
        plan: body.plan ?? "free",
        ownerUserId: body.assignOwner === false ? null : actor.userId,
      });
      return NextResponse.json(
        { org: { id: org.id, name: org.name, slug: org.slug, status: org.status, plan: org.plan } },
        { status: 201 },
      );
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Create failed." }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
