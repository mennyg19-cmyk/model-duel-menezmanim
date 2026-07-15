// === What's in this file ===
// The data contracts for the one display snapshot (C3). A "snapshot" is the
// single, fully-resolved, JSON-serializable description of what one screen shows
// at one moment: which style/objects are visible, plus all the shared data the
// widgets draw from (zmanim, calendar, minyan times, memorials, etc.). Every
// surface -- the /show page, the /api/display endpoint, the desktop, and later
// cloud sync -- consumes this same shape, so there is exactly one render path.
//
// BoardMode -- where the board is being shown (affects scaling/interactions).
// BoardOrg / BoardMinyan / BoardMemorial / ... -- the domain inputs the builder
//   needs, already mapped out of the database by the web-side repo adapter (the
//   core never touches Drizzle directly).
// BoardData -- everything loaded for one screen, handed to the pure builder.
// SnapshotZman / SnapshotMinyan / CalendarBundle / SharedBoardData -- the
//   resolved, serialized data the widgets read.
// DisplaySnapshot -- the final object the builder returns.

import type { ZmanimLocation, ZmanConfig } from "../zmanim-engine";
import type { HalachicAuthority, ZmanType } from "../zman-types";
import type {
  DafYomiInfo,
  HolidayInfo,
  JewishDateInfo,
  OmerInfo,
  ParshaInfo,
  TefilahRulesInfo,
} from "../calendar-engine";
import type { DisplayStyle } from "../style-engine";
import type { DisplayObjectAppearance } from "./appearance";

export type BoardMode = "display" | "preview" | "mobile" | "export";

export interface BoardOrg {
  id: string;
  name: string;
  slug: string;
  location: ZmanimLocation;
  /** Per-org zman calculation overrides; when omitted the engine uses DEFAULT_OPINIONS. */
  zmanim?: ZmanConfig[];
  candleLightingMinutes: number;
  inIsrael: boolean;
}

export interface BoardMinyan {
  id: string;
  name: string;
  hebrewName: string;
  type: string;
  /** A zman key (ZmanType) the time is derived from, or null when fixedTime is used. */
  baseZman: string | null;
  /** "HH:MM" wall-clock time, or null when derived from a zman. */
  fixedTime: string | null;
  offsetMinutes: number;
  roundTo: number;
  /** How this minyan rounds to its roundTo step — the shul's choice per minyan. "none" = exact zman time, no rounding. */
  roundDirection: "nearest" | "up" | "down" | "none";
  earliest: string | null;
  latest: string | null;
  groupIds: string[];
  room: string | null;
  sortOrder: number;
}

export interface BoardMemorial {
  id: string;
  hebrewName: string;
  englishName: string | null;
  relationship: string | null;
  hebrewMonth: number;
  hebrewDay: number;
  isYahrzeit: boolean;
}

export interface BoardAnnouncement {
  id: string;
  title?: string | null;
  text: string;
  hebrewText: string | null;
  /** Maps DB priority; higher = more important (mobile badge). */
  sortOrder: number;
  priority?: number;
}

export interface BoardSponsor {
  id: string;
  text: string;
  hebrewText: string | null;
  sortOrder: number;
}

export interface BoardMedia {
  id: string;
  url: string;
  kind: string;
  sortOrder: number;
}

export interface BoardScheduleGroup {
  id: string;
  name: string;
  hebrewName: string | null;
  color: string | null;
  sortOrder: number;
}

/** A D16 daily note (the org's own or the global baseline), matched to a Hebrew date. */
export interface BoardNote {
  id: string;
  hebrewMonth: number;
  hebrewDay: number;
  noteHebrew: string;
  noteEnglish: string | null;
  category: string;
}

export interface BoardScreen {
  id: string;
  name: string;
  assignedStyleId: string | null;
  /** Pre-parsed breakpoint-aware style schedules (D2). Null/empty falls back to assignedStyleId. */
  styleSchedules: import("../style-engine").ScreenStyleSchedule[] | null;
  resolution: string | null;
}

/** Everything loaded for one screen, handed to the pure snapshot builder. */
export interface BoardData {
  org: BoardOrg;
  screen: BoardScreen;
  styles: DisplayStyle[];
  minyanim: BoardMinyan[];
  memorials: BoardMemorial[];
  announcements: BoardAnnouncement[];
  sponsors: BoardSponsor[];
  media: BoardMedia[];
  scheduleGroups: BoardScheduleGroup[];
  /** The org's effective daily notes (own + baseline, overrides applied, hidden removed). */
  notes: BoardNote[];
  /** Per-zman display-name overrides ({ [ZmanType]: { english?, hebrew? } }). */
  displayNameOverrides?: Record<string, { english?: string; hebrew?: string }>;
}

export interface SnapshotZman {
  type: ZmanType;
  label: string;
  hebrewLabel: string;
  /** ISO string, or null when the zman does not occur (e.g. polar day). */
  time: string | null;
  authority: HalachicAuthority;
}

export interface SnapshotMinyan {
  id: string;
  name: string;
  hebrewName: string;
  type: string;
  /** Resolved ISO time, or null when it could not be computed. */
  time: string | null;
  groupIds: string[];
  room: string | null;
  sortOrder: number;
}

export interface SnapshotMemorial extends BoardMemorial {
  /** Days from the board's date until this memorial's next Hebrew anniversary (0 = today), or null if not within the look-ahead window. */
  daysUntil: number | null;
}

export interface CalendarBundle {
  date: JewishDateInfo;
  parsha: ParshaInfo;
  dafYomi: DafYomiInfo;
  holiday: HolidayInfo;
  omer: OmerInfo | null;
  tefilah: TefilahRulesInfo;
  /** D16 daily notes that fall on this bundle's Hebrew date (filled by the snapshot builder). */
  notes?: BoardNote[];
}

export interface SharedBoardData {
  now: string;
  timezone: string;
  /** zmanim per day-offset (0 = effective date, 1 = next day, ...). Keys are stringified ints for JSON. */
  zmanimByOffset: Record<string, SnapshotZman[]>;
  calendarByOffset: Record<string, CalendarBundle>;
  minyanim: SnapshotMinyan[];
  memorials: SnapshotMemorial[];
  announcements: BoardAnnouncement[];
  sponsors: BoardSponsor[];
  media: BoardMedia[];
  scheduleGroups: BoardScheduleGroup[];
  displayNameOverrides: Record<string, { english?: string; hebrew?: string }>;
}

export interface SnapshotObject {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
  zIndex: number;
  font: { family: string; size: number; bold: boolean; italic: boolean; color: string };
  /** Legacy solid-color background; `appearance.backgroundMode` is the full story. */
  backgroundColor: string;
  language: "hebrew" | "english" | "yiddish" | "both";
  appearance: DisplayObjectAppearance;
  content: Record<string, unknown>;
}

export interface SnapshotStyle {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundMode?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundTexture?: string;
  backgroundFrameId?: string | null;
  backgroundFrameThickness?: number | null;
}

export interface DisplaySnapshot {
  generatedAt: string;
  effectiveDate: string;
  mode: BoardMode;
  breakpoint: "mobile" | "tablet" | "full";
  org: { id: string; name: string; slug: string };
  screen: { id: string; name: string };
  style: SnapshotStyle | null;
  objects: SnapshotObject[];
  data: SharedBoardData;
}
