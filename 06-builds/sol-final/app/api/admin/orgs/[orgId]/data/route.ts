import { NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { requireSuperAdmin } from "../../../../../../src/domain/super-admin";

type Ctx = { params: Promise<{ orgId: string }> };

/**
 * E20 / F11 — data editor entrypoints reuse normal admin sections scoped to the org.
 * Returns deep links instead of a duplicate editor.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const { orgId } = await ctx.params;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  return NextResponse.json({
    org: { id: org.id, slug: org.slug, name: org.name },
    editors: {
      dashboard: `/admin/${org.slug}`,
      schedules: `/admin/schedules?org=${org.slug}`,
      content: `/admin/content?org=${org.slug}`,
      screens: `/admin/${org.slug}/screens`,
      editor: `/admin/${org.slug}/editor`,
      members: `/admin/${org.slug}/members`,
      settings: `/admin/${org.slug}/settings`,
      import: `/admin/${org.slug}/import`,
      notes: `/admin/${org.slug}/content/notes`,
    },
  });
}
