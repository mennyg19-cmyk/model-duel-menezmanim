import type { Organization, ZmanimConfig as DbZmanimConfig } from "@prisma/client";
import { DateTime } from "luxon";
import {
  CalendarEngine,
  DEFAULT_OPINIONS,
  ZmanType,
  ZmanimEngine,
  type ZmanConfig,
  type ZmanResult,
  type ZmanimConfig,
} from "../core";

const MORNING = new Set<string>([
  ZmanType.ALOS,
  ZmanType.ALOS_TUKACHINSKY,
  ZmanType.MISHEYAKIR,
  ZmanType.MISHEYAKIR_TUKACHINSKY,
  ZmanType.HANETZ,
  ZmanType.HANETZ_TUKACHINSKY,
  ZmanType.SOF_ZMAN_SHMA,
  ZmanType.SOF_ZMAN_SHMA_TUKACHINSKY,
  ZmanType.SOF_ZMAN_SHMA_MGA,
  ZmanType.SOF_ZMAN_SHMA_MGA_TUKACHINSKY,
  ZmanType.SOF_ZMAN_TEFILLAH,
  ZmanType.SOF_ZMAN_TEFILLAH_TUKACHINSKY,
  ZmanType.SOF_ZMAN_TEFILLAH_MGA,
  ZmanType.SOF_ZMAN_TEFILLAH_MGA_TUKACHINSKY,
]);

const AFTERNOON = new Set<string>([
  ZmanType.CHATZOS,
  ZmanType.MINCHA_GEDOLAH,
  ZmanType.MINCHA_GEDOLAH_TUKACHINSKY,
  ZmanType.MINCHA_KETANAH,
  ZmanType.MINCHA_KETANAH_TUKACHINSKY,
  ZmanType.PLAG_HAMINCHA,
  ZmanType.PLAG_HAMINCHA_TUKACHINSKY,
]);

export type OrgLocation = Pick<
  Organization,
  | "name"
  | "latitude"
  | "longitude"
  | "elevation"
  | "timezone"
  | "inIsrael"
  | "candleLightingMinutes"
>;

export function buildZmanimConfig(
  org: OrgLocation,
  overrides: DbZmanimConfig[] = [],
): ZmanimConfig {
  const overrideByType = new Map(overrides.map((row) => [row.zmanType, row]));
  const zmanim: ZmanConfig[] = [];

  for (const [type, opinion] of DEFAULT_OPINIONS.entries()) {
    const row = overrideByType.get(type);
    zmanim.push({
      type,
      authority: (row?.authority as ZmanConfig["authority"]) ?? opinion.authority,
      degreesBelow: row?.degreesBelow ?? opinion.degreesBelow,
      fixedMinutes: row?.fixedMinutes ?? opinion.fixedMinutes,
      limits: {
        earliest: row?.earliest ?? undefined,
        latest: row?.latest ?? undefined,
        roundTo: row?.roundTo ?? undefined,
        offset: row?.offset ?? undefined,
      },
    });
  }

  return {
    location: {
      name: org.name,
      latitude: org.latitude,
      longitude: org.longitude,
      elevation: org.elevation,
      timezone: org.timezone,
      inIsrael: org.inIsrael,
    },
    zmanim,
    candleLightingMinutes: org.candleLightingMinutes,
  };
}

export function zmanCategory(type: string): "morning" | "afternoon" | "evening" | "other" {
  if (MORNING.has(type)) return "morning";
  if (AFTERNOON.has(type)) return "afternoon";
  if (
    type.includes("SHKIAH") ||
    type.includes("TZAIS") ||
    type.includes("CANDLE") ||
    type.includes("HAVDALAH") ||
    type.includes("RABBEINU") ||
    type === ZmanType.CHATZOS_HALAILA
  ) {
    return "evening";
  }
  return "other";
}

export function formatZmanTime(time: Date | null, timezone: string, amPm: boolean): string | null {
  if (!time) return null;
  const dt = DateTime.fromJSDate(time, { zone: timezone });
  return dt.toFormat(amPm ? "h:mm a" : "HH:mm");
}

export function markNowZmanim(
  results: ZmanResult[],
  now: Date,
): Array<
  ZmanResult & {
    category: string;
    isHighlighted: boolean;
    timeIso: string | null;
    displayTime: string | null;
  }
> {
  const withTimes = results
    .map((z) => ({ z, ms: z.time?.getTime() ?? NaN }))
    .filter((row) => !Number.isNaN(row.ms))
    .sort((a, b) => a.ms - b.ms);

  const nowMs = now.getTime();
  let nowType: string | null = null;
  for (const row of withTimes) {
    if (row.ms <= nowMs) nowType = row.z.type;
    else break;
  }

  return results.map((z) => ({
    ...z,
    category: zmanCategory(z.type),
    isHighlighted: nowType !== null && z.type === nowType,
    timeIso: z.time ? z.time.toISOString() : null,
    displayTime: null,
  }));
}

export function computeOrgZmanim(
  org: OrgLocation & { amPmFormat?: boolean },
  date: Date,
  overrides: DbZmanimConfig[] = [],
  now: Date = new Date(),
) {
  const config = buildZmanimConfig(org, overrides);
  const engine = new ZmanimEngine(config);
  const raw = engine.getZmanimForDate(date);
  const marked = markNowZmanim(raw, now);
  return {
    config,
    zmanim: marked.map((z) => ({
      type: z.type,
      label: z.label,
      hebrewLabel: z.hebrewLabel,
      authority: z.authority,
      category: z.category,
      isHighlighted: z.isHighlighted,
      time: z.timeIso,
      displayTime: formatZmanTime(z.time, org.timezone, org.amPmFormat ?? false),
      originalTime: z.originalTime ? z.originalTime.toISOString() : null,
    })),
  };
}

export function computeOrgCalendar(org: Pick<Organization, "inIsrael">, date: Date) {
  const engine = new CalendarEngine(org.inIsrael);
  const info = engine.getAllInfo(date);
  return {
    date: date.toISOString(),
    jewishDate: info.date,
    parsha: info.parsha,
    holiday: info.holiday,
    omer: info.omer,
    dafYomi: info.dafYomi,
    tefilah: info.tefilah,
  };
}

export function parseDateParam(raw: string | null): Date | null {
  if (!raw) return new Date();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/** Count of ZmanType enum members (string enum keys). */
export function zmanTypeCount(): number {
  return Object.keys(ZmanType).length;
}
