// === What's in this file ===
// The whole database in one place: all 17 tables (D1-D17), the single source of
// truth for the data shape. Same dialect everywhere (libSQL / SQLite) so the
// hosted SaaS, the desktop's local file, and the Docker box all run identical
// tables. JSON columns are typed from json.ts so the column and the code can't
// drift (fix F-DB-DRIFT). Column names are written camelCase here and stored
// snake_case in the DB (the `casing` option on the drizzle client + drizzle-kit).
//
// Identity & org:
//   users (D3)            -- a person; linked to Clerk; isSuperAdmin gate.
//   orgs (D1)             -- a synagogue: location, halachic defaults, plan, settings.
//   orgMemberships (D4)   -- who belongs to which org and their role.
//   orgInvites (D5)       -- pending email invites with a one-time token.
//   editLocks (D6)        -- one short-lived "I'm editing this org" lock per org.
// Display:
//   styles (D7)           -- a board design (background, canvas, activation rules).
//   screens (D2)          -- a physical display; optionally pinned to a style or rule-scheduled.
//   displayObjects (D8)   -- a widget placed on a style (position, font, per-type content).
// Schedule & zmanim:
//   scheduleGroups (D9)   -- davening groups used to show/hide rows together.
//   zmanimConfigs (D10)   -- per-org overrides for how a given zman is calculated.
//   minyanSchedules (D11) -- a prayer time: anchored to a zman or fixed, with advanced details.
// Content:
//   announcements (D12), memorials (D13, incl. relationship F5), sponsors (D14), media (D15).
//   tukachinskyNotes (D16)-- daily notes; orgId null = global baseline, set = that shul's note/override.
// Sync:
//   syncLogs (D17)        -- durable change feed for desktop/cloud hybrid sync.

import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import type {
  DisplayObjectContent,
  MinyanDetails,
  OrgSettings,
  RecurrenceRule,
  ScheduleGroupIds,
  ScheduleGroupVisibility,
  ScheduleRule,
  ScreenStyleSchedule,
  StyleActivationRule,
  SyncPayload,
} from "./json";

const id = () =>
  text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

// ── Identity & org ───────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: id(),
  clerkUserId: text().notNull().unique(),
  email: text().notNull().unique(),
  name: text(),
  /** scrypt hash for AUTH_MODE=session; null when the user only exists via Clerk. */
  passwordHash: text(),
  isSuperAdmin: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const orgs = sqliteTable("orgs", {
  id: id(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  status: text().notNull().default("active"), // pending | active | suspended
  plan: text().notNull().default("free"), // free | basic | pro | enterprise

  latitude: real().notNull().default(0),
  longitude: real().notNull().default(0),
  elevation: real().notNull().default(0),
  timezone: text().notNull().default("Asia/Jerusalem"),
  inIsrael: integer({ mode: "boolean" }).notNull().default(true),

  dialect: text().notNull().default("Ashkenazi"), // Ashkenazi | Sephardi | Edot HaMizrach
  candleLightingMinutes: integer().notNull().default(18),
  shabbatEndType: text().notNull().default("degrees"), // degrees | minutes
  shabbatEndValue: real().notNull().default(8.5),
  rabbeinuTamMinutes: integer().notNull().default(72),

  amPmFormat: integer({ mode: "boolean" }).notNull().default(false),
  settings: text({ mode: "json" }).$type<OrgSettings>().notNull().default(sql`'{}'`),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const orgMemberships = sqliteTable(
  "org_memberships",
  {
    id: id(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    role: text().notNull().default("viewer"), // owner | admin | editor | viewer
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("org_memberships_user_org_uq").on(t.userId, t.orgId), index("org_memberships_org_idx").on(t.orgId)],
);

export const orgInvites = sqliteTable(
  "org_invites",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    email: text().notNull(),
    role: text().notNull().default("editor"),
    token: text()
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
    usedAt: integer({ mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("org_invites_org_idx").on(t.orgId), index("org_invites_email_idx").on(t.email)],
);

export const editLocks = sqliteTable("edit_locks", {
  id: id(),
  orgId: text()
    .notNull()
    .unique()
    .references(() => orgs.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lockedAt: createdAt(),
  expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
});

// ── Display ──────────────────────────────────────────────────────────────────

export const styles = sqliteTable(
  "styles",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    backgroundColor: text().notNull().default("#0f172a"),
    backgroundMode: text().notNull().default("solid"), // solid | gradient | image | texture
    backgroundImage: text(),
    backgroundGradient: text(),
    backgroundTexture: text(),
    backgroundFrameId: text(),
    backgroundFrameThickness: real().default(1),
    canvasWidth: integer().notNull().default(1920),
    canvasHeight: integer().notNull().default(1080),
    isDefault: integer({ mode: "boolean" }).notNull().default(false),
    activationRules: text({ mode: "json" }).$type<StyleActivationRule[]>().notNull().default(sql`'[]'`),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("styles_org_idx").on(t.orgId)],
);

export const screens = sqliteTable(
  "screens",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    assignedStyleId: text().references(() => styles.id, { onDelete: "set null" }),
    styleSchedules: text({ mode: "json" }).$type<ScreenStyleSchedule[]>(),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    resolution: text().notNull().default("1920x1080"),
    /** Wall-screen heartbeat (SH.7) — last successful ping from /show. */
    lastSeenAt: integer({ mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("screens_org_idx").on(t.orgId)],
);

export const displayObjects = sqliteTable(
  "display_objects",
  {
    id: id(),
    styleId: text()
      .notNull()
      .references(() => styles.id, { onDelete: "cascade" }),
    name: text().notNull(),
    type: text().notNull(), // widget type key from the W1-W17 registry
    posX: integer().notNull(),
    posY: integer().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    layer: integer().notNull().default(0),
    fontFamily: text().notNull().default("David Libre"),
    fontSize: integer().notNull().default(16),
    fontBold: integer({ mode: "boolean" }).notNull().default(false),
    fontItalic: integer({ mode: "boolean" }).notNull().default(false),
    foreColor: text().notNull().default("#000000"),
    backColor: text().notNull().default("transparent"), // solid-color alias; backgroundMode decides how it's used
    language: text().notNull().default("hebrew"), // hebrew | english | both
    // Per-object appearance (the old editor could set all of this; the rebuild's
    // data model couldn't store any of it until now). Table layout lives inside
    // `content` because it only applies to the table widgets.
    textAlign: text().notNull().default("center"), // left | center | right
    verticalAlign: text().notNull().default("middle"), // top | middle | bottom
    lineHeight: real(), // null = widget decides
    backgroundMode: text().notNull().default("transparent"), // solid | transparent | gradient | texture | image | canvas
    backgroundImage: text(),
    backgroundGradient: text(),
    backgroundTexture: text(),
    frameId: text(),
    frameThickness: real().notNull().default(0),
    scrollingEnabled: integer({ mode: "boolean" }).notNull().default(false),
    scrollingDirection: text().notNull().default("up"), // up | down | left | right
    scrollingSpeed: integer().notNull().default(60), // px/sec
    content: text({ mode: "json" }).$type<DisplayObjectContent>(),
    scheduleRules: text({ mode: "json" }).$type<ScheduleRule[]>(),
    scheduleGroupVisibility: text({ mode: "json" }).$type<ScheduleGroupVisibility>(),
    visible: integer({ mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("display_objects_style_idx").on(t.styleId)],
);

// ── Schedule & zmanim ──────────────────────────────────────────────────────────

export const scheduleGroups = sqliteTable(
  "schedule_groups",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    hebrewName: text().notNull(),
    color: text().notNull(),
    active: integer({ mode: "boolean" }).notNull().default(true),
    autoActivationRules: text({ mode: "json" }).$type<ScheduleRule[]>(),
    sortOrder: integer().notNull().default(0),
    isBuiltIn: integer({ mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("schedule_groups_org_idx").on(t.orgId)],
);

export const zmanimConfigs = sqliteTable(
  "zmanim_configs",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    zmanType: text().notNull(), // from the C2 ZmanType enum
    authority: text().notNull(), // from the C2 HalachicAuthority enum
    degreesBelow: real(),
    fixedMinutes: integer(),
    earliest: text(), // HH:MM cap
    latest: text(), // HH:MM cap
    roundTo: integer(),
    offset: integer(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("zmanim_configs_org_zman_uq").on(t.orgId, t.zmanType)],
);

export const minyanSchedules = sqliteTable(
  "minyan_schedules",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    hebrewName: text().notNull(),
    type: text().notNull(), // shacharit | mincha | maariv | other
    baseZman: text(), // ZmanType to anchor from
    fixedTime: text(), // HH:MM for fixed-time minyanim
    offset: integer().notNull().default(0),
    earliest: text(),
    latest: text(),
    roundTo: integer().notNull().default(5),
    roundDirection: text().notNull().default("nearest"), // nearest | up | down | none (per-minyan; "none" = exact zman time)
    room: text(),
    dayOfWeekMask: text().notNull().default("1111111"), // 7 chars, 0=Sun
    scheduleGroupIds: text({ mode: "json" }).$type<ScheduleGroupIds>(),
    details: text({ mode: "json" }).$type<MinyanDetails>(),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("minyan_schedules_org_idx").on(t.orgId)],
);

// ── Content ────────────────────────────────────────────────────────────────────

export const announcements = sqliteTable(
  "announcements",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    title: text().notNull(),
    titleHebrew: text(),
    content: text().notNull(),
    contentHebrew: text(),
    scheduleRules: text({ mode: "json" }).$type<ScheduleRule[]>(),
    priority: integer().notNull().default(0),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    startDate: text(),
    endDate: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("announcements_org_idx").on(t.orgId)],
);

export const memorials = sqliteTable(
  "memorials",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    hebrewName: text().notNull(),
    englishName: text(),
    hebrewFamilyName: text(),
    hebrewBenBat: text(), // ben / bat designation
    relationship: text(), // F5: donor/deceased relationship
    donorInfo: text(), // who donated
    hebrewYear: integer(),
    hebrewMonth: integer().notNull(),
    hebrewDay: integer().notNull(),
    hebrewAdar: integer().notNull().default(0), // 0=auto, 1=Adar I, 2=Adar II
    civilDate: integer({ mode: "timestamp_ms" }),
    isYahrzeit: integer({ mode: "boolean" }).notNull().default(true),
    notes: text(),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("memorials_org_idx").on(t.orgId)],
);

export const sponsors = sqliteTable(
  "sponsors",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    type: text().notNull(), // kiddush | seuda | torah | general
    sponsorName: text().notNull(),
    hebrewText: text(),
    englishText: text(),
    hebrewDate: text(), // "M-D" Hebrew date
    civilDate: integer({ mode: "timestamp_ms" }),
    isRecurring: integer({ mode: "boolean" }).notNull().default(false),
    recurrenceRule: text({ mode: "json" }).$type<RecurrenceRule>(),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sponsors_org_idx").on(t.orgId)],
);

export const media = sqliteTable(
  "media",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    filename: text().notNull(),
    originalName: text().notNull(),
    mimeType: text().notNull(),
    fileSize: integer().notNull(),
    filePath: text().notNull(), // Vercel Blob URL (cloud) or local path (desktop)
    scheduleRules: text({ mode: "json" }).$type<ScheduleRule[]>(),
    sortOrder: integer().notNull().default(0),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("media_org_idx").on(t.orgId)],
);

export const tukachinskyNotes = sqliteTable(
  "tukachinsky_notes",
  {
    id: id(),
    // null = global baseline (super-admin managed); set = a specific shul's note/override.
    orgId: text().references(() => orgs.id, { onDelete: "cascade" }),
    hebrewMonth: integer().notNull(), // kosher-zmanim month number (1=Nissan)
    hebrewDay: integer().notNull(),
    noteHebrew: text().notNull(),
    noteEnglish: text(),
    category: text().notNull(), // tefillah | calendar | minhag | other
    isBaseline: integer({ mode: "boolean" }).notNull().default(false),
    isHidden: integer({ mode: "boolean" }).notNull().default(false),
    baselineId: text(), // if an org override, the baseline note it overrides
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("tukachinsky_notes_org_idx").on(t.orgId), index("tukachinsky_notes_date_idx").on(t.hebrewMonth, t.hebrewDay)],
);

// ── Sync ─────────────────────────────────────────────────────────────────────

export const syncLogs = sqliteTable(
  "sync_logs",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    tableName: text().notNull(),
    recordId: text().notNull(),
    operation: text().notNull(), // create | update | delete
    data: text({ mode: "json" }).$type<SyncPayload>().notNull(),
    timestamp: createdAt(),
    synced: integer({ mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("sync_logs_org_idx").on(t.orgId), index("sync_logs_synced_idx").on(t.synced)],
);

// A paired desktop/display device that may pull/push without an interactive login.
// We store only a HASH of the token (the plaintext is shown once at creation), so a
// leaked database can't be used to impersonate a device. lastSeenAt powers an
// "online?" indicator; revokedAt unpairs without deleting the audit row.
export const syncDevices = sqliteTable(
  "sync_devices",
  {
    id: id(),
    orgId: text()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text().notNull(),
    tokenHash: text().notNull().unique(),
    lastSeenAt: integer({ mode: "timestamp_ms" }),
    revokedAt: integer({ mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("sync_devices_org_idx").on(t.orgId)],
);
