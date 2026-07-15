import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { announcements } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  try {
    const { orgId, id } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const [row] = await db
      .update(announcements)
      .set({
        title: typeof body.title === "string" ? body.title.trim() : existing.title,
        titleHebrew:
          body.titleHebrew !== undefined
            ? ((body.titleHebrew as string | null)?.trim() || null)
            : existing.titleHebrew,
        content: typeof body.content === "string" ? body.content.trim() : existing.content,
        contentHebrew:
          body.contentHebrew !== undefined
            ? ((body.contentHebrew as string | null)?.trim() || null)
            : existing.contentHebrew,
        scheduleRules:
          body.scheduleRules !== undefined
            ? (body.scheduleRules as ScheduleRule[] | null)
            : existing.scheduleRules,
        priority: typeof body.priority === "number" ? body.priority : existing.priority,
        isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
        startDate: body.startDate !== undefined ? (body.startDate as string | null) : existing.startDate,
        endDate: body.endDate !== undefined ? (body.endDate as string | null) : existing.endDate,
      })
      .where(and(eq(announcements.id, id), eq(announcements.orgId, orgId)))
      .returning();

    return NextResponse.json({ announcement: row });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  try {
    const { orgId, id } = await params;
    await requireOrgRole(orgId, "editor");
    const deleted = await db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.orgId, orgId)))
      .returning({ id: announcements.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
