// === What's in this file ===
// The one place that turns raw board data into a finished display snapshot (C3).
// It is pure: hand it the data loaded for a screen (already mapped out of the DB
// by the web repo adapter) plus "when/where/how", and it returns a single
// JSON-serializable DisplaySnapshot. No DB, no React, no clocks of its own.
//
// buildDisplaySnapshot(data, params) -- the whole pipeline:
//   1. pick the effective date (a W17 date override, else "now"),
//   2. resolve which style is active for that date + breakpoint (C9),
//   3. compute zmanim + calendar for every day-offset the visible widgets ask
//      for (e.g. a "tomorrow's zmanim" table needs offset 1),
//   4. resolve each minyan's actual time from those zmanim,
//   5. filter the style's objects down to the ones visible right now (C8),
//   6. package it all as a serialized snapshot.
//
// resolveMinyanTime() -- turns one minyan schedule (fixed time, or a zman + offset
//   + rounding) into a concrete time. Each minyan carries its own rounding
//   *direction* (nearest / up / down) that the shul picks when setting it up, so a
//   "5 minutes after sunrise" minyan can always round up (never before the zman),
//   another can round to the closest 5, etc.

import { DateTime } from "luxon";
import { JewishCalendar } from "kosher-zmanim";
import { CalendarEngine } from "../calendar-engine";
import { buildScheduleContext } from "../scheduler";
import {
  type DisplayStyle,
  getActiveStyle,
  getVisibleObjects,
  resolveScreenStyleSchedules,
  resolveStyleForScreen,
  sortObjectsByLayer,
} from "../style-engine";
import { ZmanimEngine, type ZmanConfig, type ZmanResult, type ZmanimConfig } from "../zmanim-engine";
import { DEFAULT_OPINIONS, ZmanType } from "../zman-types";
import type {
  BoardData,
  BoardMinyan,
  BoardMode,
  BoardNote,
  CalendarBundle,
  DisplaySnapshot,
  SharedBoardData,
  SnapshotMemorial,
  SnapshotMinyan,
  SnapshotObject,
  SnapshotZman,
} from "./types";

// Compute each memorial's next Hebrew anniversary across a full year, so the
// yahrzeit widget can show "today only" or "the next N days" entirely by filtering
// the precomputed daysUntil — there's always an occurrence within a year.
const MEMORIAL_LOOKAHEAD_DAYS = 366;

export interface SnapshotParams {
  now: Date;
  /** A W17 public date override; when set, all date math uses this instead of `now`. */
  dateOverride?: Date | null;
  breakpoint?: "mobile" | "tablet" | "full";
  mode?: BoardMode;
  /**
   * Extra day-offsets to compute zmanim/calendar for, on top of what the saved
   * objects ask for. The editor passes the offsets its UNSAVED widgets need so a
   * just-added "tomorrow's zmanim" box still gets real data in the live preview.
   */
  extraOffsets?: number[];
}

function defaultZmanConfigs(): ZmanConfig[] {
  return [...DEFAULT_OPINIONS.entries()].map(([type, opinion]) => ({
    type,
    authority: opinion.authority,
    degreesBelow: opinion.degreesBelow,
    fixedMinutes: opinion.fixedMinutes,
  }));
}

function buildZmanimConfig(data: BoardData): ZmanimConfig {
  return {
    location: data.org.location,
    zmanim: data.org.zmanim && data.org.zmanim.length > 0 ? data.org.zmanim : defaultZmanConfigs(),
    candleLightingMinutes: data.org.candleLightingMinutes,
  };
}

function dateAtOffset(base: Date, offsetDays: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

/** Which day-offsets the visible widgets need (always 0, plus any `daysAhead` on a widget). */
function neededOffsets(objects: { content: Record<string, unknown> }[]): number[] {
  const offsets = new Set<number>([0]);
  for (const obj of objects) {
    const raw = obj.content?.daysAhead;
    if (typeof raw === "number" && Number.isFinite(raw)) offsets.add(Math.trunc(raw));
  }
  return [...offsets].sort((a, b) => a - b);
}

function toSnapshotZman(z: ZmanResult): SnapshotZman {
  return {
    type: z.type,
    label: z.label,
    hebrewLabel: z.hebrewLabel,
    time: z.time ? z.time.toISOString() : null,
    authority: z.authority,
  };
}

// A fixed "HH:MM" minyan time means that wall-clock time in the SHUL's timezone,
// on the board's current day -- not the server's timezone (which is UTC on Vercel,
// a bug the live deploy caught: 13:30 was showing as 16:30 in Jerusalem).
function parseHHMM(value: string, baseDate: Date, timezone: string): Date | null {
  const parts = value.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const local = DateTime.fromJSDate(baseDate, { zone: timezone }).set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  });
  return local.isValid ? local.toJSDate() : null;
}

export type RoundDirection = "nearest" | "up" | "down" | "none";

function roundTime(date: Date, roundToMinutes: number, direction: RoundDirection): Date {
  // "none" = show the exact zman time (e.g. a minyan that starts at neitz, 5:33).
  if (direction === "none" || !roundToMinutes || roundToMinutes <= 0) return date;
  const ms = roundToMinutes * 60_000;
  const units = date.getTime() / ms;
  const rounded = direction === "up" ? Math.ceil(units) : direction === "down" ? Math.floor(units) : Math.round(units);
  return new Date(rounded * ms);
}

function clamp(time: Date, earliest: Date | null, latest: Date | null): Date {
  if (earliest && time < earliest) return earliest;
  if (latest && time > latest) return latest;
  return time;
}

export function resolveMinyanTime(
  minyan: BoardMinyan,
  zmanim: ZmanResult[],
  baseDate: Date,
  timezone: string,
): Date | null {
  let base: Date | null = null;

  if (minyan.fixedTime) {
    base = parseHHMM(minyan.fixedTime, baseDate, timezone);
  } else if (minyan.baseZman) {
    base = zmanim.find((z) => z.type === minyan.baseZman)?.time ?? null;
  }
  if (!base) return null;

  let time = new Date(base.getTime() + minyan.offsetMinutes * 60_000);
  time = roundTime(time, minyan.roundTo, minyan.roundDirection);
  const earliest = minyan.earliest ? parseHHMM(minyan.earliest, baseDate, timezone) : null;
  const latest = minyan.latest ? parseHHMM(minyan.latest, baseDate, timezone) : null;
  return clamp(time, earliest, latest);
}

/** Whole days from `from` to `to`, ignoring clock time (both read as their own local calendar day). */
function wholeDaysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}

/**
 * Days until a memorial's next Hebrew anniversary (0 = today), or null if it does
 * not fall within `windowDays`. Checks this Hebrew year and next so a date that
 * already passed this year rolls forward. A Hebrew day that doesn't exist in a
 * given year (e.g. 30 Cheshvan in a short year) simply has no occurrence that year.
 */
function daysUntilHebrewAnniversary(
  hebrewMonth: number,
  hebrewDay: number,
  effectiveDate: Date,
  windowDays: number,
): number | null {
  const todayJcal = new JewishCalendar(effectiveDate);
  const startYear = todayJcal.getJewishYear();
  let best: number | null = null;
  for (const year of [startYear, startYear + 1]) {
    let greg: Date;
    try {
      const jcal = new JewishCalendar(year, hebrewMonth, hebrewDay);
      greg = jcal.getDate().toJSDate();
    } catch {
      continue;
    }
    const diff = wholeDaysBetween(effectiveDate, greg);
    if (diff >= 0 && diff <= windowDays && (best === null || diff < best)) best = diff;
  }
  return best;
}

/** The daily notes (D16) whose Hebrew month/day match the given date. */
function notesForDate(notes: BoardNote[], date: Date): BoardNote[] {
  if (notes.length === 0) return [];
  const jcal = new JewishCalendar(date);
  const month = jcal.getJewishMonth();
  const day = jcal.getJewishDayOfMonth();
  return notes.filter((n) => n.hebrewMonth === month && n.hebrewDay === day);
}

function toSnapshotMinyan(minyan: BoardMinyan, time: Date | null): SnapshotMinyan {
  return {
    id: minyan.id,
    name: minyan.name,
    hebrewName: minyan.hebrewName,
    type: minyan.type,
    time: time ? time.toISOString() : null,
    groupIds: minyan.groupIds,
    room: minyan.room,
    sortOrder: minyan.sortOrder,
  };
}

export function buildDisplaySnapshot(data: BoardData, params: SnapshotParams): DisplaySnapshot {
  const now = params.now;
  const breakpoint = params.breakpoint ?? "full";
  const mode = params.mode ?? "display";
  const effectiveDate = params.dateOverride ?? now;
  const timezone = data.org.location.timezone;

  // 1. Active style for this date + breakpoint (schedules first, then legacy fallback).
  const schedules = resolveScreenStyleSchedules(data.screen.styleSchedules, data.screen.assignedStyleId, data.styles);
  const activeStyle: DisplayStyle | null =
    resolveStyleForScreen(schedules, data.styles, effectiveDate, breakpoint) ??
    getActiveStyle(data.styles, effectiveDate) ??
    data.styles[0] ??
    null;

  // 2. Zmanim + calendar for every offset the visible widgets reference.
  const zmanimEngine = new ZmanimEngine(buildZmanimConfig(data));
  const calendarEngine = new CalendarEngine(data.org.inIsrael);

  const offsets = [
    ...new Set([...neededOffsets(activeStyle?.objects ?? []), ...(params.extraOffsets ?? [])]),
  ].sort((a, b) => a - b);
  const zmanimByOffset: Record<string, SnapshotZman[]> = {};
  const calendarByOffset: Record<string, CalendarBundle> = {};
  let zmanimToday: ZmanResult[] = [];

  for (const offset of offsets) {
    const date = dateAtOffset(effectiveDate, offset);
    const dayZmanim = zmanimEngine.getZmanimForDate(date);
    if (offset === 0) zmanimToday = dayZmanim;
    zmanimByOffset[String(offset)] = dayZmanim.map(toSnapshotZman);
    calendarByOffset[String(offset)] = { ...calendarEngine.getAllInfo(date), notes: notesForDate(data.notes, date) };
  }

  // 3. Minyan times, resolved from today's zmanim.
  const minyanim: SnapshotMinyan[] = [...data.minyanim]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => toSnapshotMinyan(m, resolveMinyanTime(m, zmanimToday, effectiveDate, timezone)));

  // 4. Which objects are visible right now (C8). All schedule groups count as
  //    active here -- a group's day-applicability is expressed through per-object
  //    schedule rules and group visibility, not on the group row itself.
  const zmanimTimesMap = new Map<ZmanType | string, Date | null>();
  for (const z of zmanimToday) zmanimTimesMap.set(z.type, z.time);
  const activeGroupIds = new Set(data.scheduleGroups.map((g) => g.id));
  const context = buildScheduleContext(effectiveDate, timezone, zmanimTimesMap as Map<string, Date | null>, activeGroupIds);

  const visible = activeStyle ? sortObjectsByLayer(getVisibleObjects(activeStyle, context)) : [];
  const objects: SnapshotObject[] = visible.map((obj) => ({
    id: obj.id,
    type: obj.type,
    name: obj.name,
    position: obj.position,
    zIndex: obj.zIndex,
    font: obj.font,
    backgroundColor: obj.backgroundColor,
    language: obj.language,
    appearance: obj.appearance,
    content: obj.content,
  }));

  const sharedData: SharedBoardData = {
    now: now.toISOString(),
    timezone,
    zmanimByOffset,
    calendarByOffset,
    minyanim,
    memorials: data.memorials.map(
      (m): SnapshotMemorial => ({
        ...m,
        daysUntil: daysUntilHebrewAnniversary(m.hebrewMonth, m.hebrewDay, effectiveDate, MEMORIAL_LOOKAHEAD_DAYS),
      }),
    ),
    announcements: [...data.announcements].sort((a, b) => a.sortOrder - b.sortOrder),
    sponsors: [...data.sponsors].sort((a, b) => a.sortOrder - b.sortOrder),
    media: [...data.media].sort((a, b) => a.sortOrder - b.sortOrder),
    scheduleGroups: [...data.scheduleGroups].sort((a, b) => a.sortOrder - b.sortOrder),
    displayNameOverrides: data.displayNameOverrides ?? {},
  };

  return {
    generatedAt: new Date().toISOString(),
    effectiveDate: effectiveDate.toISOString(),
    mode,
    breakpoint,
    org: { id: data.org.id, name: data.org.name, slug: data.org.slug },
    screen: { id: data.screen.id, name: data.screen.name },
    style: activeStyle
      ? {
          id: activeStyle.id,
          name: activeStyle.name,
          canvasWidth: activeStyle.canvasWidth,
          canvasHeight: activeStyle.canvasHeight,
          backgroundColor: activeStyle.backgroundColor,
          backgroundMode: activeStyle.backgroundMode,
          backgroundImage: activeStyle.backgroundImage,
          backgroundGradient: activeStyle.backgroundGradient,
          backgroundTexture: activeStyle.backgroundTexture,
          backgroundFrameId: activeStyle.backgroundFrameId,
          backgroundFrameThickness: activeStyle.backgroundFrameThickness,
        }
      : null,
    objects,
    data: sharedData,
  };
}
