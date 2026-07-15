import type { MinyanSchedule, Organization } from "@prisma/client";
import { prisma } from "../db/client";
import { buildZmanimConfig, formatZmanTime } from "./org-zmanim";
import { resolveScheduleTime } from "./mobile-data";
import { ZmanimEngine } from "../core";
import {
  parseDetails,
  stringifyDetails,
  stringifyGroupIds,
  toScheduleDto,
  type ScheduleDetails,
  type ScheduleDto,
} from "./schedule-details";

export type ScheduleWriteInput = {
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
  details?: ScheduleDetails;
};

function isPlaceholder(row: MinyanSchedule): boolean {
  return Boolean(parseDetails(row.details).isPlaceholder);
}

export async function listSchedulesWithTimes(orgId: string): Promise<ScheduleDto[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { zmanimConfigs: true },
  });
  if (!org) throw new Error(`Organization not found: ${orgId}`);

  const rows = await prisma.minyanSchedule.findMany({
    where: { orgId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const config = buildZmanimConfig(org, org.zmanimConfigs);
  const engine = new ZmanimEngine(config);
  const today = new Date();

  return rows.map((row) => {
    if (isPlaceholder(row)) {
      return toScheduleDto(row, null);
    }
    const time = resolveScheduleTime(row, today, engine, org.timezone);
    return toScheduleDto(row, formatZmanTime(time, org.timezone, org.amPmFormat));
  });
}

export async function createSchedule(orgId: string, input: ScheduleWriteInput) {
  const max = await prisma.minyanSchedule.aggregate({
    where: { orgId },
    _max: { sortOrder: true },
  });
  const sortOrder = input.sortOrder ?? (max._max.sortOrder ?? -1) + 1;
  const details = input.details ?? {};
  const isPlaceholder = Boolean(details.isPlaceholder);

  const row = await prisma.minyanSchedule.create({
    data: {
      orgId,
      name: input.name ?? (isPlaceholder ? "" : "New schedule"),
      hebrewName: input.hebrewName ?? (isPlaceholder ? "" : "תפילה חדשה"),
      type: input.type ?? (isPlaceholder ? "placeholder" : "other"),
      baseZman: isPlaceholder ? null : (input.baseZman ?? null),
      fixedTime: isPlaceholder ? null : (input.fixedTime ?? "07:00"),
      offset: input.offset ?? 0,
      earliest: input.earliest ?? null,
      latest: input.latest ?? null,
      roundTo: input.roundTo ?? 5,
      room: input.room ?? null,
      dayOfWeekMask: input.dayOfWeekMask ?? "1111111",
      scheduleGroupIds: stringifyGroupIds(input.scheduleGroupIds),
      details: stringifyDetails(details),
      isActive: input.isActive ?? true,
      sortOrder,
    },
  });
  return row;
}

export async function updateSchedule(orgId: string, scheduleId: string, input: ScheduleWriteInput) {
  const existing = await prisma.minyanSchedule.findFirst({
    where: { id: scheduleId, orgId },
  });
  if (!existing) throw new Error(`Schedule not found: ${scheduleId}`);

  const details =
    input.details !== undefined
      ? { ...parseDetails(existing.details), ...input.details }
      : parseDetails(existing.details);

  return prisma.minyanSchedule.update({
    where: { id: scheduleId },
    data: {
      name: input.name ?? existing.name,
      hebrewName: input.hebrewName ?? existing.hebrewName,
      type: input.type ?? existing.type,
      baseZman: input.baseZman !== undefined ? input.baseZman : existing.baseZman,
      fixedTime: input.fixedTime !== undefined ? input.fixedTime : existing.fixedTime,
      offset: input.offset ?? existing.offset,
      earliest: input.earliest !== undefined ? input.earliest : existing.earliest,
      latest: input.latest !== undefined ? input.latest : existing.latest,
      roundTo: input.roundTo ?? existing.roundTo,
      room: input.room !== undefined ? input.room : existing.room,
      dayOfWeekMask: input.dayOfWeekMask ?? existing.dayOfWeekMask,
      scheduleGroupIds:
        input.scheduleGroupIds !== undefined
          ? stringifyGroupIds(input.scheduleGroupIds)
          : existing.scheduleGroupIds,
      details: stringifyDetails(details),
      isActive: input.isActive ?? existing.isActive,
      sortOrder: input.sortOrder ?? existing.sortOrder,
    },
  });
}

export async function deleteSchedule(orgId: string, scheduleId: string) {
  const existing = await prisma.minyanSchedule.findFirst({
    where: { id: scheduleId, orgId },
  });
  if (!existing) throw new Error(`Schedule not found: ${scheduleId}`);
  await prisma.minyanSchedule.delete({ where: { id: scheduleId } });
}

export async function duplicateSchedule(orgId: string, scheduleId: string) {
  const existing = await prisma.minyanSchedule.findFirst({
    where: { id: scheduleId, orgId },
  });
  if (!existing) throw new Error(`Schedule not found: ${scheduleId}`);
  const max = await prisma.minyanSchedule.aggregate({
    where: { orgId },
    _max: { sortOrder: true },
  });
  return prisma.minyanSchedule.create({
    data: {
      orgId,
      name: `${existing.name} (copy)`,
      hebrewName: existing.hebrewName,
      type: existing.type,
      baseZman: existing.baseZman,
      fixedTime: existing.fixedTime,
      offset: existing.offset,
      earliest: existing.earliest,
      latest: existing.latest,
      roundTo: existing.roundTo,
      room: existing.room,
      dayOfWeekMask: existing.dayOfWeekMask,
      scheduleGroupIds: existing.scheduleGroupIds,
      details: existing.details,
      isActive: existing.isActive,
      sortOrder: (max._max.sortOrder ?? existing.sortOrder) + 1,
    },
  });
}

export async function reorderSchedules(orgId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.minyanSchedule.updateMany({
        where: { id, orgId },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function bulkDeleteSchedules(orgId: string, ids: string[]) {
  await prisma.minyanSchedule.deleteMany({ where: { orgId, id: { in: ids } } });
}

export async function bulkSetGroup(orgId: string, ids: string[], groupId: string | null, mode: "move" | "copy") {
  const rows = await prisma.minyanSchedule.findMany({
    where: { orgId, id: { in: ids } },
  });
  if (mode === "move") {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.minyanSchedule.update({
          where: { id: row.id },
          data: {
            scheduleGroupIds: groupId ? stringifyGroupIds([groupId]) : null,
          },
        }),
      ),
    );
    return { updated: rows.length, created: 0 };
  }

  const max = await prisma.minyanSchedule.aggregate({
    where: { orgId },
    _max: { sortOrder: true },
  });
  let sort = (max._max.sortOrder ?? -1) + 1;
  await prisma.minyanSchedule.createMany({
    data: rows.map((row) => ({
      orgId,
      name: row.name,
      hebrewName: row.hebrewName,
      type: row.type,
      baseZman: row.baseZman,
      fixedTime: row.fixedTime,
      offset: row.offset,
      earliest: row.earliest,
      latest: row.latest,
      roundTo: row.roundTo,
      room: row.room,
      dayOfWeekMask: row.dayOfWeekMask,
      scheduleGroupIds: groupId ? stringifyGroupIds([groupId]) : null,
      details: row.details,
      isActive: row.isActive,
      sortOrder: sort++,
    })),
  });
  return { updated: 0, created: rows.length };
}

export type { Organization };
