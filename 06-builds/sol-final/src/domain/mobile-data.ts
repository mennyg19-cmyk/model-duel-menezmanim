import { DateTime } from "luxon";
import type { Announcement, MinyanSchedule, Organization } from "@prisma/client";
import { DEFAULT_OPINIONS, ZmanType, ZmanimEngine, type ZmanimConfig } from "../core";
import { buildZmanimConfig, formatZmanTime } from "./org-zmanim";
import { parseDetails, parseGroupIds } from "./schedule-details";

function roundToMinutes(date: DateTime, roundTo: number): DateTime {
  if (!roundTo || roundTo <= 1) return date;
  const total = date.hour * 60 + date.minute;
  const rounded = Math.round(total / roundTo) * roundTo;
  return date.set({ hour: Math.floor(rounded / 60), minute: rounded % 60, second: 0, millisecond: 0 });
}

function applyClockBound(date: DateTime, bound: string | null | undefined, mode: "earliest" | "latest"): DateTime {
  if (!bound) return date;
  const [h, m] = bound.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return date;
  const boundDt = date.set({ hour: h, minute: m, second: 0, millisecond: 0 });
  if (mode === "earliest" && date < boundDt) return boundDt;
  if (mode === "latest" && date > boundDt) return boundDt;
  return date;
}

export function resolveScheduleTime(
  schedule: MinyanSchedule,
  date: Date,
  engine: ZmanimEngine,
  timezone: string,
): Date | null {
  const local = DateTime.fromJSDate(date, { zone: timezone }).startOf("day");
  let result: DateTime | null = null;

  if (schedule.fixedTime) {
    const [h, m] = schedule.fixedTime.split(":").map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      result = local.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    }
  } else if (schedule.baseZman) {
    const type = schedule.baseZman as ZmanType;
    const opinion = DEFAULT_OPINIONS.get(type);
    const zman = engine.getSingleZman(date, {
      type,
      authority: opinion?.authority ?? ("GRA" as never),
      degreesBelow: opinion?.degreesBelow,
      fixedMinutes: opinion?.fixedMinutes,
    });
    if (zman) {
      result = DateTime.fromJSDate(zman, { zone: timezone }).plus({ minutes: schedule.offset });
    }
  }

  if (!result) return null;
  result = applyClockBound(result, schedule.earliest, "earliest");
  result = applyClockBound(result, schedule.latest, "latest");
  result = roundToMinutes(result, schedule.roundTo);
  return result.toJSDate();
}

export function schedulesForDate(
  schedules: MinyanSchedule[],
  date: Date,
  org: Pick<
    Organization,
    | "timezone"
    | "amPmFormat"
    | "latitude"
    | "longitude"
    | "elevation"
    | "name"
    | "inIsrael"
    | "candleLightingMinutes"
  >,
  zmanConfig?: ZmanimConfig,
  now: Date = new Date(),
) {
  const config = zmanConfig ?? buildZmanimConfig(org);
  const engine = new ZmanimEngine(config);
  const weekday = DateTime.fromJSDate(date, { zone: org.timezone }).weekday % 7;
  const nowMs = now.getTime();

  const items = schedules
    .filter((s) => s.isActive)
    .filter((s) => !parseDetails(s.details).isPlaceholder)
    .filter((s) => s.dayOfWeekMask.length === 7 && s.dayOfWeekMask[weekday] === "1")
    .map((s) => {
      const time = resolveScheduleTime(s, date, engine, org.timezone);
      return {
        id: s.id,
        name: s.name,
        hebrewName: s.hebrewName,
        type: s.type,
        room: s.room,
        groupIds: parseGroupIds(s.scheduleGroupIds),
        sortOrder: s.sortOrder,
        time: time ? time.toISOString() : null,
        displayTime: formatZmanTime(time, org.timezone, org.amPmFormat),
        ms: time?.getTime() ?? Number.POSITIVE_INFINITY,
      };
    })
    .sort((a, b) => a.ms - b.ms || a.sortOrder - b.sortOrder);

  let nextId: string | null = null;
  for (const item of items) {
    if (item.ms >= nowMs) {
      nextId = item.id;
      break;
    }
  }

  return items.map(({ ms: _ms, ...item }) => ({
    ...item,
    isNext: item.id === nextId,
  }));
}

export function activeAnnouncements(rows: Announcement[], date: Date, timezone: string) {
  const day = DateTime.fromJSDate(date, { zone: timezone }).toISODate();
  return rows
    .filter((row) => row.isActive)
    .filter((row) => {
      if (row.startDate && day && row.startDate > day) return false;
      if (row.endDate && day && row.endDate < day) return false;
      return true;
    })
    .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title))
    .map((row) => ({
      id: row.id,
      title: row.title,
      titleHebrew: row.titleHebrew,
      content: row.content,
      contentHebrew: row.contentHebrew,
      priority: row.priority,
    }));
}
