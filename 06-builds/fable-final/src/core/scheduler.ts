// === What's in this file ===
// The rules engine that determines widget/event visibility based on
// combinations of time, date (Gregorian + Hebrew), halachic state, and
// zman-relative triggers.
//
// Types:
//   ScheduleRuleType       -- discriminator for the rule union.
//   GregorianRangeRule     -- active during a Gregorian month/day range.
//   HebrewRangeRule        -- active during a Hebrew month/day range.
//   DayOfWeekRule          -- 7-char bitmask for days of the week.
//   TimeRangeRule          -- HH:MM start/end (handles midnight wrap).
//   DstAwareRule           -- active during DST, standard time, or both.
//   ZmanTriggerRule        -- before/after a specific zman (with offset).
//   GroupTriggerRule       -- active when certain schedule groups are active.
//   RecurringRule          -- periodic: daily, weekly, monthly, yearly.
//   OneTimeRule            -- matches a single Gregorian date.
//   AlwaysRule             -- always active.
//   ScheduleRule           -- union of all rule types.
//   ScheduleConfig         -- a list of rules + combine mode (all/any).
//   ScheduleContext        -- runtime state passed to the evaluator.
//
// Functions:
//   isScheduleActive()     -- evaluates a ScheduleConfig against a context.
//   evaluateVisibilityCondition() -- evaluates one VisibilityRule against date + DST.
//   evaluateVisibilityRules()     -- evaluates a list of VisibilityRules.
//   buildScheduleContext()        -- builds ScheduleContext from a date + runtime info.
//
// Constants:
//   VISIBILITY_CONDITIONS  -- all possible conditions with English + Hebrew labels.

import { JewishCalendar } from "kosher-zmanim";
import {
  gregorianDayOfYear,
  hebrewOrdinal,
  isTimeRangeActive as isTimeActive,
} from "./calendar-utils";

export type ScheduleRuleType =
  | "gregorian_range"
  | "hebrew_range"
  | "day_of_week"
  | "time_range"
  | "dst_aware"
  | "zman_trigger"
  | "group_trigger"
  | "recurring"
  | "one_time"
  | "always";

export interface GregorianRangeRule {
  type: "gregorian_range";
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  startYear?: number;
  endYear?: number;
}

export interface HebrewRangeRule {
  type: "hebrew_range";
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  startYear?: number;
  endYear?: number;
}

export interface DayOfWeekRule {
  type: "day_of_week";
  mask: string;
}

export interface TimeRangeRule {
  type: "time_range";
  startTime: string;
  endTime: string;
}

export interface DstAwareRule {
  type: "dst_aware";
  showDuring: "dst" | "standard" | "both";
}

export interface ZmanTriggerRule {
  type: "zman_trigger";
  zmanType: string;
  offsetMinutes: number;
  showBefore: boolean;
}

export interface GroupTriggerRule {
  type: "group_trigger";
  groupIds: string[];
  showWhenActive: boolean;
}

export interface RecurringRule {
  type: "recurring";
  frequency:
    | "daily"
    | "weekly"
    | "monthly_gregorian"
    | "monthly_hebrew"
    | "yearly_gregorian"
    | "yearly_hebrew";
  interval: number;
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface OneTimeRule {
  type: "one_time";
  date: string;
}

export interface AlwaysRule {
  type: "always";
}

export type ScheduleRule =
  | GregorianRangeRule
  | HebrewRangeRule
  | DayOfWeekRule
  | TimeRangeRule
  | DstAwareRule
  | ZmanTriggerRule
  | GroupTriggerRule
  | RecurringRule
  | OneTimeRule
  | AlwaysRule;

export interface ScheduleConfig {
  rules: ScheduleRule[];
  combineMode: "all" | "any";
}

export interface ScheduleContext {
  currentTime: Date;
  zmanimTimes: Map<string, Date | null>;
  activeGroupIds: Set<string>;
  isDST: boolean;
  jewishDate: { year: number; month: number; day: number };
  timezone: string;
}

// ── Rule evaluators ─────────────────────────────────────────────────────────

function evaluateGregorianRange(
  rule: GregorianRangeRule,
  ctx: ScheduleContext,
): boolean {
  const d = ctx.currentTime;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if (rule.startYear !== undefined && year < rule.startYear) return false;
  if (rule.endYear !== undefined && year > rule.endYear) return false;

  const current = gregorianDayOfYear(month, day);
  const start = gregorianDayOfYear(rule.startMonth, rule.startDay);
  const end = gregorianDayOfYear(rule.endMonth, rule.endDay);

  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

function evaluateHebrewRange(
  rule: HebrewRangeRule,
  ctx: ScheduleContext,
): boolean {
  const { year, month, day } = ctx.jewishDate;

  if (rule.startYear !== undefined && year < rule.startYear) return false;
  if (rule.endYear !== undefined && year > rule.endYear) return false;

  const current = hebrewOrdinal(month, day);
  const start = hebrewOrdinal(rule.startMonth, rule.startDay);
  const end = hebrewOrdinal(rule.endMonth, rule.endDay);

  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

function evaluateDayOfWeek(rule: DayOfWeekRule, ctx: ScheduleContext): boolean {
  const dayIndex = ctx.currentTime.getDay();
  if (rule.mask.length !== 7) return false;
  return rule.mask[dayIndex] === "1";
}

function evaluateTimeRange(rule: TimeRangeRule, ctx: ScheduleContext): boolean {
  return isTimeActive(rule.startTime, rule.endTime, ctx.currentTime);
}

function evaluateDstAware(rule: DstAwareRule, ctx: ScheduleContext): boolean {
  if (rule.showDuring === "both") return true;
  if (rule.showDuring === "dst") return ctx.isDST;
  return !ctx.isDST;
}

function evaluateZmanTrigger(
  rule: ZmanTriggerRule,
  ctx: ScheduleContext,
): boolean {
  const zmanTime = ctx.zmanimTimes.get(rule.zmanType);
  if (!zmanTime) return false;

  const adjustedZman = new Date(
    zmanTime.getTime() + rule.offsetMinutes * 60_000,
  );
  if (rule.showBefore) {
    return ctx.currentTime.getTime() < adjustedZman.getTime();
  }
  return ctx.currentTime.getTime() >= adjustedZman.getTime();
}

function evaluateGroupTrigger(
  rule: GroupTriggerRule,
  ctx: ScheduleContext,
): boolean {
  const anyActive = rule.groupIds.some((id) => ctx.activeGroupIds.has(id));
  return rule.showWhenActive ? anyActive : !anyActive;
}

function evaluateRecurring(rule: RecurringRule, ctx: ScheduleContext): boolean {
  const d = ctx.currentTime;

  switch (rule.frequency) {
    case "daily":
      return true;

    case "weekly": {
      const dayOfWeek = d.getDay();
      return dayOfWeek % (rule.interval || 1) === 0;
    }

    case "monthly_gregorian": {
      const targetDay = rule.dayOfMonth ?? 1;
      if (d.getDate() !== targetDay) return false;
      if (rule.interval <= 1) return true;
      const month = d.getMonth();
      return month % rule.interval === 0;
    }

    case "monthly_hebrew": {
      const targetDay = rule.dayOfMonth ?? 1;
      if (ctx.jewishDate.day !== targetDay) return false;
      if (rule.interval <= 1) return true;
      return (ctx.jewishDate.month - 1) % rule.interval === 0;
    }

    case "yearly_gregorian": {
      const targetMonth = rule.monthOfYear ?? 1;
      const targetDay = rule.dayOfMonth ?? 1;
      return d.getMonth() + 1 === targetMonth && d.getDate() === targetDay;
    }

    case "yearly_hebrew": {
      const targetMonth = rule.monthOfYear ?? 7;
      const targetDay = rule.dayOfMonth ?? 1;
      return (
        ctx.jewishDate.month === targetMonth && ctx.jewishDate.day === targetDay
      );
    }
  }

  return false;
}

function evaluateOneTime(rule: OneTimeRule, ctx: ScheduleContext): boolean {
  const target = new Date(rule.date);
  const d = ctx.currentTime;
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

function evaluateRule(rule: ScheduleRule, ctx: ScheduleContext): boolean {
  switch (rule.type) {
    case "gregorian_range":
      return evaluateGregorianRange(rule, ctx);
    case "hebrew_range":
      return evaluateHebrewRange(rule, ctx);
    case "day_of_week":
      return evaluateDayOfWeek(rule, ctx);
    case "time_range":
      return evaluateTimeRange(rule, ctx);
    case "dst_aware":
      return evaluateDstAware(rule, ctx);
    case "zman_trigger":
      return evaluateZmanTrigger(rule, ctx);
    case "group_trigger":
      return evaluateGroupTrigger(rule, ctx);
    case "recurring":
      return evaluateRecurring(rule, ctx);
    case "one_time":
      return evaluateOneTime(rule, ctx);
    case "always":
      return true;
  }
}

export function isScheduleActive(
  config: ScheduleConfig,
  context: ScheduleContext,
): boolean {
  if (config.rules.length === 0) return true;

  if (config.combineMode === "all") {
    return config.rules.every((rule) => evaluateRule(rule, context));
  }
  return config.rules.some((rule) => evaluateRule(rule, context));
}

// ── Visibility condition evaluation ─────────────────────────────────────────

export type VisibilityCondition =
  | "weekday"
  | "shabbos"
  | "chol_hamoed"
  | "yom_tov"
  | "fast_day"
  | "erev_shabbos"
  | "erev_chag"
  | "erev_pesach"
  | "chanukah"
  | "behab"
  | "rosh_chodesh"
  | "purim"
  | "dst_on"
  | "dst_off"
  | "day_of_week"
  | "gregorian_date_range"
  | "hebrew_date_range";

export interface VisibilityRule {
  condition: VisibilityCondition;
  show: boolean;
  /** For day_of_week: 7-char mask "1001001" (0=Sun..6=Sat), 1=active */
  dayMask?: string;
  /** For gregorian_date_range: "MM-DD" recurring or "YYYY-MM-DD" one-time */
  startDate?: string;
  endDate?: string;
  /** For hebrew_date_range: "{hebrewMonth}-{day}" recurring (e.g. "5-9" for 9 Av) */
  startDateHebrew?: string;
  endDateHebrew?: string;
}

function hebrewMonthOrd(month: number): number {
  const M: Record<number, number> = {
    7: 1,
    8: 2,
    9: 3,
    10: 4,
    11: 5,
    12: 6,
    13: 7,
    1: 8,
    2: 9,
    3: 10,
    4: 11,
    5: 12,
    6: 13,
  };
  return M[month] ?? 0;
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function evaluateVisibilityCondition(
  rule: VisibilityRule,
  date: Date,
  isDST: boolean,
): boolean {
  const jCal = new JewishCalendar(date);
  const dow = date.getDay();

  switch (rule.condition) {
    case "weekday":
      return dow >= 0 && dow <= 4 && !jCal.isYomTov() && !jCal.isCholHamoed();
    case "shabbos":
      return dow === 6;
    case "chol_hamoed":
      return jCal.isCholHamoed();
    case "yom_tov":
      return jCal.isYomTov();
    case "fast_day":
      return jCal.isTaanis();
    case "erev_shabbos":
      return dow === 5;
    case "erev_chag":
      return jCal.isErevYomTov();
    case "erev_pesach":
      return (
        jCal.getJewishMonth() === 1 && jCal.getJewishDayOfMonth() === 14
      );
    case "chanukah":
      return jCal.isChanukah();
    case "behab": {
      const month = jCal.getJewishMonth();
      const day = jCal.getJewishDayOfMonth();
      const isMC = month === 8 || month === 2;
      if (!isMC) return false;
      return (dow === 1 || dow === 4) && day >= 1 && day <= 21;
    }
    case "rosh_chodesh":
      return jCal.isRoshChodesh();
    case "purim": {
      const month = jCal.getJewishMonth();
      const day = jCal.getJewishDayOfMonth();
      return (
        (month === 12 && day === 14) ||
        (month === 12 && day === 15) ||
        (month === 13 && day === 14) ||
        (month === 13 && day === 15)
      );
    }
    case "dst_on":
      return isDST;
    case "dst_off":
      return !isDST;
    case "day_of_week": {
      const mask = rule.dayMask ?? "1111111";
      return mask.length === 7 && mask[dow] === "1";
    }
    case "gregorian_date_range": {
      if (!rule.startDate || !rule.endDate) return true;
      if (rule.startDate.length <= 5) {
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const today = `${mm}-${dd}`;
        if (rule.startDate <= rule.endDate)
          return today >= rule.startDate && today <= rule.endDate;
        return today >= rule.startDate || today <= rule.endDate;
      }
      const today = formatLocalDate(date);
      return today >= rule.startDate && today <= rule.endDate;
    }
    case "hebrew_date_range": {
      if (!rule.startDateHebrew || !rule.endDateHebrew) return true;
      if (!rule.startDateHebrew.startsWith("20")) {
        const hm = jCal.getJewishMonth();
        const hd = jCal.getJewishDayOfMonth();
        const todayOrd = hebrewMonthOrd(hm) * 100 + hd;
        const [sm, sd] = rule.startDateHebrew.split("-").map(Number);
        const [em, ed] = rule.endDateHebrew.split("-").map(Number);
        const startOrd = hebrewMonthOrd(sm ?? 0) * 100 + (sd ?? 0);
        const endOrd = hebrewMonthOrd(em ?? 0) * 100 + (ed ?? 0);
        if (startOrd <= endOrd)
          return todayOrd >= startOrd && todayOrd <= endOrd;
        return todayOrd >= startOrd || todayOrd <= endOrd;
      }
      const today = formatLocalDate(date);
      return today >= rule.startDateHebrew && today <= rule.endDateHebrew;
    }
  }
}

export function evaluateVisibilityRules(
  rules: VisibilityRule[],
  date: Date,
  isDST: boolean,
): boolean {
  if (rules.length === 0) return true;
  for (const rule of rules) {
    const conditionMet = evaluateVisibilityCondition(rule, date, isDST);
    if (conditionMet && !rule.show) return false;
    if (!conditionMet && rule.show) return false;
  }
  return true;
}

export const VISIBILITY_CONDITIONS: {
  value: VisibilityCondition;
  label: string;
  labelHe: string;
}[] = [
  { value: "day_of_week", label: "Day of Week", labelHe: "יום בשבוע" },
  {
    value: "gregorian_date_range",
    label: "Gregorian Date Range",
    labelHe: "תאריך לועזי",
  },
  {
    value: "hebrew_date_range",
    label: "Hebrew Date Range",
    labelHe: "תאריך עברי",
  },
  { value: "dst_on", label: "DST (Summer Time)", labelHe: "שעון קיץ" },
  { value: "dst_off", label: "Standard Time (Winter)", labelHe: "שעון חורף" },
  { value: "weekday", label: "Weekday", labelHe: "יום חול" },
  { value: "shabbos", label: "Shabbos", labelHe: "שבת" },
  { value: "chol_hamoed", label: "Chol HaMoed", labelHe: "חול המועד" },
  { value: "yom_tov", label: "Yom Tov (Chag)", labelHe: "יום טוב" },
  { value: "fast_day", label: "Fast Day", labelHe: "תענית" },
  { value: "erev_shabbos", label: "Erev Shabbos", labelHe: "ערב שבת" },
  { value: "erev_chag", label: "Erev Chag", labelHe: "ערב חג" },
  { value: "erev_pesach", label: "Erev Pesach", labelHe: "ערב פסח" },
  { value: "chanukah", label: "Chanukah", labelHe: "חנוכה" },
  { value: "behab", label: "BaHaB Days", labelHe: 'בה"ב' },
  { value: "rosh_chodesh", label: "Rosh Chodesh", labelHe: "ראש חודש" },
  { value: "purim", label: "Purim", labelHe: "פורים" },
];

export function buildScheduleContext(
  date: Date,
  timezone: string,
  zmanimTimes: Map<string, Date | null>,
  activeGroupIds: Set<string>,
): ScheduleContext {
  const jCal = new JewishCalendar(date);

  const jan1 = new Date(date.getFullYear(), 0, 1);
  const jul1 = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(
    jan1.getTimezoneOffset(),
    jul1.getTimezoneOffset(),
  );
  const isDST = date.getTimezoneOffset() < stdOffset;

  return {
    currentTime: date,
    zmanimTimes,
    activeGroupIds,
    isDST,
    jewishDate: {
      year: jCal.getJewishYear(),
      month: jCal.getJewishMonth(),
      day: jCal.getJewishDayOfMonth(),
    },
    timezone,
  };
}
