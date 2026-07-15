// === What's in this file ===
// The "which board, and which parts of it, show right now" engine (C9). It is
// pure: it works on plain domain shapes (DisplayStyle / DisplayObject), never the
// database rows directly, so it has no DB or React imports. The snapshot builder
// (src/core/board) maps DB rows into these shapes and calls this.
//
// Types:
//   DisplayBreakpoint / ScreenScheduleBreakpoint -- screen size buckets.
//   DayType / StyleScheduleRule / ScreenStyleSchedule -- the breakpoint-aware
//     style scheduling on a Screen (D2.styleSchedules), the canonical way a style
//     is chosen for a date (legacy per-style activationRules are migrated into it).
//   DisplayObjectType -- the widget type enum (keys the W1-W17 registry).
//   DisplayObject / DisplayStyle -- the shaped board + its widgets.
//
// Functions:
//   evaluateDayType() / evaluateStyleScheduleRule() / evaluateStyleScheduleRules()
//     -- decide if a style-schedule entry matches a given date.
//   resolveScreenStyleSchedules() -- the effective schedules for a screen, migrating
//     a legacy assignedStyleId + per-style activationRules when no JSON is set (F-CORE3).
//   orderedScreenSchedulesForBreakpoint() -- breakpoint-specific first, then "all".
//   getActiveStyle() -- pick the style for a date from per-style activationRules
//     (the fallback when a screen has no styleSchedules).
//   getVisibleObjects() -- filter a style's objects by per-object schedule rules
//     (C8 via scheduler) and schedule-group visibility.
//   sortObjectsByLayer() -- draw order (z-index ascending).

import { JewishCalendar } from "kosher-zmanim";
import { gregorianDayOfYear, hebrewOrdinal } from "./calendar-utils";
import { type ScheduleConfig, type ScheduleContext, isScheduleActive } from "./scheduler";
import type { DisplayObjectAppearance } from "./board/appearance";

export type DisplayBreakpoint = "mobile" | "tablet" | "full";
export type ScreenScheduleBreakpoint = DisplayBreakpoint | "all";

export type DayType =
  | "weekday"
  | "shabbos"
  | "erev_shabbos"
  | "erev_yom_tov"
  | "yom_tov"
  | "chol_hamoed"
  | "rosh_chodesh"
  | "erev_pesach"
  | "chanukah"
  | "yom_kippur"
  | "fast_day"
  | "purim";

export const DAY_TYPE_OPTIONS: { value: DayType; label: string }[] = [
  { value: "weekday", label: "Weekday" },
  { value: "shabbos", label: "Shabbos" },
  { value: "erev_shabbos", label: "Erev Shabbos" },
  { value: "erev_yom_tov", label: "Erev Yom Tov" },
  { value: "yom_tov", label: "Yom Tov" },
  { value: "chol_hamoed", label: "Chol HaMoed" },
  { value: "rosh_chodesh", label: "Rosh Chodesh" },
  { value: "erev_pesach", label: "Erev Pesach" },
  { value: "chanukah", label: "Chanukah" },
  { value: "yom_kippur", label: "Yom Kippur" },
  { value: "fast_day", label: "Fast day" },
  { value: "purim", label: "Purim" },
];

export type StyleScheduleRule =
  | { type: "default" }
  | { type: "hebrew_date_range"; startMonth: number; startDay: number; endMonth: number; endDay: number }
  | { type: "gregorian_date_range"; startMonth: number; startDay: number; endMonth: number; endDay: number }
  | { type: "hebrew_month"; month: number }
  | { type: "gregorian_month"; month: number }
  | { type: "day_of_week"; days: number[] }
  | { type: "day_type"; dayType: DayType }
  | { type: "week_of_month"; week: number };

export interface ScreenStyleSchedule {
  id: string;
  styleId: string;
  breakpoint: ScreenScheduleBreakpoint;
  rules: StyleScheduleRule[];
  priority: number;
}

export enum DisplayObjectType {
  ZMANIM_TABLE = "ZMANIM_TABLE",
  JEWISH_INFO = "JEWISH_INFO",
  DIGITAL_CLOCK = "DIGITAL_CLOCK",
  ANALOG_CLOCK = "ANALOG_CLOCK",
  PLAIN_TEXT = "PLAIN_TEXT",
  RICH_TEXT = "RICH_TEXT",
  MEDIA_VIEWER = "MEDIA_VIEWER",
  EVENTS_TABLE = "EVENTS_TABLE",
  YAHRZEIT_DISPLAY = "YAHRZEIT_DISPLAY",
  SCROLLING_TICKER = "SCROLLING_TICKER",
  FIDS_BOARD = "FIDS_BOARD",
  SEFIRA_COUNTER = "SEFIRA_COUNTER",
  COUNTDOWN_TIMER = "COUNTDOWN_TIMER",
  DATE_PICKER = "DATE_PICKER",
  // Built fresh in the rebuild (no v1/v2 enum entry):
  SPONSOR_DISPLAY = "SPONSOR_DISPLAY",
  SHAPE_DIVIDER = "SHAPE_DIVIDER",
  TEFILAH_NOTES = "TEFILAH_NOTES",
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FontStyle {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;
}

export interface DisplayObject {
  id: string;
  type: DisplayObjectType;
  name: string;
  position: Position;
  zIndex: number;
  font: FontStyle;
  backgroundColor: string;
  language: "hebrew" | "english" | "yiddish" | "both";
  appearance: DisplayObjectAppearance;
  content: Record<string, unknown>;
  scheduleRules?: ScheduleConfig;
  scheduleGroupVisibility?: Record<string, boolean>;
  visible: boolean;
}

export interface StyleActivationRule {
  type: "hebrew_date_range" | "gregorian_date_range" | "default";
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
}

export type CanvasBackgroundMode = "solid" | "gradient" | "texture" | "image";

export interface DisplayStyle {
  id: string;
  name: string;
  backgroundImage?: string;
  backgroundColor: string;
  backgroundMode?: CanvasBackgroundMode;
  backgroundGradient?: string;
  backgroundTexture?: string;
  backgroundFrameId?: string | null;
  backgroundFrameThickness?: number | null;
  canvasWidth: number;
  canvasHeight: number;
  objects: DisplayObject[];
  activationRules: StyleActivationRule[];
  sortOrder: number;
}

export type DisplayNameOverrides = Record<string, { english?: string; hebrew?: string }>;

function rangeActive(current: number, start: number, end: number): boolean {
  if (start <= end) return current >= start && current <= end;
  // Range that wraps past the year boundary (e.g. Adar -> Nissan).
  return current >= start || current <= end;
}

function weekOfMonthFromDate(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

/** Calendar day-type test for screen style scheduling (kosher-zmanim months: 1=Nissan…13=Adar II). */
export function evaluateDayType(dayType: DayType, date: Date, jCal: JewishCalendar): boolean {
  const dow = date.getDay();
  const m = jCal.getJewishMonth();
  const day = jCal.getJewishDayOfMonth();

  switch (dayType) {
    case "weekday":
      return dow >= 0 && dow <= 4 && !jCal.isYomTov() && !jCal.isCholHamoed();
    case "shabbos":
      return dow === 6;
    case "erev_shabbos":
      return dow === 5;
    case "erev_yom_tov":
      return jCal.isErevYomTov();
    case "yom_tov":
      return jCal.isYomTov();
    case "chol_hamoed":
      return jCal.isCholHamoed();
    case "rosh_chodesh":
      return jCal.isRoshChodesh();
    case "erev_pesach":
      return m === 1 && day === 14;
    case "chanukah":
      return jCal.isChanukah();
    case "yom_kippur":
      return m === 7 && day === 10;
    case "fast_day":
      return jCal.isTaanis();
    case "purim":
      return (m === 12 && (day === 14 || day === 15)) || (m === 13 && (day === 14 || day === 15));
    default:
      return false;
  }
}

export function evaluateStyleScheduleRule(rule: StyleScheduleRule, date: Date, jCal: JewishCalendar): boolean {
  const gregMonth = date.getMonth() + 1;
  const gregDay = date.getDate();
  const jewishMonth = jCal.getJewishMonth();
  const jewishDay = jCal.getJewishDayOfMonth();

  switch (rule.type) {
    case "default":
      return true;
    case "gregorian_date_range":
      return rangeActive(
        gregorianDayOfYear(gregMonth, gregDay),
        gregorianDayOfYear(rule.startMonth, rule.startDay),
        gregorianDayOfYear(rule.endMonth, rule.endDay),
      );
    case "hebrew_date_range":
      return rangeActive(
        hebrewOrdinal(jewishMonth, jewishDay),
        hebrewOrdinal(rule.startMonth, rule.startDay),
        hebrewOrdinal(rule.endMonth, rule.endDay),
      );
    case "gregorian_month":
      return gregMonth === rule.month;
    case "hebrew_month":
      return jewishMonth === rule.month;
    case "day_of_week":
      return rule.days.includes(date.getDay());
    case "day_type":
      return evaluateDayType(rule.dayType, date, jCal);
    case "week_of_month":
      return weekOfMonthFromDate(date) === rule.week;
    default:
      return false;
  }
}

/** Every rule in an entry must match (AND). An empty rule list never matches. */
export function evaluateStyleScheduleRules(rules: StyleScheduleRule[], date: Date): boolean {
  if (rules.length === 0) return false;
  const jCal = new JewishCalendar(date);
  return rules.every((r) => evaluateStyleScheduleRule(r, date, jCal));
}

function styleActivationRuleToScheduleRule(rule: StyleActivationRule): StyleScheduleRule | null {
  if (rule.type === "default") return { type: "default" };
  if (
    rule.startMonth != null &&
    rule.startDay != null &&
    rule.endMonth != null &&
    rule.endDay != null
  ) {
    if (rule.type === "gregorian_date_range") {
      return {
        type: "gregorian_date_range",
        startMonth: rule.startMonth,
        startDay: rule.startDay,
        endMonth: rule.endMonth,
        endDay: rule.endDay,
      };
    }
    if (rule.type === "hebrew_date_range") {
      return {
        type: "hebrew_date_range",
        startMonth: rule.startMonth,
        startDay: rule.startDay,
        endMonth: rule.endMonth,
        endDay: rule.endDay,
      };
    }
  }
  return null;
}

/** Effective screen schedules: the stored entries, or a migration from a legacy assignedStyleId + the style's activationRules (F-CORE3). */
export function resolveScreenStyleSchedules(
  styleSchedules: ScreenStyleSchedule[] | null | undefined,
  assignedStyleId: string | null | undefined,
  styles: DisplayStyle[],
): ScreenStyleSchedule[] {
  if (styleSchedules && styleSchedules.length > 0) return styleSchedules;
  if (!assignedStyleId) return [];

  const style = styles.find((s) => s.id === assignedStyleId);
  const rules = style?.activationRules ?? [{ type: "default" as const }];
  const specific = rules.filter((r) => r.type !== "default");
  const hasDefault = rules.some((r) => r.type === "default");

  const out: ScreenStyleSchedule[] = [];
  let priority = 0;
  for (const activationRule of specific) {
    const scheduleRule = styleActivationRuleToScheduleRule(activationRule);
    if (scheduleRule && scheduleRule.type !== "default") {
      out.push({
        id: `mig-${assignedStyleId}-${priority}`,
        styleId: assignedStyleId,
        breakpoint: "all",
        rules: [scheduleRule],
        priority: priority++,
      });
    }
  }
  if (hasDefault || out.length === 0) {
    out.push({
      id: `mig-${assignedStyleId}-def`,
      styleId: assignedStyleId,
      breakpoint: "all",
      rules: [{ type: "default" }],
      priority,
    });
  }
  return out;
}

export function orderedScreenSchedulesForBreakpoint(
  schedules: ScreenStyleSchedule[],
  breakpoint: DisplayBreakpoint,
): ScreenStyleSchedule[] {
  const specific = schedules.filter((s) => s.breakpoint === breakpoint).sort((a, b) => a.priority - b.priority);
  const allBp = schedules.filter((s) => s.breakpoint === "all").sort((a, b) => a.priority - b.priority);
  return [...specific, ...allBp];
}

/** Pick the active style for a screen on a date, honoring breakpoint-aware schedules then a plain default. */
export function resolveStyleForScreen(
  schedules: ScreenStyleSchedule[],
  styles: DisplayStyle[],
  date: Date,
  breakpoint: DisplayBreakpoint,
): DisplayStyle | null {
  const ordered = orderedScreenSchedulesForBreakpoint(schedules, breakpoint);
  for (const schedule of ordered) {
    if (evaluateStyleScheduleRules(schedule.rules, date)) {
      const style = styles.find((s) => s.id === schedule.styleId);
      if (style) return style;
    }
  }
  return null;
}

function isStyleActiveForDate(
  style: DisplayStyle,
  gregMonth: number,
  gregDay: number,
  jewishMonth: number,
  jewishDay: number,
): "match" | "default" | "none" {
  let hasDefault = false;

  for (const rule of style.activationRules) {
    if (rule.type === "default") {
      hasDefault = true;
      continue;
    }
    if (rule.startMonth == null || rule.startDay == null || rule.endMonth == null || rule.endDay == null) {
      continue;
    }
    if (
      rule.type === "gregorian_date_range" &&
      rangeActive(
        gregorianDayOfYear(gregMonth, gregDay),
        gregorianDayOfYear(rule.startMonth, rule.startDay),
        gregorianDayOfYear(rule.endMonth, rule.endDay),
      )
    ) {
      return "match";
    }
    if (
      rule.type === "hebrew_date_range" &&
      rangeActive(
        hebrewOrdinal(jewishMonth, jewishDay),
        hebrewOrdinal(rule.startMonth, rule.startDay),
        hebrewOrdinal(rule.endMonth, rule.endDay),
      )
    ) {
      return "match";
    }
  }

  return hasDefault ? "default" : "none";
}

/** Fallback style picker from per-style activationRules (used when a screen has no styleSchedules). */
export function getActiveStyle(styles: DisplayStyle[], date: Date): DisplayStyle | null {
  if (styles.length === 0) return null;

  const jCal = new JewishCalendar(date);
  const gregMonth = date.getMonth() + 1;
  const gregDay = date.getDate();
  const jewishMonth = jCal.getJewishMonth();
  const jewishDay = jCal.getJewishDayOfMonth();

  const sorted = [...styles].sort((a, b) => a.sortOrder - b.sortOrder);
  let defaultStyle: DisplayStyle | null = null;

  for (const style of sorted) {
    const result = isStyleActiveForDate(style, gregMonth, gregDay, jewishMonth, jewishDay);
    if (result === "match") return style;
    if (result === "default" && defaultStyle === null) defaultStyle = style;
  }

  return defaultStyle;
}

export function getVisibleObjects(style: DisplayStyle, context: ScheduleContext): DisplayObject[] {
  return style.objects.filter((obj) => {
    if (!obj.visible) return false;

    if (obj.scheduleRules && obj.scheduleRules.rules.length > 0) {
      if (!isScheduleActive(obj.scheduleRules, context)) return false;
    }

    if (obj.scheduleGroupVisibility) {
      const entries = Object.entries(obj.scheduleGroupVisibility);
      if (entries.length > 0) {
        const hasActiveVisibleGroup = entries.some(
          ([groupId, shouldShow]) => shouldShow && context.activeGroupIds.has(groupId),
        );
        if (!hasActiveVisibleGroup) return false;
      }
    }

    return true;
  });
}

export function sortObjectsByLayer(objects: DisplayObject[]): DisplayObject[] {
  return [...objects].sort((a, b) => a.zIndex - b.zIndex);
}
