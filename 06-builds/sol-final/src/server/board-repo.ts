import type { DisplayObject as DbObject, Media, MinyanSchedule, Style as DbStyle } from "@prisma/client";
import { prisma } from "../db/client";
import { defaultAppearance, type DisplayObjectAppearance } from "../core/board/appearance";
import type { BoardData, BoardMinyan, BoardNote } from "../core/board/types";
import {
  DisplayObjectType,
  type DisplayObject,
  type DisplayStyle,
  type ScreenStyleSchedule,
  type StyleActivationRule,
} from "../core/style-engine";
import type { ScheduleConfig } from "../core/scheduler";
import { DEFAULT_OPINIONS, type HalachicAuthority } from "../core/halachic-opinions";
import type { ZmanConfig } from "../core/zmanim-engine";
import { parseDetails } from "../domain/schedule-details";
import { mergeNotesForOrg } from "../domain/content";

/** Parse a W17 "?date=YYYY-MM-DD" override into a Date at local noon. */
export function parseDateOverride(dateParam: string | null | undefined): Date | null {
  if (!dateParam) return null;
  const d = new Date(`${dateParam}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapLanguage(value: string): DisplayObject["language"] {
  if (value === "english" || value === "hebrew" || value === "yiddish" || value === "both") return value;
  return "hebrew";
}

function appearanceFromRow(row: DbObject): DisplayObjectAppearance {
  return {
    textAlign: row.textAlign as DisplayObjectAppearance["textAlign"],
    verticalAlign: row.verticalAlign as DisplayObjectAppearance["verticalAlign"],
    lineHeight: row.lineHeight,
    backgroundMode: row.backgroundMode as DisplayObjectAppearance["backgroundMode"],
    backgroundColor: row.backColor,
    backgroundImage: row.backgroundImage,
    backgroundGradient: row.backgroundGradient,
    backgroundTexture: row.backgroundTexture,
    frameId: row.frameId,
    frameThickness: row.frameThickness,
    scrollingEnabled: row.scrollingEnabled,
    scrollingDirection: row.scrollingDirection as DisplayObjectAppearance["scrollingDirection"],
    scrollingSpeed: row.scrollingSpeed,
  };
}

function mapObject(row: DbObject): DisplayObject {
  let content: Record<string, unknown> = {};
  try {
    content = row.content ? (JSON.parse(row.content) as Record<string, unknown>) : {};
  } catch {
    content = {};
  }
  let scheduleRules: ScheduleConfig | undefined;
  if (row.scheduleRules) {
    try {
      const parsed = JSON.parse(row.scheduleRules) as ScheduleConfig | ScheduleConfig["rules"];
      if (Array.isArray(parsed)) {
        scheduleRules = parsed.length > 0 ? { rules: parsed, combineMode: "all" } : undefined;
      } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as ScheduleConfig).rules)) {
        scheduleRules = parsed as ScheduleConfig;
      }
    } catch {
      scheduleRules = undefined;
    }
  }
  let scheduleGroupVisibility: Record<string, boolean> | undefined;
  if (row.scheduleGroupVisibility) {
    try {
      scheduleGroupVisibility = JSON.parse(row.scheduleGroupVisibility) as Record<string, boolean>;
    } catch {
      scheduleGroupVisibility = undefined;
    }
  }

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
    appearance: appearanceFromRow(row),
    content,
    scheduleRules,
    scheduleGroupVisibility,
    visible: row.visible,
  };
}

function mapStyle(row: DbStyle, objects: DisplayObject[]): DisplayStyle {
  let activationRules: StyleActivationRule[] = [{ type: "default" }];
  try {
    activationRules = JSON.parse(row.activationRules) as StyleActivationRule[];
  } catch {
    activationRules = [{ type: "default" }];
  }
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
    activationRules,
    sortOrder: row.sortOrder,
  };
}

function mapMinyan(row: MinyanSchedule): BoardMinyan {
  let groupIds: string[] = [];
  if (row.scheduleGroupIds) {
    try {
      groupIds = JSON.parse(row.scheduleGroupIds) as string[];
    } catch {
      groupIds = [];
    }
  }
  const details = parseDetails(row.details);
  const roundDirection =
    details.roundMode === "before" ? "down" : details.roundMode === "after" ? "up" : details.roundMode === "nearest" ? "nearest" : "nearest";
  return {
    id: row.id,
    name: row.name,
    hebrewName: row.hebrewName,
    type: row.type,
    baseZman: row.baseZman,
    fixedTime: row.fixedTime,
    offsetMinutes: row.offset,
    roundTo: row.roundTo,
    roundDirection,
    earliest: row.earliest,
    latest: row.latest,
    groupIds,
    room: row.room,
    sortOrder: row.sortOrder,
  };
}

function mediaUrl(row: Media): string {
  const path = row.filePath.replace(/\\/g, "/");
  if (path.startsWith("uploads/")) return `/${path}`;
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

async function notesForBoard(orgId: string): Promise<BoardNote[]> {
  const merged = await mergeNotesForOrg(orgId);
  return merged
    .filter((n) => !n.hiddenByOrg && n.isActive)
    .map((n) => ({
      id: n.id,
      hebrewMonth: n.hebrewMonth,
      hebrewDay: n.hebrewDay,
      noteHebrew: n.noteHebrew,
      noteEnglish: n.noteEnglish,
      category: n.category,
    }));
}

function mergeZmanConfigs(
  rows: { zmanType: string; authority: string; degreesBelow: number | null; fixedMinutes: number | null; earliest: string | null; latest: string | null; roundTo: number | null; offset: number | null }[],
): ZmanConfig[] {
  const byType = new Map(rows.map((r) => [r.zmanType, r]));
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

export async function loadBoardData(orgSlug: string, screenId?: string): Promise<BoardData | null> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  let screenRow = screenId
    ? await prisma.screen.findFirst({ where: { orgId: org.id, id: screenId } })
    : await prisma.screen.findFirst({ where: { orgId: org.id }, orderBy: { createdAt: "asc" } });

  if (!screenRow && screenId) {
    const needle = screenId.toLowerCase();
    const screens = await prisma.screen.findMany({ where: { orgId: org.id } });
    screenRow =
      screens.find((s) => s.name.toLowerCase() === needle || s.name.toLowerCase().startsWith(needle)) ?? null;
  }
  if (!screenRow) return null;

  const styleRows = await prisma.style.findMany({ where: { orgId: org.id }, orderBy: { sortOrder: "asc" } });
  const styleIds = styleRows.map((s) => s.id);
  const objectRows =
    styleIds.length > 0
      ? await prisma.displayObject.findMany({ where: { styleId: { in: styleIds } } })
      : [];
  const objectsByStyle = new Map<string, DisplayObject[]>();
  for (const row of objectRows) {
    const list = objectsByStyle.get(row.styleId) ?? [];
    list.push(mapObject(row));
    objectsByStyle.set(row.styleId, list);
  }
  const mappedStyles = styleRows.map((row) => mapStyle(row, objectsByStyle.get(row.id) ?? []));

  let styleSchedules: ScreenStyleSchedule[] | null = null;
  if (screenRow.styleSchedules) {
    try {
      styleSchedules = JSON.parse(screenRow.styleSchedules) as ScreenStyleSchedule[];
    } catch {
      styleSchedules = null;
    }
  }

  const [minyanRows, memorialRows, announcementRows, sponsorRows, mediaRows, groupRows, zmanimConfigRows, notes] =
    await Promise.all([
      prisma.minyanSchedule.findMany({ where: { orgId: org.id, isActive: true } }),
      prisma.memorial.findMany({ where: { orgId: org.id, isActive: true } }),
      prisma.announcement.findMany({ where: { orgId: org.id, isActive: true } }),
      prisma.sponsor.findMany({ where: { orgId: org.id, isActive: true } }),
      prisma.media.findMany({ where: { orgId: org.id, isActive: true } }),
      prisma.scheduleGroup.findMany({ where: { orgId: org.id } }),
      prisma.zmanimConfig.findMany({ where: { orgId: org.id } }),
      notesForBoard(org.id),
    ]);

  let displayNameOverrides: Record<string, { english?: string; hebrew?: string }> = {};
  try {
    const settings = JSON.parse(org.settings || "{}") as {
      displayNameOverrides?: Record<string, { english?: string; hebrew?: string }>;
    };
    displayNameOverrides = settings.displayNameOverrides ?? {};
  } catch {
    displayNameOverrides = {};
  }

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
      styleSchedules,
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
      text: row.content,
      hebrewText: row.contentHebrew,
      sortOrder: row.priority,
    })),
    sponsors: sponsorRows.map((row) => ({
      id: row.id,
      text: row.englishText ?? row.sponsorName,
      hebrewText: row.hebrewText,
      sortOrder: 0,
    })),
    media: mediaRows.map((row) => ({
      id: row.id,
      url: mediaUrl(row),
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
    notes,
    displayNameOverrides,
  };
}
