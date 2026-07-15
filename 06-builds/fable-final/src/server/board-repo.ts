// Loads everything one screen needs and reshapes it into BoardData for the
// pure snapshot builder. The core never imports Drizzle — this is the only bridge.

import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db/client";
import {
  announcements,
  displayObjects,
  media,
  memorials,
  minyanSchedules,
  orgs,
  scheduleGroups,
  screens,
  sponsors,
  styles,
  tukachinskyNotes,
  zmanimConfigs,
} from "@/db/schema";
import type { BoardNote } from "@/core/board/types";
import type { DisplayObjectAppearance } from "@/core/board/appearance";
import {
  type DisplayObject,
  DisplayObjectType,
  type DisplayStyle,
  type ScreenStyleSchedule,
  type StyleActivationRule,
} from "@/core/style-engine";
import type { ScheduleConfig } from "@/core/scheduler";
import { DEFAULT_OPINIONS, type HalachicAuthority } from "@/core/zman-types";
import type { ZmanConfig } from "@/core/zmanim-engine";
import type { BoardData, BoardMinyan } from "@/core/board/types";

type StyleRow = typeof styles.$inferSelect;
type DisplayObjectRow = typeof displayObjects.$inferSelect;
type ZmanimConfigRow = typeof zmanimConfigs.$inferSelect;
type NoteRow = typeof tukachinskyNotes.$inferSelect;

/** Parse a W17 "?date=YYYY-MM-DD" override into a Date at local noon. Null when absent/invalid. */
export function parseDateOverride(dateParam: string | null | undefined): Date | null {
  if (!dateParam) return null;
  const d = new Date(`${dateParam}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapLanguage(value: string): DisplayObject["language"] {
  if (value === "english" || value === "hebrew" || value === "yiddish" || value === "both") return value;
  return "hebrew";
}

function mapAppearance(row: DisplayObjectRow): DisplayObjectAppearance {
  return {
    textAlign: row.textAlign as DisplayObjectAppearance["textAlign"],
    verticalAlign: row.verticalAlign as DisplayObjectAppearance["verticalAlign"],
    lineHeight: row.lineHeight ?? null,
    backgroundMode: row.backgroundMode as DisplayObjectAppearance["backgroundMode"],
    backgroundColor: row.backColor,
    backgroundImage: row.backgroundImage ?? null,
    backgroundGradient: row.backgroundGradient ?? null,
    backgroundTexture: row.backgroundTexture ?? null,
    frameId: row.frameId ?? null,
    frameThickness: row.frameThickness,
    scrollingEnabled: row.scrollingEnabled,
    scrollingDirection: row.scrollingDirection as DisplayObjectAppearance["scrollingDirection"],
    scrollingSpeed: row.scrollingSpeed,
  };
}

function mapObject(row: DisplayObjectRow): DisplayObject {
  const scheduleRules = row.scheduleRules as unknown as ScheduleConfig["rules"] | null;
  return {
    id: row.id,
    type: row.type as DisplayObjectType,
    name: row.name,
    position: { x: row.posX, y: row.posY, width: row.width, height: row.height },
    zIndex: row.layer,
    font: {
      family: row.fontFamily,
      size: row.fontSize,
      bold: row.fontBold,
      italic: row.fontItalic,
      color: row.foreColor,
    },
    backgroundColor: row.backColor,
    language: mapLanguage(row.language),
    appearance: mapAppearance(row),
    content: (row.content as Record<string, unknown> | null) ?? {},
    scheduleRules:
      scheduleRules && scheduleRules.length > 0 ? { rules: scheduleRules, combineMode: "all" } : undefined,
    scheduleGroupVisibility: (row.scheduleGroupVisibility as Record<string, boolean> | null) ?? undefined,
    visible: row.visible,
  };
}

function mapStyle(row: StyleRow, objects: DisplayObject[]): DisplayStyle {
  return {
    id: row.id,
    name: row.name,
    backgroundColor: row.backgroundColor,
    backgroundMode: row.backgroundMode as DisplayStyle["backgroundMode"],
    backgroundImage: row.backgroundImage ?? undefined,
    backgroundGradient: row.backgroundGradient ?? undefined,
    backgroundTexture: row.backgroundTexture ?? undefined,
    backgroundFrameId: row.backgroundFrameId,
    backgroundFrameThickness: row.backgroundFrameThickness,
    canvasWidth: row.canvasWidth,
    canvasHeight: row.canvasHeight,
    objects,
    activationRules: (row.activationRules as unknown as StyleActivationRule[]) ?? [],
    sortOrder: row.sortOrder,
  };
}

function mergeZmanConfigs(rows: ZmanimConfigRow[]): ZmanConfig[] {
  const byType = new Map<string, ZmanimConfigRow>();
  for (const row of rows) byType.set(row.zmanType, row);

  return [...DEFAULT_OPINIONS.entries()].map(([type, opinion]) => {
    const override = byType.get(type);
    if (!override) {
      return { type, authority: opinion.authority, degreesBelow: opinion.degreesBelow, fixedMinutes: opinion.fixedMinutes };
    }
    return {
      type,
      authority: override.authority as HalachicAuthority,
      degreesBelow: override.degreesBelow ?? opinion.degreesBelow,
      fixedMinutes: override.fixedMinutes ?? opinion.fixedMinutes,
      limits: {
        earliest: override.earliest ?? undefined,
        latest: override.latest ?? undefined,
        roundTo: override.roundTo ?? undefined,
        offset: override.offset ?? undefined,
      },
    };
  });
}

function defaultZmanConfigs(): ZmanConfig[] {
  return [...DEFAULT_OPINIONS.entries()].map(([type, opinion]) => ({
    type,
    authority: opinion.authority,
    degreesBelow: opinion.degreesBelow,
    fixedMinutes: opinion.fixedMinutes,
  }));
}

function mapMinyan(row: typeof minyanSchedules.$inferSelect): BoardMinyan {
  const groupIds = (row.scheduleGroupIds as string[] | null) ?? [];
  return {
    id: row.id,
    name: row.name,
    hebrewName: row.hebrewName,
    type: row.type,
    baseZman: row.baseZman,
    fixedTime: row.fixedTime,
    offsetMinutes: row.offset,
    roundTo: row.roundTo,
    roundDirection: (row.roundDirection as BoardMinyan["roundDirection"]) ?? "nearest",
    earliest: row.earliest,
    latest: row.latest,
    groupIds,
    room: row.room,
    sortOrder: row.sortOrder,
  };
}

function resolveEffectiveNotes(rows: NoteRow[]): BoardNote[] {
  const orgRows = rows.filter((r) => r.orgId !== null);
  const baseRows = rows.filter((r) => r.orgId === null);
  const suppressedBaselineIds = new Set(orgRows.filter((r) => r.baselineId).map((r) => r.baselineId as string));

  const result: NoteRow[] = [];
  for (const base of baseRows) {
    if (suppressedBaselineIds.has(base.id)) continue;
    if (!base.isHidden) result.push(base);
  }
  for (const own of orgRows) {
    if (!own.isHidden) result.push(own);
  }

  return result.map((r) => ({
    id: r.id,
    hebrewMonth: r.hebrewMonth,
    hebrewDay: r.hebrewDay,
    noteHebrew: r.noteHebrew,
    noteEnglish: r.noteEnglish,
    category: r.category,
  }));
}

export interface OrgZmanimContext {
  org: { id: string; name: string; slug: string };
  location: BoardData["org"]["location"];
  zmanim: ZmanConfig[];
  candleLightingMinutes: number;
  inIsrael: boolean;
}

export async function loadOrgZmanimContext(orgSlug: string): Promise<OrgZmanimContext | null> {
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, orgSlug)).limit(1);
  if (!org) return null;

  const zmanimConfigRows = await db.select().from(zmanimConfigs).where(eq(zmanimConfigs.orgId, org.id));

  return {
    org: { id: org.id, name: org.name, slug: org.slug },
    location: {
      name: org.name,
      latitude: org.latitude,
      longitude: org.longitude,
      elevation: org.elevation,
      timezone: org.timezone,
      inIsrael: org.inIsrael,
    },
    zmanim: zmanimConfigRows.length > 0 ? mergeZmanConfigs(zmanimConfigRows) : defaultZmanConfigs(),
    candleLightingMinutes: org.candleLightingMinutes,
    inIsrael: org.inIsrael,
  };
}

export async function loadBoardData(orgSlug: string, screenId?: string): Promise<BoardData | null> {
  const [org] = await db.select().from(orgs).where(eq(orgs.slug, orgSlug)).limit(1);
  if (!org) return null;

  const screenRow = screenId
    ? (await db.select().from(screens).where(and(eq(screens.orgId, org.id), eq(screens.id, screenId))).limit(1))[0]
    : (await db.select().from(screens).where(eq(screens.orgId, org.id)).orderBy(asc(screens.createdAt)).limit(1))[0];
  if (!screenRow) return null;

  const styleRows = await db.select().from(styles).where(eq(styles.orgId, org.id)).orderBy(asc(styles.sortOrder));
  const styleIds = styleRows.map((s) => s.id);
  const objectRows =
    styleIds.length > 0 ? await db.select().from(displayObjects).where(inArray(displayObjects.styleId, styleIds)) : [];
  const objectsByStyle = new Map<string, DisplayObject[]>();
  for (const row of objectRows) {
    const list = objectsByStyle.get(row.styleId) ?? [];
    list.push(mapObject(row));
    objectsByStyle.set(row.styleId, list);
  }
  const mappedStyles = styleRows.map((row) => mapStyle(row, objectsByStyle.get(row.id) ?? []));

  const [minyanRows, memorialRows, announcementRows, sponsorRows, mediaRows, groupRows, zmanimConfigRows, noteRows] =
    await Promise.all([
      db.select().from(minyanSchedules).where(and(eq(minyanSchedules.orgId, org.id), eq(minyanSchedules.isActive, true))),
      db.select().from(memorials).where(and(eq(memorials.orgId, org.id), eq(memorials.isActive, true))),
      db.select().from(announcements).where(and(eq(announcements.orgId, org.id), eq(announcements.isActive, true))),
      db.select().from(sponsors).where(and(eq(sponsors.orgId, org.id), eq(sponsors.isActive, true))),
      db.select().from(media).where(and(eq(media.orgId, org.id), eq(media.isActive, true))),
      db.select().from(scheduleGroups).where(eq(scheduleGroups.orgId, org.id)),
      db.select().from(zmanimConfigs).where(eq(zmanimConfigs.orgId, org.id)),
      db.select().from(tukachinskyNotes).where(or(eq(tukachinskyNotes.orgId, org.id), isNull(tukachinskyNotes.orgId))),
    ]);

  const settings = (org.settings ?? {}) as {
    displayNameOverrides?: Record<string, { english?: string; hebrew?: string }>;
  };

  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      location: {
        name: org.name,
        latitude: org.latitude,
        longitude: org.longitude,
        elevation: org.elevation,
        timezone: org.timezone,
        inIsrael: org.inIsrael,
      },
      zmanim: zmanimConfigRows.length > 0 ? mergeZmanConfigs(zmanimConfigRows) : undefined,
      candleLightingMinutes: org.candleLightingMinutes,
      inIsrael: org.inIsrael,
    },
    screen: {
      id: screenRow.id,
      name: screenRow.name,
      assignedStyleId: screenRow.assignedStyleId,
      styleSchedules: (screenRow.styleSchedules as unknown as ScreenStyleSchedule[] | null) ?? null,
      resolution: screenRow.resolution,
    },
    styles: mappedStyles,
    minyanim: minyanRows.map(mapMinyan),
    memorials: memorialRows.map((row) => ({
      id: row.id,
      hebrewName: row.hebrewName,
      englishName: row.englishName,
      relationship: row.relationship,
      hebrewMonth: row.hebrewMonth,
      hebrewDay: row.hebrewDay,
      isYahrzeit: row.isYahrzeit,
    })),
    announcements: announcementRows.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.content,
      hebrewText: row.contentHebrew,
      sortOrder: row.priority,
      priority: row.priority,
    })),
    sponsors: sponsorRows.map((row) => ({
      id: row.id,
      text: row.englishText ?? row.sponsorName,
      hebrewText: row.hebrewText,
      sortOrder: 0,
    })),
    media: mediaRows.map((row) => ({
      id: row.id,
      url: row.filePath,
      kind: row.mimeType,
      sortOrder: row.sortOrder,
    })),
    scheduleGroups: groupRows.map((row) => ({
      id: row.id,
      name: row.name,
      hebrewName: row.hebrewName,
      color: row.color,
      sortOrder: row.sortOrder,
    })),
    notes: resolveEffectiveNotes(noteRows),
    displayNameOverrides: settings.displayNameOverrides ?? {},
  };
}
