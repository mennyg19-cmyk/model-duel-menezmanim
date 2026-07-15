import type { MinyanDetails, ScheduleGroupIds, ScheduleRule } from "@/db/json";

export type ScheduleType = "shacharit" | "mincha" | "maariv" | "other" | "placeholder";

export type RowVisibility = "inherit" | "show" | "hide";

export interface ScheduleRow {
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
  roundDirection: string;
  room: string | null;
  dayOfWeekMask: string;
  scheduleGroupIds: ScheduleGroupIds | null;
  details: MinyanDetails | null;
  isActive: boolean;
  sortOrder: number;
}

export interface GroupRow {
  id: string;
  orgId: string;
  name: string;
  hebrewName: string;
  color: string;
  active: boolean;
  sortOrder: number;
  isBuiltIn: boolean;
  autoActivationRules: ScheduleRule[] | null;
  scheduleCount: number;
}

export interface ScheduleWriteBody {
  name?: string;
  hebrewName?: string;
  type?: string;
  baseZman?: string | null;
  fixedTime?: string | null;
  offset?: number;
  earliest?: string | null;
  latest?: string | null;
  roundTo?: number;
  roundDirection?: string;
  room?: string | null;
  dayOfWeekMask?: string;
  scheduleGroupIds?: string[] | null;
  details?: MinyanDetails | null;
  isActive?: boolean;
  sortOrder?: number;
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const SCHEDULE_TYPES: { id: ScheduleType; label: string }[] = [
  { id: "shacharit", label: "Shacharit" },
  { id: "mincha", label: "Mincha" },
  { id: "maariv", label: "Maariv" },
  { id: "other", label: "Other" },
  { id: "placeholder", label: "Spacer" },
];

export function formatTimeLabel(row: ScheduleRow): string {
  if (row.type === "placeholder" || row.details?.isPlaceholder) return "— spacer —";
  if (row.fixedTime) return row.fixedTime;
  if (row.baseZman) {
    const off = row.offset ? ` ${row.offset > 0 ? "+" : ""}${row.offset}m` : "";
    return `${row.baseZman}${off}`;
  }
  return "—";
}

export function maskLabel(mask: string): string {
  const m = (mask || "1111111").padEnd(7, "0").slice(0, 7);
  return DAY_LABELS.filter((_, i) => m[i] === "1").join(" ") || "none";
}

export function rowVisibility(details: MinyanDetails | null | undefined): RowVisibility {
  const v = details?.rowVisibility;
  if (v === "show" || v === "hide" || v === "inherit") return v;
  return "inherit";
}

export function isPlaceholder(row: ScheduleRow): boolean {
  return row.type === "placeholder" || Boolean(row.details?.isPlaceholder);
}
