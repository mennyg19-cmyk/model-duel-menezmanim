import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { scheduleGroups } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E15 — update / delete one group. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  try {
    const { orgId, id } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      hebrewName?: string;
      color?: string;
      active?: boolean;
      sortOrder?: number;
      autoActivationRules?: ScheduleRule[] | null;
    } | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(scheduleGroups)
      .where(and(eq(scheduleGroups.id, id), eq(scheduleGroups.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Group not found." }, { status: 404 });

    const [row] = await db
      .update(scheduleGroups)
      .set({
        name: body.name?.trim() ?? existing.name,
        hebrewName: body.hebrewName?.trim() ?? existing.hebrewName,
        color: body.color?.trim() ?? existing.color,
        active: body.active ?? existing.active,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        autoActivationRules:
          body.autoActivationRules !== undefined ? body.autoActivationRules : existing.autoActivationRules,
      })
      .where(and(eq(scheduleGroups.id, id), eq(scheduleGroups.orgId, orgId)))
      .returning();

    return NextResponse.json({
      group: row
        ? {
            id: row.id,
            orgId: row.orgId,
            name: row.name,
            hebrewName: row.hebrewName,
            color: row.color,
            active: row.active,
            sortOrder: row.sortOrder,
            isBuiltIn: row.isBuiltIn,
            autoActivationRules: row.autoActivationRules,
          }
        : null,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  try {
    const { orgId, id } = await params;
    await requireOrgRole(orgId, "admin");
    const deleted = await db
      .delete(scheduleGroups)
      .where(and(eq(scheduleGroups.id, id), eq(scheduleGroups.orgId, orgId)))
      .returning({ id: scheduleGroups.id });
    if (!deleted.length) return NextResponse.json({ error: "Group not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
