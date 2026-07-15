import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { media } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E12 — `/media/ordering` drag-reorder. */
export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as { orderedIds?: string[] } | null;
    const ids = body?.orderedIds ?? [];
    for (let i = 0; i < ids.length; i++) {
      await db
        .update(media)
        .set({ sortOrder: i })
        .where(and(eq(media.id, ids[i]!), eq(media.orgId, orgId)));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
