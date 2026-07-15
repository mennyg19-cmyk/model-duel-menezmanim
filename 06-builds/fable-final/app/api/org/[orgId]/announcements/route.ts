import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { announcements } from "@/db/schema";

export const dynamic = "force-dynamic";

function ser(row: typeof announcements.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    title: row.title,
    titleHebrew: row.titleHebrew,
    content: row.content,
    contentHebrew: row.contentHebrew,
    scheduleRules: row.scheduleRules,
    priority: row.priority,
    isActive: row.isActive,
    startDate: row.startDate,
    endDate: row.endDate,
    sortKey: row.priority,
  };
}

/** E9 — announcements CRUD list/create. Load org via orgId path (guard). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select()
      .from(announcements)
      .where(eq(announcements.orgId, orgId))
      .orderBy(asc(announcements.priority), asc(announcements.title));
    // Higher priority first for display — re-sort desc in response
    rows.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
    return NextResponse.json({ announcements: rows.map(ser) });
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
      title?: string;
      titleHebrew?: string | null;
      content?: string;
      contentHebrew?: string | null;
      scheduleRules?: ScheduleRule[] | null;
      priority?: number;
      isActive?: boolean;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    if (!body?.title?.trim() || !body?.content?.trim()) {
      return NextResponse.json({ error: "Title and content required." }, { status: 400 });
    }
    const [row] = await db
      .insert(announcements)
      .values({
        orgId,
        title: body.title.trim(),
        titleHebrew: body.titleHebrew?.trim() || null,
        content: body.content.trim(),
        contentHebrew: body.contentHebrew?.trim() || null,
        scheduleRules: body.scheduleRules ?? null,
        priority: body.priority ?? 0,
        isActive: body.isActive ?? true,
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
      })
      .returning();
    return NextResponse.json({ announcement: row ? ser(row) : null }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  // Reorder: body { orderedIds: string[] } updates priority = index from high
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as { orderedIds?: string[] } | null;
    const ids = body?.orderedIds ?? [];
    for (let i = 0; i < ids.length; i++) {
      await db
        .update(announcements)
        .set({ priority: ids.length - i })
        .where(and(eq(announcements.id, ids[i]!), eq(announcements.orgId, orgId)));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
