import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { loadBoardData, parseDateOverride } from "../../../../../../src/server/board-repo";
import { buildDisplaySnapshot } from "../../../../../../src/core/board/snapshot";
import { prisma } from "../../../../../../src/db/client";

type Ctx = { params: Promise<{ orgId: string }> };

/** Shared board data for the live editor canvas (zmanim/minyanim for unsaved preview). */
export async function GET(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });

  const url = request.nextUrl;
  const screenId = url.searchParams.get("screenId");
  const date = url.searchParams.get("date");
  const offsetsRaw = url.searchParams.get("offsets");
  const offsets = offsetsRaw
    ? offsetsRaw
        .split(",")
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n))
    : [0];

  const data = await loadBoardData(org.slug, screenId ?? undefined);
  if (!data) return NextResponse.json({ error: "No screen/board data." }, { status: 404 });

  const when = parseDateOverride(date) ?? new Date();
  const snapshot = buildDisplaySnapshot(data, {
    now: when,
    dateOverride: when,
    mode: "preview",
    extraOffsets: offsets,
  });
  return NextResponse.json({ data: snapshot.data });
}
