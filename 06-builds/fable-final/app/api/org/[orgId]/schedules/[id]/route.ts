import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { MinyanDetails } from "@/db/json";
import { minyanSchedules } from "@/db/schema";
import type { ScheduleWriteBody } from "@/admin/schedules/types";

export const dynamic = "force-dynamic";

function serialize(row: typeof minyanSchedules.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    hebrewName: row.hebrewName,
    type: row.type,
    baseZman: row.baseZman,
    fixedTime: row.fixedTime,
    offset: row.offset,
    earliest: row.earliest,
    latest: row.latest,
    roundTo: row.roundTo,
    roundDirection: row.roundDirection,
    room: row.room,
    dayOfWeekMask: row.dayOfWeekMask,
    scheduleGroupIds: row.scheduleGroupIds,
    details: row.details,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

/** E8 — update / delete one schedule. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  try {
    const { orgId, id } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as ScheduleWriteBody | null;
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const [existing] = await db
      .select()
      .from(minyanSchedules)
      .where(and(eq(minyanSchedules.id, id), eq(minyanSchedules.orgId, orgId)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Schedule not found." }, { status: 404 });

    const type = body.type ?? existing.type;
    let details: MinyanDetails | null =
      body.details !== undefined ? body.details : existing.details;
    if (type === "placeholder") {
      details = { ...(details ?? {}), isPlaceholder: true };
    }

    const [row] = await db
      .update(minyanSchedules)
      .set({
        name: body.name?.trim() ?? existing.name,
        hebrewName: body.hebrewName?.trim() ?? existing.hebrewName,
        type,
        baseZman: body.baseZman !== undefined ? body.baseZman : existing.baseZman,
        fixedTime: body.fixedTime !== undefined ? body.fixedTime : existing.fixedTime,
        offset: body.offset ?? existing.offset,
        earliest: body.earliest !== undefined ? body.earliest : existing.earliest,
        latest: body.latest !== undefined ? body.latest : existing.latest,
        roundTo: body.roundTo ?? existing.roundTo,
        roundDirection: body.roundDirection ?? existing.roundDirection,
        room: body.room !== undefined ? body.room : existing.room,
        dayOfWeekMask: body.dayOfWeekMask ?? existing.dayOfWeekMask,
        scheduleGroupIds:
          body.scheduleGroupIds !== undefined ? body.scheduleGroupIds : existing.scheduleGroupIds,
        details,
        isActive: body.isActive ?? existing.isActive,
        sortOrder: body.sortOrder ?? existing.sortOrder,
      })
      .where(and(eq(minyanSchedules.id, id), eq(minyanSchedules.orgId, orgId)))
      .returning();

    return NextResponse.json({ schedule: row ? serialize(row) : null });
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
    await requireOrgRole(orgId, "editor");
    const deleted = await db
      .delete(minyanSchedules)
      .where(and(eq(minyanSchedules.id, id), eq(minyanSchedules.orgId, orgId)))
      .returning({ id: minyanSchedules.id });
    if (!deleted.length) return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
