import { formatCsv, parseCsv } from "./csv";

/** Entity column maps for CSV/JSON import+export (P10 / E19). One family — F-DUP-CSV. */

export type EntityKey = "groups" | "minyanim" | "announcements" | "memorials" | "sponsors" | "media";

export interface EntityDef {
  key: EntityKey;
  label: string;
  columns: string[];
  toRecord: (row: Record<string, unknown>) => Record<string, string>;
  fromRecord: (record: Record<string, string>, orgId: string) => Record<string, unknown>;
}

const str = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => (v == null ? "" : String(v));
const bool = (v: unknown) => (v ? "true" : "false");
const json = (v: unknown) => (v == null ? "" : JSON.stringify(v));

function parseStr(record: Record<string, string>, key: string): string | null {
  const v = record[key]?.trim();
  return v ? v : null;
}
function reqStr(record: Record<string, string>, key: string): string {
  const v = parseStr(record, key);
  if (!v) throw new Error(`Missing required "${key}".`);
  return v;
}
function parseNum(record: Record<string, string>, key: string, fallback: number): number {
  const v = record[key]?.trim();
  if (!v) return fallback;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`"${key}" must be a number (got "${v}").`);
  return n;
}
function parseBool(record: Record<string, string>, key: string, fallback: boolean): boolean {
  const v = record[key]?.trim().toLowerCase();
  if (!v) return fallback;
  return v === "true" || v === "1" || v === "yes";
}
function parseJson<T>(record: Record<string, string>, key: string): T | undefined {
  const v = record[key]?.trim();
  if (!v) return undefined;
  try {
    return JSON.parse(v) as T;
  } catch {
    throw new Error(`"${key}" is not valid JSON.`);
  }
}

const groups: EntityDef = {
  key: "groups",
  label: "Schedule groups",
  columns: ["name", "hebrewName", "color", "active", "sortOrder"],
  toRecord: (r) => ({
    name: str(r.name),
    hebrewName: str(r.hebrewName),
    color: str(r.color),
    active: bool(r.active),
    sortOrder: num(r.sortOrder),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    name: reqStr(record, "name"),
    hebrewName: parseStr(record, "hebrewName") ?? reqStr(record, "name"),
    color: parseStr(record, "color") ?? "#888888",
    active: parseBool(record, "active", true),
    sortOrder: parseNum(record, "sortOrder", 0),
    isBuiltIn: false,
  }),
};

const minyanim: EntityDef = {
  key: "minyanim",
  label: "Minyan times",
  columns: [
    "name",
    "hebrewName",
    "type",
    "baseZman",
    "fixedTime",
    "offset",
    "earliest",
    "latest",
    "roundTo",
    "roundDirection",
    "room",
    "dayOfWeekMask",
    "scheduleGroupIds",
    "isActive",
    "sortOrder",
  ],
  toRecord: (r) => ({
    name: str(r.name),
    hebrewName: str(r.hebrewName),
    type: str(r.type),
    baseZman: str(r.baseZman),
    fixedTime: str(r.fixedTime),
    offset: num(r.offset),
    earliest: str(r.earliest),
    latest: str(r.latest),
    roundTo: num(r.roundTo),
    roundDirection: str(r.roundDirection),
    room: str(r.room),
    dayOfWeekMask: str(r.dayOfWeekMask),
    scheduleGroupIds: json(r.scheduleGroupIds),
    isActive: bool(r.isActive),
    sortOrder: num(r.sortOrder),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    name: reqStr(record, "name"),
    hebrewName: parseStr(record, "hebrewName") ?? reqStr(record, "name"),
    type: parseStr(record, "type") ?? "other",
    baseZman: parseStr(record, "baseZman"),
    fixedTime: parseStr(record, "fixedTime"),
    offset: parseNum(record, "offset", 0),
    earliest: parseStr(record, "earliest"),
    latest: parseStr(record, "latest"),
    roundTo: parseNum(record, "roundTo", 5),
    roundDirection: parseStr(record, "roundDirection") ?? "nearest",
    room: parseStr(record, "room"),
    dayOfWeekMask: parseStr(record, "dayOfWeekMask") ?? "1111111",
    scheduleGroupIds: parseJson<string[]>(record, "scheduleGroupIds"),
    isActive: parseBool(record, "isActive", true),
    sortOrder: parseNum(record, "sortOrder", 0),
  }),
};

const announcements: EntityDef = {
  key: "announcements",
  label: "Announcements",
  columns: ["title", "titleHebrew", "content", "contentHebrew", "priority", "isActive", "startDate", "endDate"],
  toRecord: (r) => ({
    title: str(r.title),
    titleHebrew: str(r.titleHebrew),
    content: str(r.content),
    contentHebrew: str(r.contentHebrew),
    priority: num(r.priority),
    isActive: bool(r.isActive),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    title: reqStr(record, "title"),
    titleHebrew: parseStr(record, "titleHebrew"),
    content: parseStr(record, "content") ?? "",
    contentHebrew: parseStr(record, "contentHebrew"),
    priority: parseNum(record, "priority", 0),
    isActive: parseBool(record, "isActive", true),
    startDate: parseStr(record, "startDate"),
    endDate: parseStr(record, "endDate"),
  }),
};

const memorials: EntityDef = {
  key: "memorials",
  label: "Memorials / yahrzeits",
  columns: [
    "hebrewName",
    "englishName",
    "hebrewFamilyName",
    "hebrewBenBat",
    "relationship",
    "donorInfo",
    "hebrewYear",
    "hebrewMonth",
    "hebrewDay",
    "hebrewAdar",
    "isYahrzeit",
    "notes",
    "isActive",
  ],
  toRecord: (r) => ({
    hebrewName: str(r.hebrewName),
    englishName: str(r.englishName),
    hebrewFamilyName: str(r.hebrewFamilyName),
    hebrewBenBat: str(r.hebrewBenBat),
    relationship: str(r.relationship),
    donorInfo: str(r.donorInfo),
    hebrewYear: num(r.hebrewYear),
    hebrewMonth: num(r.hebrewMonth),
    hebrewDay: num(r.hebrewDay),
    hebrewAdar: num(r.hebrewAdar),
    isYahrzeit: bool(r.isYahrzeit),
    notes: str(r.notes),
    isActive: bool(r.isActive),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    hebrewName: reqStr(record, "hebrewName"),
    englishName: parseStr(record, "englishName"),
    hebrewFamilyName: parseStr(record, "hebrewFamilyName"),
    hebrewBenBat: parseStr(record, "hebrewBenBat"),
    relationship: parseStr(record, "relationship"),
    donorInfo: parseStr(record, "donorInfo"),
    hebrewYear: record.hebrewYear?.trim() ? parseNum(record, "hebrewYear", 0) : null,
    hebrewMonth: parseNum(record, "hebrewMonth", 1),
    hebrewDay: parseNum(record, "hebrewDay", 1),
    hebrewAdar: parseNum(record, "hebrewAdar", 0),
    isYahrzeit: parseBool(record, "isYahrzeit", true),
    notes: parseStr(record, "notes"),
    isActive: parseBool(record, "isActive", true),
  }),
};

const sponsors: EntityDef = {
  key: "sponsors",
  label: "Sponsors",
  columns: ["type", "sponsorName", "hebrewText", "englishText", "hebrewDate", "isRecurring", "isActive"],
  toRecord: (r) => ({
    type: str(r.type),
    sponsorName: str(r.sponsorName),
    hebrewText: str(r.hebrewText),
    englishText: str(r.englishText),
    hebrewDate: str(r.hebrewDate),
    isRecurring: bool(r.isRecurring),
    isActive: bool(r.isActive),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    type: parseStr(record, "type") ?? "general",
    sponsorName: reqStr(record, "sponsorName"),
    hebrewText: parseStr(record, "hebrewText"),
    englishText: parseStr(record, "englishText"),
    hebrewDate: parseStr(record, "hebrewDate"),
    isRecurring: parseBool(record, "isRecurring", false),
    isActive: parseBool(record, "isActive", true),
  }),
};

const media: EntityDef = {
  key: "media",
  label: "Media",
  columns: ["filename", "originalName", "mimeType", "fileSize", "filePath", "sortOrder", "isActive"],
  toRecord: (r) => ({
    filename: str(r.filename),
    originalName: str(r.originalName),
    mimeType: str(r.mimeType),
    fileSize: num(r.fileSize),
    filePath: str(r.filePath),
    sortOrder: num(r.sortOrder),
    isActive: bool(r.isActive),
  }),
  fromRecord: (record, orgId) => ({
    orgId,
    filename: reqStr(record, "filename"),
    originalName: parseStr(record, "originalName") ?? reqStr(record, "filename"),
    mimeType: parseStr(record, "mimeType") ?? "image/svg+xml",
    fileSize: parseNum(record, "fileSize", 0),
    filePath: reqStr(record, "filePath"),
    sortOrder: parseNum(record, "sortOrder", 0),
    isActive: parseBool(record, "isActive", true),
  }),
};

export const entityDefs: Record<EntityKey, EntityDef> = {
  groups,
  minyanim,
  announcements,
  memorials,
  sponsors,
  media,
};

export function getEntityDef(key: string): EntityDef | undefined {
  return entityDefs[key as EntityKey];
}

/** Sample CSV downloads for P10.5 / P10.6. */
export function sampleCsv(key: EntityKey): string {
  const def = entityDefs[key];
  const sample: Record<string, string> = {};
  for (const c of def.columns) sample[c] = "";
  if (key === "groups") {
    sample.name = "Weekday";
    sample.hebrewName = "חול";
    sample.color = "#4CAF50";
    sample.active = "true";
    sample.sortOrder = "0";
  } else if (key === "minyanim") {
    sample.name = "Shacharit";
    sample.hebrewName = "שחרית";
    sample.type = "shacharit";
    sample.fixedTime = "07:00";
    sample.offset = "0";
    sample.roundTo = "5";
    sample.roundDirection = "nearest";
    sample.dayOfWeekMask = "0111110";
    sample.isActive = "true";
    sample.sortOrder = "0";
  } else if (key === "announcements") {
    sample.title = "Kiddush";
    sample.content = "Sponsored this week.";
    sample.priority = "5";
    sample.isActive = "true";
  } else if (key === "memorials") {
    sample.hebrewName = "משה";
    sample.englishName = "Moshe";
    sample.hebrewMonth = "1";
    sample.hebrewDay = "15";
    sample.isYahrzeit = "true";
    sample.isActive = "true";
  } else if (key === "sponsors") {
    sample.type = "kiddush";
    sample.sponsorName = "Cohen family";
    sample.isActive = "true";
  } else if (key === "media") {
    sample.filename = "flyer.svg";
    sample.originalName = "flyer.svg";
    sample.mimeType = "image/svg+xml";
    sample.fileSize = "100";
    sample.filePath = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
    sample.sortOrder = "0";
    sample.isActive = "true";
  }
  return formatCsv(def.columns, [sample]);
}

export function sampleJson(key: EntityKey): string {
  return JSON.stringify(parseCsv(sampleCsv(key)), null, 2);
}
