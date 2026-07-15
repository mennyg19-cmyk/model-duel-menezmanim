import { prisma } from "../db/client";
import { parseGroupIds, toGroupDto, type GroupDto } from "./schedule-details";

export async function listGroups(orgId: string): Promise<GroupDto[]> {
  const groups = await prisma.scheduleGroup.findMany({
    where: { orgId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const schedules = await prisma.minyanSchedule.findMany({
    where: { orgId },
    select: { scheduleGroupIds: true },
  });
  const counts = new Map<string, number>();
  for (const schedule of schedules) {
    for (const id of parseGroupIds(schedule.scheduleGroupIds)) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return groups.map((group) => toGroupDto(group, counts.get(group.id) ?? 0));
}

export async function createGroup(
  orgId: string,
  input: { name?: string; hebrewName?: string; color?: string; active?: boolean; sortOrder?: number },
) {
  const max = await prisma.scheduleGroup.aggregate({
    where: { orgId },
    _max: { sortOrder: true },
  });
  return prisma.scheduleGroup.create({
    data: {
      orgId,
      name: input.name ?? "New Group",
      hebrewName: input.hebrewName ?? "קבוצה חדשה",
      color: input.color ?? "#3b82f6",
      active: input.active ?? true,
      sortOrder: input.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      isBuiltIn: false,
    },
  });
}

export async function updateGroup(
  orgId: string,
  groupId: string,
  input: {
    name?: string;
    hebrewName?: string;
    color?: string;
    active?: boolean;
    sortOrder?: number;
    autoActivationRules?: string | null;
  },
) {
  const existing = await prisma.scheduleGroup.findFirst({ where: { id: groupId, orgId } });
  if (!existing) throw new Error(`Group not found: ${groupId}`);
  return prisma.scheduleGroup.update({
    where: { id: groupId },
    data: {
      name: input.name ?? existing.name,
      hebrewName: input.hebrewName ?? existing.hebrewName,
      color: input.color ?? existing.color,
      active: input.active ?? existing.active,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      autoActivationRules:
        input.autoActivationRules !== undefined
          ? input.autoActivationRules
          : existing.autoActivationRules,
    },
  });
}

export async function deleteGroup(orgId: string, groupId: string) {
  const existing = await prisma.scheduleGroup.findFirst({ where: { id: groupId, orgId } });
  if (!existing) throw new Error(`Group not found: ${groupId}`);
  if (existing.isBuiltIn) {
    throw new Error("Built-in groups cannot be deleted; deactivate them instead");
  }
  const schedules = await prisma.minyanSchedule.findMany({
    where: { orgId },
    select: { id: true, scheduleGroupIds: true },
  });
  await prisma.$transaction(async (tx) => {
    for (const schedule of schedules) {
      const ids = parseGroupIds(schedule.scheduleGroupIds).filter((id) => id !== groupId);
      if (ids.length !== parseGroupIds(schedule.scheduleGroupIds).length) {
        await tx.minyanSchedule.update({
          where: { id: schedule.id },
          data: { scheduleGroupIds: ids.length ? JSON.stringify(ids) : null },
        });
      }
    }
    await tx.scheduleGroup.delete({ where: { id: groupId } });
  });
}

export async function replaceGroups(
  orgId: string,
  items: Array<{
    id?: string;
    name: string;
    hebrewName: string;
    color: string;
    active: boolean;
    sortOrder: number;
    isBuiltIn?: boolean;
  }>,
) {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.id) {
        await tx.scheduleGroup.updateMany({
          where: { id: item.id, orgId },
          data: {
            name: item.name,
            hebrewName: item.hebrewName,
            color: item.color,
            active: item.active,
            sortOrder: item.sortOrder,
          },
        });
      } else {
        await tx.scheduleGroup.create({
          data: {
            orgId,
            name: item.name,
            hebrewName: item.hebrewName,
            color: item.color,
            active: item.active,
            sortOrder: item.sortOrder,
            isBuiltIn: item.isBuiltIn ?? false,
          },
        });
      }
    }
  });
  return listGroups(orgId);
}
