import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Shared board data for the live editor canvas (zmanim/minyanim/… for unsaved preview). */
export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const url = new URL(request.url);
    const screenId = url.searchParams.get("screenId");
    const date = url.searchParams.get("date");
    const offsetsRaw = url.searchParams.get("offsets");
    const offsets = offsetsRaw
      ? offsetsRaw
          .split(",")
          .map((s) => Number(s))
          .filter((n) => Number.isFinite(n))
      : [0];

    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });

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
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
