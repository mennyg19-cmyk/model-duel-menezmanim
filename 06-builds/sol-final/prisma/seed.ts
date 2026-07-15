import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCHEDULE_GROUPS } from "../src/content/default-groups";
import { seedGlobalNotesFromCore } from "../src/domain/content";
import { DisplayObjectType } from "../src/core/style-engine";

const prisma = new PrismaClient();

type WidgetSeed = {
  name: string;
  type: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  layer: number;
  content: Record<string, unknown>;
  foreColor?: string;
  backColor?: string;
  language?: string;
};

/** Phase 6 — one of every widget family on the default style (W1–W17). */
async function seedBoardWidgets(styleId: string) {
  const widgets: WidgetSeed[] = [
    {
      name: "Plain Text",
      type: DisplayObjectType.PLAIN_TEXT,
      posX: 40,
      posY: 20,
      width: 360,
      height: 60,
      layer: 0,
      content: { text: "MenEZmanim Demo Board", textHebrew: "לוח הדגמה" },
      foreColor: "#f8f4e8",
    },
    {
      name: "Rich Text",
      type: DisplayObjectType.RICH_TEXT,
      posX: 420,
      posY: 20,
      width: 300,
      height: 60,
      layer: 1,
      content: { html: "<b>Welcome</b> · <i>ברוכים הבאים</i>" },
      foreColor: "#72d8ad",
    },
    {
      name: "Zmanim",
      type: DisplayObjectType.ZMANIM_TABLE,
      posX: 40,
      posY: 100,
      width: 420,
      height: 320,
      layer: 2,
      content: {
        daysAhead: 0,
        title: "Zmanim",
        titleHebrew: "זמנים",
        use24h: false,
        zmanim: {
          HANETZ: true,
          SOF_ZMAN_SHMA: true,
          SOF_ZMAN_TEFILLAH: true,
          CHATZOS: true,
          MINCHA_GEDOLAH: true,
          SHKIAH: true,
        },
      },
      foreColor: "#f8f4e8",
      backColor: "rgba(15,26,23,0.65)",
    },
    {
      name: "Minyanim",
      type: DisplayObjectType.EVENTS_TABLE,
      posX: 480,
      posY: 100,
      width: 420,
      height: 280,
      layer: 3,
      content: {
        title: "Minyanim",
        titleHebrew: "מניינים",
        showRoom: true,
        emphasizeCurrentNext: true,
      },
      foreColor: "#f8f4e8",
      backColor: "rgba(15,26,23,0.65)",
    },
    {
      name: "Analog Clock",
      type: DisplayObjectType.ANALOG_CLOCK,
      posX: 940,
      posY: 100,
      width: 200,
      height: 200,
      layer: 4,
      content: {},
      foreColor: "#f8f4e8",
    },
    {
      name: "Digital Clock",
      type: DisplayObjectType.DIGITAL_CLOCK,
      posX: 1160,
      posY: 100,
      width: 280,
      height: 80,
      layer: 5,
      content: { format24h: false, showSeconds: true, showAmPm: true, textAlign: "center" },
      foreColor: "#72d8ad",
    },
    {
      name: "Countdown",
      type: DisplayObjectType.COUNTDOWN_TIMER,
      posX: 1160,
      posY: 200,
      width: 280,
      height: 100,
      layer: 6,
      content: { targetZman: "SHKIAH", label: "Until sunset", labelHebrew: "עד השקיעה" },
      foreColor: "#f8f4e8",
    },
    {
      name: "Jewish Info",
      type: DisplayObjectType.JEWISH_INFO,
      posX: 1480,
      posY: 100,
      width: 400,
      height: 280,
      layer: 7,
      content: { layout: "vertical", daysAhead: 0 },
      foreColor: "#f8f4e8",
      backColor: "rgba(15,26,23,0.65)",
      language: "both",
    },
    {
      name: "Announcements",
      type: DisplayObjectType.SCROLLING_TICKER,
      posX: 40,
      posY: 440,
      width: 860,
      height: 50,
      layer: 8,
      content: { separator: "  •  ", direction: "left" },
      foreColor: "#f8f4e8",
      backColor: "rgba(31,107,87,0.85)",
    },
    {
      name: "Yahrzeits",
      type: DisplayObjectType.YAHRZEIT_DISPLAY,
      posX: 940,
      posY: 320,
      width: 500,
      height: 160,
      layer: 9,
      content: { daysAhead: 30, title: "Yahrzeits", titleHebrew: "יארצייטן" },
      foreColor: "#f8f4e8",
      backColor: "rgba(15,26,23,0.65)",
    },
    {
      name: "Sponsors",
      type: DisplayObjectType.SPONSOR_DISPLAY,
      posX: 1480,
      posY: 400,
      width: 400,
      height: 100,
      layer: 10,
      content: { rotateSeconds: 8 },
      foreColor: "#f8f4e8",
    },
    {
      name: "Media",
      type: DisplayObjectType.MEDIA_VIEWER,
      posX: 1480,
      posY: 520,
      width: 400,
      height: 220,
      layer: 11,
      content: { useAll: true, intervalSeconds: 6, fit: "contain" },
      backColor: "#12201c",
    },
    {
      name: "Divider",
      type: DisplayObjectType.SHAPE_DIVIDER,
      posX: 40,
      posY: 510,
      width: 860,
      height: 8,
      layer: 12,
      content: { kind: "line", color: "#72d8ad" },
      backColor: "#72d8ad",
    },
    {
      name: "Tefilah Notes",
      type: DisplayObjectType.TEFILAH_NOTES,
      posX: 40,
      posY: 540,
      width: 500,
      height: 200,
      layer: 13,
      content: { showTukachinsky: true, showTefilahRules: true },
      foreColor: "#f8f4e8",
      backColor: "rgba(15,26,23,0.65)",
      language: "both",
    },
    {
      name: "Sefira",
      type: DisplayObjectType.SEFIRA_COUNTER,
      posX: 560,
      posY: 540,
      width: 340,
      height: 120,
      layer: 14,
      content: { showEnglish: true },
      foreColor: "#f8f4e8",
    },
    {
      name: "FIDS Board",
      type: DisplayObjectType.FIDS_BOARD,
      posX: 940,
      posY: 500,
      width: 500,
      height: 320,
      layer: 15,
      content: {
        maxRows: 5,
        showRoom: true,
        title: "Departures",
        titleHebrew: "מניינים",
        nowWindowMinutes: 15,
      },
      foreColor: "#f8f4e8",
      backColor: "rgba(0,0,0,0.55)",
    },
    {
      name: "Date Picker",
      type: DisplayObjectType.DATE_PICKER,
      posX: 40,
      posY: 760,
      width: 500,
      height: 80,
      layer: 16,
      content: { showShabbatButton: true, showTodayButton: true },
      foreColor: "#f8f4e8",
      backColor: "rgba(31,107,87,0.9)",
    },
  ];

  await prisma.displayObject.createMany({
    data: widgets.map((w) => ({
      styleId,
      name: w.name,
      type: w.type,
      posX: w.posX,
      posY: w.posY,
      width: w.width,
      height: w.height,
      layer: w.layer,
      fontFamily: "David Libre",
      fontSize: 18,
      fontBold: false,
      fontItalic: false,
      foreColor: w.foreColor ?? "#f8f4e8",
      backColor: w.backColor ?? "transparent",
      language: w.language ?? "english",
      content: JSON.stringify(w.content),
      visible: true,
    })),
  });
}

async function seedOrgDefaults(orgId: string, opts?: { screenId?: string; seedWidgets?: boolean }) {
  const style = await prisma.style.create({
    data: {
      name: "Default Style",
      orgId,
      backgroundColor: "#0f172a",
      backgroundMode: "solid",
      canvasWidth: 1920,
      canvasHeight: 1080,
      isDefault: true,
      activationRules: JSON.stringify([{ type: "default" }]),
      sortOrder: 0,
    },
  });
  await prisma.screen.create({
    data: {
      ...(opts?.screenId ? { id: opts.screenId } : {}),
      name: "Main Display",
      orgId,
      assignedStyleId: style.id,
      styleSchedules: JSON.stringify([
        {
          id: "default-full",
          styleId: style.id,
          breakpoint: "all",
          rules: [{ type: "default" }],
          priority: 0,
        },
      ]),
      isActive: true,
      resolution: "1920x1080",
    },
  });
  await prisma.scheduleGroup.createMany({
    data: DEFAULT_SCHEDULE_GROUPS.map((group, index) => ({
      orgId,
      name: group.name,
      hebrewName: group.hebrewName,
      color: group.color,
      active: true,
      sortOrder: index,
      isBuiltIn: true,
    })),
  });
  if (opts?.seedWidgets) {
    await seedBoardWidgets(style.id);
  }
  return style.id;
}

async function seedDemoSchedules(orgId: string) {
  const weekday = await prisma.scheduleGroup.findFirst({
    where: { orgId, name: "Weekday" },
  });
  const shabbat = await prisma.scheduleGroup.findFirst({
    where: { orgId, name: "Shabbat" },
  });

  await prisma.minyanSchedule.createMany({
    data: [
      {
        orgId,
        name: "Shacharit",
        hebrewName: "שחרית",
        type: "shacharit",
        fixedTime: "06:30",
        dayOfWeekMask: "1111100",
        scheduleGroupIds: weekday ? JSON.stringify([weekday.id]) : null,
        room: "Main Sanctuary",
        sortOrder: 0,
      },
      {
        orgId,
        name: "Shacharit (Shabbat)",
        hebrewName: "שחרית שבת",
        type: "shacharit",
        fixedTime: "08:00",
        dayOfWeekMask: "0000010",
        scheduleGroupIds: shabbat ? JSON.stringify([shabbat.id]) : null,
        room: "Main Sanctuary",
        sortOrder: 1,
      },
      {
        orgId,
        name: "Mincha",
        hebrewName: "מנחה",
        type: "mincha",
        baseZman: "MINCHA_GEDOLAH",
        offset: 15,
        roundTo: 5,
        dayOfWeekMask: "1111111",
        scheduleGroupIds: weekday ? JSON.stringify([weekday.id]) : null,
        room: "Beit Midrash",
        sortOrder: 2,
      },
      {
        orgId,
        name: "Maariv",
        hebrewName: "מעריב",
        type: "maariv",
        baseZman: "TZAIS",
        offset: 10,
        roundTo: 5,
        dayOfWeekMask: "1111111",
        room: "Main Sanctuary",
        sortOrder: 3,
      },
      {
        orgId,
        name: "",
        hebrewName: "",
        type: "placeholder",
        fixedTime: null,
        dayOfWeekMask: "1111111",
        details: JSON.stringify({ isPlaceholder: true, placeholderLabel: "Afternoon break" }),
        sortOrder: 4,
      },
    ],
  });
}

async function seedDemoContent(orgId: string) {
  await prisma.announcement.createMany({
    data: [
      {
        orgId,
        title: "Welcome guests",
        titleHebrew: "ברוכים הבאים לאורחים",
        content: "Kiddush after Shabbat morning davening this week.",
        contentHebrew: "קידוש אחרי תפילת שחרית בשבת זו.",
        scheduleRules: JSON.stringify({ type: "always" }),
        priority: 2,
        isActive: true,
      },
      {
        orgId,
        title: "Learning schedule",
        titleHebrew: "סדר לימוד",
        content: "Daf Yomi meets daily after Shacharit in the Beit Midrash.",
        contentHebrew: "דף יומי מדי יום אחרי שחרית בבית המדרש.",
        scheduleRules: JSON.stringify({ type: "day_of_week", mask: "1111100" }),
        priority: 1,
        isActive: true,
      },
    ],
  });

  await prisma.memorial.createMany({
    data: [
      {
        orgId,
        hebrewName: "אברהם בן דוד",
        englishName: "Avraham ben David",
        hebrewFamilyName: "כהן",
        hebrewBenBat: "בן",
        hebrewMonth: 7,
        hebrewDay: 10,
        relationship: "father",
        isYahrzeit: true,
        notes: "Seed memorial with relationship (F5)",
        isActive: true,
      },
      {
        orgId,
        hebrewName: "שרה בת משה",
        englishName: "Sarah bat Moshe",
        relationship: "mother",
        hebrewMonth: 1,
        hebrewDay: 15,
        isYahrzeit: true,
        isActive: true,
      },
    ],
  });

  await prisma.sponsor.createMany({
    data: [
      {
        orgId,
        type: "kiddush",
        sponsorName: "The Cohen Family",
        englishText: "Kiddush sponsored by the Cohen family",
        hebrewText: "הקידוש נתרם ע״י משפחת כהן",
        hebrewDate: "ט״ו בשבט",
        isRecurring: true,
        recurrenceRule: "yearly-hebrew:15-11",
        isActive: true,
      },
      {
        orgId,
        type: "shiur",
        sponsorName: "Anonymous",
        englishText: "Today's shiur sponsorship",
        isRecurring: false,
        isActive: true,
      },
    ],
  });

  const relDir = path.join("uploads", orgId);
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });
  const filename = "seed-flyer.svg";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="#123d34"/><text x="20" y="100" fill="#72d8ad" font-size="24">Demo Flyer</text></svg>';
  await writeFile(path.join(absDir, filename), svg, "utf8");
  await prisma.media.create({
    data: {
      orgId,
      filename,
      originalName: "demo-flyer.svg",
      mimeType: "image/svg+xml",
      fileSize: Buffer.byteLength(svg),
      filePath: path.join(relDir, filename).replace(/\\/g, "/"),
      scheduleRules: JSON.stringify({ type: "always" }),
      sortOrder: 0,
      isActive: true,
    },
  });

  // Demo org override + hide against seeded global baseline (applied after globals exist)
  const globals = await prisma.tukachinskyNote.findMany({
    where: { orgId: null },
    take: 2,
    orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }],
  });
  if (globals[0]) {
    await prisma.tukachinskyNote.create({
      data: {
        orgId,
        overridesNoteId: globals[0].id,
        hebrewMonth: globals[0].hebrewMonth,
        hebrewDay: globals[0].hebrewDay,
        noteHebrew: `${globals[0].noteHebrew} — demo override`,
        noteEnglish: `${globals[0].noteEnglish ?? ""} (demo override)`.trim(),
        category: globals[0].category,
        source: globals[0].source,
        isActive: true,
        isHidden: false,
      },
    });
  }
  if (globals[1]) {
    await prisma.tukachinskyNote.create({
      data: {
        orgId,
        overridesNoteId: globals[1].id,
        hebrewMonth: globals[1].hebrewMonth,
        hebrewDay: globals[1].hebrewDay,
        noteHebrew: globals[1].noteHebrew,
        noteEnglish: globals[1].noteEnglish,
        category: globals[1].category,
        source: globals[1].source,
        isActive: true,
        isHidden: true,
      },
    });
  }
  await prisma.tukachinskyNote.create({
    data: {
      orgId,
      hebrewMonth: 5,
      hebrewDay: 9,
      category: "minhag",
      noteHebrew: "הערה מקומית לדמו",
      noteEnglish: "Local demo shul note",
      source: "seed",
      isActive: true,
      isHidden: false,
    },
  });
}

async function main() {
  await prisma.syncLog.deleteMany();
  await prisma.tukachinskyNote.deleteMany();
  await prisma.media.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.memorial.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.minyanSchedule.deleteMany();
  await prisma.zmanimConfig.deleteMany();
  await prisma.orgInvite.deleteMany();
  await prisma.orgMembership.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.displayObject.deleteMany();
  await prisma.style.deleteMany();
  await prisma.scheduleGroup.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const globalNoteCount = await seedGlobalNotesFromCore();

  const admin = await prisma.user.create({
    data: {
      clerkUserId: "local_admin",
      email: "admin@menezmanim.local",
      name: "Super Admin",
      isSuperAdmin: true,
    },
  });

  const owner = await prisma.user.create({
    data: {
      clerkUserId: "local_owner",
      email: "owner@demo.local",
      name: "Demo Owner",
      isSuperAdmin: false,
    },
  });

  const invitee = await prisma.user.create({
    data: {
      clerkUserId: "local_invitee",
      email: "invitee@demo.local",
      name: "Pending Invitee",
      isSuperAdmin: false,
    },
  });

  await prisma.user.create({
    data: {
      clerkUserId: "local_newcomer",
      email: "newcomer@demo.local",
      name: "New Comer",
      isSuperAdmin: false,
    },
  });

  const demo = await prisma.organization.create({
    data: {
      name: "Demo Synagogue",
      slug: "demo",
      status: "active",
      latitude: 31.7683,
      longitude: 35.2137,
      elevation: 780,
      timezone: "Asia/Jerusalem",
      inIsrael: true,
      dialect: "Ashkenazi",
      candleLightingMinutes: 40,
      settings: JSON.stringify({ nameHebrew: "בית כנסת לדוגמה", boardDefaultLocale: "en" }),
      plan: "pro",
    },
  });
  await seedOrgDefaults(demo.id, { screenId: "main", seedWidgets: true });
  await seedDemoSchedules(demo.id);
  await seedDemoContent(demo.id);
  await prisma.syncLog.create({
    data: {
      orgId: demo.id,
      tableName: "Announcement",
      recordId: "offline-seed-001",
      operation: "upsert",
      data: JSON.stringify({
        title: "Seeded offline notice",
        content: "This durable change must remain available after a server restart.",
      }),
      timestamp: new Date("2026-07-15T08:00:00.000Z"),
      clientTimestamp: new Date("2026-07-15T08:00:00.000Z"),
      synced: false,
    },
  });
  await prisma.orgMembership.create({
    data: { userId: owner.id, orgId: demo.id, role: "owner" },
  });
  await prisma.orgMembership.create({
    data: { userId: admin.id, orgId: demo.id, role: "admin" },
  });

  await prisma.orgInvite.create({
    data: {
      orgId: demo.id,
      email: "invitee@demo.local",
      role: "editor",
      token: "seed-invite-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(
    JSON.stringify(
      {
        seeded: true,
        users: ["admin@menezmanim.local", "owner@demo.local", "invitee@demo.local", "newcomer@demo.local"],
        inviteToken: "seed-invite-token",
        demoOrg: demo.slug,
        schedules: 5,
        announcements: 2,
        memorials: 2,
        sponsors: 2,
        media: 1,
        globalNotes: globalNoteCount,
        widgets: 17,
        syncLogs: 1,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
