import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "../../../../src/domain/super-admin";
import { cloneOrganization } from "../../../../src/domain/org-clone";

/** E21 clone org. */
export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const body = (await request.json()) as { sourceOrgId?: string; name?: string; slug?: string };
  if (!body.sourceOrgId || !body.name || !body.slug) {
    return NextResponse.json({ error: "sourceOrgId, name, slug required" }, { status: 400 });
  }
  try {
    const org = await cloneOrganization(body.sourceOrgId, body.name, body.slug.toLowerCase());
    return NextResponse.json({ org: { id: org.id, slug: org.slug, name: org.name } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Clone failed" }, { status: 400 });
  }
}
