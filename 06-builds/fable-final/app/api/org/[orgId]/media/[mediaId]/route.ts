import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { media } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; mediaId: string }> },
) {
  try {
    const { orgId, mediaId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(media)
      .where(and(eq(media.id, mediaId), eq(media.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [row] = await db
      .update(media)
      .set({
        originalName:
          typeof body.originalName === "string" ? body.originalName.trim() : existing.originalName,
        isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
        scheduleRules:
          body.scheduleRules !== undefined
            ? (body.scheduleRules as ScheduleRule[] | null)
            : existing.scheduleRules,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : existing.sortOrder,
      })
      .where(and(eq(media.id, mediaId), eq(media.orgId, orgId)))
      .returning();

    return NextResponse.json({ media: row });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; mediaId: string }> },
) {
  try {
    const { orgId, mediaId } = await params;
    await requireOrgRole(orgId, "editor");
    const deleted = await db
      .delete(media)
      .where(and(eq(media.id, mediaId), eq(media.orgId, orgId)))
      .returning({ id: media.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
