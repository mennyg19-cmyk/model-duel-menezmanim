import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { media } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E12 — media list/create (upload as data URL / path for local). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select()
      .from(media)
      .where(eq(media.orgId, orgId))
      .orderBy(asc(media.sortOrder), asc(media.originalName));
    return NextResponse.json({ media: rows });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      filename?: string;
      originalName?: string;
      mimeType?: string;
      fileSize?: number;
      filePath?: string;
      scheduleRules?: ScheduleRule[] | null;
      isActive?: boolean;
    } | null;
    if (!body?.filePath?.trim() || !body?.originalName?.trim()) {
      return NextResponse.json({ error: "filePath and originalName required." }, { status: 400 });
    }
    const existing = await db.select({ sortOrder: media.sortOrder }).from(media).where(eq(media.orgId, orgId));
    const sortOrder = existing.length ? Math.max(...existing.map((r) => r.sortOrder)) + 1 : 0;
    const [row] = await db
      .insert(media)
      .values({
        orgId,
        filename: body.filename?.trim() || body.originalName.trim(),
        originalName: body.originalName.trim(),
        mimeType: body.mimeType?.trim() || "application/octet-stream",
        fileSize: body.fileSize ?? body.filePath.length,
        filePath: body.filePath.trim(),
        scheduleRules: body.scheduleRules ?? null,
        sortOrder,
        isActive: body.isActive ?? true,
      })
      .returning();
    return NextResponse.json({ media: row }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

/** Reorder when PATCH with orderedIds on collection — also exposed at /ordering. */
export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
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
