import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import {
  bulkDeleteSchedules,
  bulkSetGroup,
  createSchedule,
  deleteSchedule,
  duplicateSchedule,
  listSchedulesWithTimes,
  reorderSchedules,
  updateSchedule,
} from "../../../../../src/domain/schedules";
import { toScheduleDto } from "../../../../../src/domain/schedule-details";

type Ctx = { params: Promise<{ orgId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const schedules = await listSchedulesWithTimes(access.orgId);
  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "create";

  try {
    if (action === "create") {
      const row = await createSchedule(access.orgId, {
        name: body.name as string | undefined,
        hebrewName: body.hebrewName as string | undefined,
        type: body.type as string | undefined,
        baseZman: (body.baseZman as string | null | undefined) ?? null,
        fixedTime: (body.fixedTime as string | null | undefined) ?? null,
        offset: body.offset as number | undefined,
        earliest: (body.earliest as string | null | undefined) ?? null,
        latest: (body.latest as string | null | undefined) ?? null,
        roundTo: body.roundTo as number | undefined,
        room: (body.room as string | null | undefined) ?? null,
        dayOfWeekMask: body.dayOfWeekMask as string | undefined,
        scheduleGroupIds: body.scheduleGroupIds as string[] | undefined,
        isActive: body.isActive as boolean | undefined,
        sortOrder: body.sortOrder as number | undefined,
        details: body.details as never,
      });
      const schedules = await listSchedulesWithTimes(access.orgId);
      return NextResponse.json({ schedule: toScheduleDto(row), schedules }, { status: 201 });
    }

    if (action === "duplicate") {
      const id = String(body.id ?? "");
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await duplicateSchedule(access.orgId, id);
      return NextResponse.json({ schedules: await listSchedulesWithTimes(access.orgId) });
    }

    if (action === "reorder") {
      const ids = body.ids as string[] | undefined;
      if (!ids?.length) return NextResponse.json({ error: "ids required" }, { status: 400 });
      await reorderSchedules(access.orgId, ids);
      return NextResponse.json({ schedules: await listSchedulesWithTimes(access.orgId) });
    }

    if (action === "bulk-delete") {
      const ids = body.ids as string[] | undefined;
      if (!ids?.length) return NextResponse.json({ error: "ids required" }, { status: 400 });
      await bulkDeleteSchedules(access.orgId, ids);
      return NextResponse.json({ schedules: await listSchedulesWithTimes(access.orgId) });
    }

    if (action === "bulk-move" || action === "bulk-copy") {
      const ids = body.ids as string[] | undefined;
      if (!ids?.length) return NextResponse.json({ error: "ids required" }, { status: 400 });
      const groupId = (body.groupId as string | null | undefined) ?? null;
      const result = await bulkSetGroup(
        access.orgId,
        ids,
        groupId,
        action === "bulk-move" ? "move" : "copy",
      );
      return NextResponse.json({
        ...result,
        schedules: await listSchedulesWithTimes(access.orgId),
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Schedule write failed" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as {
    id?: string;
    name?: string;
    hebrewName?: string;
    type?: string;
    baseZman?: string | null;
    fixedTime?: string | null;
    offset?: number;
    earliest?: string | null;
    latest?: string | null;
    roundTo?: number;
    room?: string | null;
    dayOfWeekMask?: string;
    scheduleGroupIds?: string[];
    isActive?: boolean;
    sortOrder?: number;
    details?: Record<string, unknown>;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id required for PUT" }, { status: 400 });
  }

  try {
    const row = await updateSchedule(access.orgId, body.id, {
      name: body.name,
      hebrewName: body.hebrewName,
      type: body.type,
      baseZman: body.baseZman,
      fixedTime: body.fixedTime,
      offset: body.offset,
      earliest: body.earliest,
      latest: body.latest,
      roundTo: body.roundTo,
      room: body.room,
      dayOfWeekMask: body.dayOfWeekMask,
      scheduleGroupIds: body.scheduleGroupIds,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      details: body.details as never,
    });
    return NextResponse.json({
      schedule: toScheduleDto(row),
      schedules: await listSchedulesWithTimes(access.orgId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  try {
    await deleteSchedule(access.orgId, id);
    return NextResponse.json({ schedules: await listSchedulesWithTimes(access.orgId) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 },
    );
  }
}
