// === What's in this file ===
// Puts a realistic demo synagogue into the database so every later phase has
// something true to render and review against (an empty 200 is not "working").
// Run it with `pnpm db:seed`. It's safe to run again: it wipes the "demo" org
// first (which cascades to its screens/styles/objects) and re-creates it.
//
// Seeds: one org ("demo") -> one default style -> a handful of display objects
// (clock, zmanim table, minyan list, Hebrew date) -> one screen pinned to that
// style -> a weekday schedule group -> three minyan times -> one memorial.

import { eq } from "drizzle-orm";
import { hashPassword } from "../auth/passwords";
import { seedBaselineNotes } from "../admin/content/notes-service";
import { createDb, resolveDbConfig } from "./client";
import {
  announcements,
  displayObjects,
  media,
  memorials,
  minyanSchedules,
  orgInvites,
  orgMemberships,
  orgs,
  scheduleGroups,
  screens,
  sponsors,
  styles,
  users,
} from "./schema";

const db = createDb(resolveDbConfig());

await db.delete(orgs).where(eq(orgs.slug, "demo"));
await db.delete(orgs).where(eq(orgs.slug, "demo-b"));
await db.delete(users).where(eq(users.email, "owner@demo.local"));
await db.delete(users).where(eq(users.email, "invitee@demo.local"));

const [owner] = await db
  .insert(users)
  .values({
    clerkUserId: `session:seed-owner`,
    email: "owner@demo.local",
    name: "Demo Owner",
    passwordHash: hashPassword("demo-pass"),
    isSuperAdmin: true,
  })
  .returning();

const [invitee] = await db
  .insert(users)
  .values({
    clerkUserId: `session:seed-invitee`,
    email: "invitee@demo.local",
    name: "Demo Invitee",
    passwordHash: hashPassword("demo-pass"),
    isSuperAdmin: false,
  })
  .returning();

if (!owner || !invitee) throw new Error("seed failed: users");

const [org] = await db
  .insert(orgs)
  .values({
    name: "Demo Synagogue",
    slug: "demo",
    status: "active",
    plan: "pro",
    latitude: 31.7683,
    longitude: 35.2137,
    elevation: 754,
    timezone: "Asia/Jerusalem",
    inIsrael: true,
    dialect: "Ashkenazi",
  })
  .returning();

if (!org) throw new Error("seed failed: org was not created");

await db.insert(orgMemberships).values({ userId: owner.id, orgId: org.id, role: "owner" });

// Second org so F2 client org-switch can be exercised with one seed.
const [orgB] = await db
  .insert(orgs)
  .values({
    name: "Demo Annex",
    slug: "demo-b",
    status: "active",
    plan: "basic",
    latitude: 31.7683,
    longitude: 35.2137,
    elevation: 754,
    timezone: "Asia/Jerusalem",
    inIsrael: true,
    dialect: "Ashkenazi",
  })
  .returning();
if (orgB) {
  await db.insert(orgMemberships).values({ userId: owner.id, orgId: orgB.id, role: "owner" });
  const [styleB] = await db
    .insert(styles)
    .values({ orgId: orgB.id, name: "Annex Board", isDefault: true, backgroundColor: "#1e293b" })
    .returning();
  if (styleB) {
    await db.insert(screens).values({
      orgId: orgB.id,
      name: "Annex Screen",
      assignedStyleId: styleB.id,
      styleSchedules: [
        { id: `mig-${styleB.id}-def`, styleId: styleB.id, priority: 0, breakpoint: "all", rules: [{ type: "default" }] },
      ],
      resolution: "1920x1080",
    });
  }
}

await db.insert(orgInvites).values({
  orgId: org.id,
  email: "invitee@demo.local",
  role: "editor",
  token: "demo-invite-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

const [style] = await db
  .insert(styles)
  .values({ orgId: org.id, name: "Main Board", isDefault: true, backgroundColor: "#0f172a" })
  .returning();

if (!style) throw new Error("seed failed: style was not created");

await db.insert(displayObjects).values([
  { styleId: style.id, name: "Clock", type: "DIGITAL_CLOCK", posX: 40, posY: 40, width: 480, height: 200, layer: 1, fontSize: 96, foreColor: "#f8fafc" },
  { styleId: style.id, name: "Zmanim", type: "ZMANIM_TABLE", posX: 40, posY: 280, width: 760, height: 740, layer: 1, language: "both", fontSize: 34, foreColor: "#f8fafc" },
  { styleId: style.id, name: "Minyanim", type: "EVENTS_TABLE", posX: 840, posY: 280, width: 1040, height: 740, layer: 1, language: "both", fontSize: 40, foreColor: "#f8fafc" },
  { styleId: style.id, name: "Hebrew Date", type: "JEWISH_INFO", posX: 560, posY: 40, width: 1320, height: 200, layer: 1, language: "hebrew", fontSize: 44, foreColor: "#fbbf24" },
]);

await db
  .insert(screens)
  .values({
    orgId: org.id,
    name: "Main Sanctuary",
    assignedStyleId: style.id,
    styleSchedules: [{ id: `mig-${style.id}-def`, styleId: style.id, priority: 0, breakpoint: "all", rules: [{ type: "default" }] }],
    resolution: "1920x1080",
  });

const [weekdayGroup] = await db
  .insert(scheduleGroups)
  .values({ orgId: org.id, name: "Weekday", hebrewName: "חול", color: "#2563eb", sortOrder: 0, isBuiltIn: true })
  .returning();

await db.insert(scheduleGroups).values({
  orgId: org.id,
  name: "Shabbat",
  hebrewName: "שבת",
  color: "#2196F3",
  sortOrder: 1,
  isBuiltIn: true,
});

const weekdayIds = weekdayGroup ? [weekdayGroup.id] : [];

await db.insert(minyanSchedules).values([
  {
    orgId: org.id,
    name: "Shacharit",
    hebrewName: "שחרית",
    type: "shacharit",
    baseZman: "HANETZ",
    offset: 0,
    roundTo: 5,
    sortOrder: 0,
    scheduleGroupIds: weekdayIds,
  },
  {
    orgId: org.id,
    name: "Mincha",
    hebrewName: "מנחה",
    type: "mincha",
    fixedTime: "13:30",
    roundTo: 5,
    sortOrder: 1,
    scheduleGroupIds: weekdayIds,
  },
  {
    orgId: org.id,
    name: "Maariv",
    hebrewName: "מעריב",
    type: "maariv",
    baseZman: "TZAIS",
    offset: 0,
    roundTo: 5,
    sortOrder: 2,
    scheduleGroupIds: weekdayIds,
  },
]);

await db.insert(memorials).values([
  { orgId: org.id, hebrewName: "משה בן עמרם", englishName: "Moshe", relationship: "father", hebrewMonth: 1, hebrewDay: 7, isYahrzeit: true },
  { orgId: org.id, hebrewName: "שרה בת אברהם", englishName: "Sarah", relationship: "mother", hebrewMonth: 8, hebrewDay: 1, isYahrzeit: true },
  { orgId: org.id, hebrewName: "דוד בן ישי", englishName: "David", relationship: "grandfather", hebrewMonth: 3, hebrewDay: 6, isYahrzeit: true },
]);

await db.insert(announcements).values([
  { orgId: org.id, title: "Shabbos Kiddush", titleHebrew: "קידוש", content: "Kiddush this Shabbos is sponsored by the Cohen family.", contentHebrew: "הקידוש השבת בחסות משפחת כהן.", priority: 10 },
  { orgId: org.id, title: "Shiur", titleHebrew: "שיעור", content: "Daf Yomi shiur nightly at 8:00 PM.", contentHebrew: "שיעור דף היומי כל ערב בשעה 8:00.", priority: 5 },
]);

await db.insert(sponsors).values([
  { orgId: org.id, type: "kiddush", sponsorName: "Cohen", englishText: "Kiddush sponsored by the Cohen family", hebrewText: "הקידוש בחסות משפחת כהן" },
  { orgId: org.id, type: "torah", sponsorName: "Levi", englishText: "Today's learning is sponsored by the Levi family", hebrewText: "הלימוד היום בחסות משפחת לוי" },
]);

const flyer =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#1e3a8a'/><text x='50%' y='50%' fill='white' font-size='40' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'>Shul Flyer</text></svg>",
  );

await db.insert(media).values({
  orgId: org.id,
  filename: "flyer.svg",
  originalName: "flyer.svg",
  mimeType: "image/svg+xml",
  fileSize: 600,
  filePath: flyer,
  sortOrder: 0,
});

// A second screen + style that places every widget type, so /show exercises the
// whole registry (the Main Board stays the clean default first screen).
const [showcaseStyle] = await db
  .insert(styles)
  .values({ orgId: org.id, name: "Widget Showcase", backgroundColor: "#0b1020", sortOrder: 1 })
  .returning();

if (!showcaseStyle) throw new Error("seed failed: showcase style was not created");

const sid = showcaseStyle.id;
const base = { layer: 1, fontSize: 28, foreColor: "#e2e8f0" } as const;
await db.insert(displayObjects).values([
  { ...base, styleId: sid, name: "Title", type: "PLAIN_TEXT", posX: 40, posY: 30, width: 900, height: 90, fontSize: 56, foreColor: "#fbbf24", content: { text: "Widget Showcase", textHebrew: "תצוגת רכיבים", textAlign: "left" } },
  { ...base, styleId: sid, name: "Date Picker", type: "DATE_PICKER", posX: 980, posY: 40, width: 900, height: 70, language: "both", content: {} },
  { ...base, styleId: sid, name: "Analog", type: "ANALOG_CLOCK", posX: 40, posY: 150, width: 220, height: 220, content: {} },
  { ...base, styleId: sid, name: "Countdown", type: "COUNTDOWN_TIMER", posX: 290, posY: 150, width: 300, height: 220, fontSize: 40, content: { targetType: "zman", zmanType: "SHKIAH", label: "Until Shkiah", labelHebrew: "עד השקיעה" }, language: "both" },
  { ...base, styleId: sid, name: "Sefira", type: "SEFIRA_COUNTER", posX: 620, posY: 150, width: 320, height: 220, language: "both", content: { showEnglish: true } },
  { ...base, styleId: sid, name: "Rich", type: "RICH_TEXT", posX: 980, posY: 150, width: 440, height: 220, content: { html: "<b>Rich text</b><br/><i>HTML supported</i>" } },
  { ...base, styleId: sid, name: "Tefilah", type: "TEFILAH_NOTES", posX: 1450, posY: 150, width: 430, height: 220, language: "hebrew", content: { title: "תפילה", layout: "vertical" } },
  { ...base, styleId: sid, name: "Yahrzeits", type: "YAHRZEIT_DISPLAY", posX: 40, posY: 400, width: 560, height: 320, language: "both", content: { upcomingDays: 366, showRelationship: true } },
  { ...base, styleId: sid, name: "Sponsor", type: "SPONSOR_DISPLAY", posX: 630, posY: 400, width: 560, height: 200, language: "both", fontSize: 34, content: {} },
  { ...base, styleId: sid, name: "Flyer", type: "MEDIA_VIEWER", posX: 1220, posY: 400, width: 660, height: 320, content: {} },
  { ...base, styleId: sid, name: "Divider", type: "SHAPE_DIVIDER", posX: 630, posY: 620, width: 560, height: 20, content: { shape: "line", color: "#475569", thickness: 4 } },
  { ...base, styleId: sid, name: "FIDS", type: "FIDS_BOARD", posX: 40, posY: 760, width: 900, height: 280, language: "english", fontSize: 30, content: { maxRows: 6, showRoom: true, title: "Departures" } },
  { ...base, styleId: sid, name: "Ticker", type: "SCROLLING_TICKER", posX: 980, posY: 980, width: 900, height: 60, language: "both", fontSize: 32, content: {} },
]);

await db
  .insert(screens)
  .values({
    orgId: org.id,
    name: "Widget Showcase",
    assignedStyleId: sid,
    styleSchedules: [{ id: `mig-${sid}-def`, styleId: sid, priority: 0, breakpoint: "all", rules: [{ type: "default" }] }],
    resolution: "1920x1080",
  });

const notesInserted = await seedBaselineNotes();

const counts = {
  orgs: (await db.select().from(orgs)).length,
  users: (await db.select().from(users)).length,
  orgMemberships: (await db.select().from(orgMemberships)).length,
  orgInvites: (await db.select().from(orgInvites)).length,
  styles: (await db.select().from(styles)).length,
  displayObjects: (await db.select().from(displayObjects)).length,
  screens: (await db.select().from(screens)).length,
  scheduleGroups: (await db.select().from(scheduleGroups)).length,
  minyanSchedules: (await db.select().from(minyanSchedules)).length,
  memorials: (await db.select().from(memorials)).length,
  announcements: (await db.select().from(announcements)).length,
  sponsors: (await db.select().from(sponsors)).length,
  media: (await db.select().from(media)).length,
  tukachinskyNotesBaseline: notesInserted,
};
console.log("[db:seed] demo org seeded:", JSON.stringify(counts));
console.log("[db:seed] login owner@demo.local / demo-pass (super-admin); invitee@demo.local / demo-pass + token demo-invite-token");
