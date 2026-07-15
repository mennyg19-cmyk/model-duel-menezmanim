import type { MinyanSchedule, ScheduleGroup } from "@prisma/client";
import { VISIBILITY_CONDITIONS, type VisibilityCondition, type VisibilityRule } from "../core/scheduler";

export type TriState = "ignore" | "show" | "hide";

export type ScheduleDetails = {
  roundMode?: "nearest" | "before" | "after";
  refreshMode?: "daily" | "weekly" | "monthly";
  refreshAnchorDay?: number;
  hideIfMinMaxReached?: boolean;
  isPlaceholder?: boolean;
  placeholderLabel?: string;
  displayOffset?: number;
  durationMinutes?: number;
  nearestEvent?: boolean;
  nearestBefore?: number;
  nearestAfter?: number;
  visibilityRules?: VisibilityRule[];
  priority?: number;
};

export type ScheduleDto = {
  id: string;
  orgId: string;
  name: string;
  hebrewName: string;
  type: string;
  baseZman: string | null;
  fixedTime: string | null;
  offset: number;
  earliest: string | null;
  latest: string | null;
  roundTo: number;
  room: string | null;
  dayOfWeekMask: string;
  scheduleGroupIds: string[];
  isActive: boolean;
  sortOrder: number;
  details: ScheduleDetails;
  computedTime: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GroupDto = {
  id: string;
  orgId: string;
  name: string;
  hebrewName: string;
  color: string;
  active: boolean;
  sortOrder: number;
  isBuiltIn: boolean;
  scheduleCount: number;
  autoActivationRules: string | null;
};

export function parseDetails(raw: string | null | undefined): ScheduleDetails {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ScheduleDetails;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function stringifyDetails(details: ScheduleDetails | null | undefined): string | null {
  if (!details || Object.keys(details).length === 0) return null;
  return JSON.stringify(details);
}

export function parseGroupIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    /* CSV fallback */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function stringifyGroupIds(ids: string[] | null | undefined): string | null {
  if (!ids || ids.length === 0) return null;
  return JSON.stringify(ids);
}

export function toScheduleDto(
  row: MinyanSchedule,
  computedTime: string | null = null,
): ScheduleDto {
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
    room: row.room,
    dayOfWeekMask: row.dayOfWeekMask,
    scheduleGroupIds: parseGroupIds(row.scheduleGroupIds),
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    details: parseDetails(row.details),
    computedTime,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toGroupDto(row: ScheduleGroup, scheduleCount = 0): GroupDto {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    hebrewName: row.hebrewName,
    color: row.color,
    active: row.active,
    sortOrder: row.sortOrder,
    isBuiltIn: row.isBuiltIn,
    scheduleCount,
    autoActivationRules: row.autoActivationRules,
  };
}

export function rulesToTriMap(rules: VisibilityRule[]): Record<string, TriState> {
  const map: Record<string, TriState> = {};
  for (const rule of rules) {
    map[rule.condition] = rule.show ? "show" : "hide";
  }
  return map;
}

export function triMapToRules(map: Record<string, TriState>): VisibilityRule[] {
  const rules: VisibilityRule[] = [];
  for (const [condition, state] of Object.entries(map)) {
    if (state === "ignore") continue;
    rules.push({
      condition: condition as VisibilityCondition,
      show: state === "show",
    });
  }
  return rules;
}

export { VISIBILITY_CONDITIONS };

export const SCHEDULE_TYPES = ["shacharit", "mincha", "maariv", "other", "placeholder"] as const;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
