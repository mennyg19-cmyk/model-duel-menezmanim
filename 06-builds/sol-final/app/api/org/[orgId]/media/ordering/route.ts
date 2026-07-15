import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { mediaDto } from "../../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as { ids?: string[] };
  const ids = body.ids ?? [];
  if (!ids.length) return NextResponse.json({ error: "ids required" }, { status: 400 });

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.media.updateMany({
        where: { id, orgId: access.orgId },
        data: { sortOrder: index },
      }),
    ),
  );
  const rows = await prisma.media.findMany({
    where: { orgId: access.orgId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ media: rows.map(mediaDto) });
}
