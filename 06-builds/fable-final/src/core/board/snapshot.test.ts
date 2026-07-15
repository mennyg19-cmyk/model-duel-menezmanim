// === What's in this file ===
// Tests the pure snapshot builder (C3): given board data + a moment, it produces
// the resolved snapshot every surface renders. These prove the spine works
// without a database or a browser, so a break shows up here first.

import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { JewishCalendar } from "kosher-zmanim";
import { buildDisplaySnapshot } from "./snapshot";
import { DisplayObjectType } from "../style-engine";
import { defaultAppearance } from "./appearance";
import type { BoardData, BoardMinyan } from "./types";

const JERUSALEM = {
  name: "Test Shul",
  latitude: 31.7683,
  longitude: 35.2137,
  elevation: 754,
  timezone: "Asia/Jerusalem",
  inIsrael: true,
};

function makeObject(type: DisplayObjectType, content: Record<string, unknown> = {}) {
  return {
    id: `obj-${type}`,
    type,
    name: type,
    position: { x: 0, y: 0, width: 100, height: 100 },
    zIndex: 1,
    font: { family: "David Libre", size: 16, bold: false, italic: false, color: "#fff" },
    backgroundColor: "transparent",
    language: "both" as const,
    appearance: defaultAppearance("transparent"),
    content,
    visible: true,
  };
}

function makeData(overrides: Partial<BoardData> = {}): BoardData {
  const minyan: BoardMinyan = {
    id: "m1",
    name: "Shacharit",
    hebrewName: "שחרית",
    type: "shacharit",
    baseZman: "HANETZ",
    fixedTime: null,
    offsetMinutes: 0,
    roundTo: 5,
    roundDirection: "nearest",
    earliest: null,
    latest: null,
    groupIds: [],
    room: null,
    sortOrder: 0,
  };

  return {
    org: {
      id: "org1",
      name: "Test Shul",
      slug: "test",
      location: JERUSALEM,
      candleLightingMinutes: 40,
      inIsrael: true,
    },
    screen: { id: "s1", name: "Main", assignedStyleId: "style1", styleSchedules: null, resolution: "1920x1080" },
    styles: [
      {
        id: "style1",
        name: "Default",
        backgroundColor: "#0f172a",
        canvasWidth: 1920,
        canvasHeight: 1080,
        objects: [makeObject(DisplayObjectType.ZMANIM_TABLE), makeObject(DisplayObjectType.EVENTS_TABLE)],
        activationRules: [{ type: "default" }],
        sortOrder: 0,
      },
    ],
    minyanim: [minyan],
    memorials: [],
    announcements: [],
    sponsors: [],
    media: [],
    scheduleGroups: [],
    notes: [],
    ...overrides,
  };
}

describe("buildDisplaySnapshot", () => {
  const now = new Date("2026-06-15T09:00:00Z");

  it("resolves the active style and its visible objects", () => {
    const snapshot = buildDisplaySnapshot(makeData(), { now });
    expect(snapshot.style?.name).toBe("Default");
    expect(snapshot.objects).toHaveLength(2);
  });

  it("computes zmanim for the effective date", () => {
    const snapshot = buildDisplaySnapshot(makeData(), { now });
    expect(snapshot.data.zmanimByOffset["0"]?.length).toBeGreaterThan(20);
  });

  it("resolves a zman-anchored minyan to a real time", () => {
    const snapshot = buildDisplaySnapshot(makeData(), { now });
    const shacharit = snapshot.data.minyanim[0];
    expect(shacharit?.time).not.toBeNull();
  });

  it("rounds each minyan in its configured direction", () => {
    const data = makeData();
    // Fixed 06:03, round to 5: up -> 06:05, down -> 06:00, nearest -> 06:05.
    const base = { ...data.minyanim[0]!, baseZman: null, fixedTime: "06:03", roundTo: 5 };
    data.minyanim = [
      { ...base, id: "up", roundDirection: "up" },
      { ...base, id: "down", roundDirection: "down" },
      { ...base, id: "near", roundDirection: "nearest" },
    ];
    const snapshot = buildDisplaySnapshot(data, { now });
    const minute = (iso: string | null) => (iso ? new Date(iso).getUTCMinutes() + new Date(iso).getUTCHours() * 60 : -1);
    const byId = (id: string) => snapshot.data.minyanim.find((m) => m.id === id)!;
    // Compare the up vs down results: up must be later than (or equal to) down.
    expect(minute(byId("up").time)).toBeGreaterThan(minute(byId("down").time));
    expect(minute(byId("near").time)).toBe(minute(byId("up").time));
  });

  it("leaves a 'none' minyan at the exact zman time", () => {
    const data = makeData();
    // Hanetz-anchored minyan with no rounding should equal the raw Hanetz instant.
    data.minyanim = [
      { ...data.minyanim[0]!, id: "neitz", baseZman: "HANETZ", fixedTime: null, offsetMinutes: 0, roundTo: 5, roundDirection: "none" },
    ];
    const snapshot = buildDisplaySnapshot(data, { now });
    const hanetz = snapshot.data.zmanimByOffset["0"]!.find((z) => z.type === "HANETZ")!.time;
    expect(snapshot.data.minyanim[0]!.time).toBe(hanetz);
  });

  it("hides objects whose visible flag is false", () => {
    const data = makeData();
    data.styles[0]!.objects[0]!.visible = false;
    const snapshot = buildDisplaySnapshot(data, { now });
    expect(snapshot.objects).toHaveLength(1);
  });

  it("computes the extra day-offset a widget asks for", () => {
    const data = makeData();
    data.styles[0]!.objects.push(makeObject(DisplayObjectType.ZMANIM_TABLE, { daysAhead: 1 }));
    data.styles[0]!.objects[2]!.id = "obj-tomorrow";
    const snapshot = buildDisplaySnapshot(data, { now });
    expect(snapshot.data.zmanimByOffset["1"]?.length).toBeGreaterThan(20);
  });

  it("reads a fixed minyan time in the org timezone, not the server's", () => {
    const data = makeData();
    data.minyanim = [{ ...data.minyanim[0]!, baseZman: null, fixedTime: "13:30", roundTo: 0 }];
    const snapshot = buildDisplaySnapshot(data, { now });
    const iso = snapshot.data.minyanim[0]!.time!;
    const inShul = DateTime.fromISO(iso, { zone: "Asia/Jerusalem" });
    expect(inShul.hour).toBe(13);
    expect(inShul.minute).toBe(30);
  });

  it("uses a date override when given", () => {
    const override = new Date("2026-09-15T09:00:00Z");
    const snapshot = buildDisplaySnapshot(makeData(), { now, dateOverride: override });
    expect(snapshot.effectiveDate).toBe(override.toISOString());
  });

  it("attaches today's D16 daily notes to the calendar bundle", () => {
    const jcal = new JewishCalendar(now);
    const data = makeData({
      notes: [
        {
          id: "today-note",
          hebrewMonth: jcal.getJewishMonth(),
          hebrewDay: jcal.getJewishDayOfMonth(),
          noteHebrew: "הערה",
          noteEnglish: "A note",
          category: "calendar",
        },
        {
          id: "other-day",
          hebrewMonth: jcal.getJewishMonth(),
          hebrewDay: (jcal.getJewishDayOfMonth() % 29) + 1,
          noteHebrew: "אחר",
          noteEnglish: "Other",
          category: "calendar",
        },
      ],
    });
    const snapshot = buildDisplaySnapshot(data, { now });
    const todayNotes = snapshot.data.calendarByOffset["0"]!.notes!;
    expect(todayNotes).toHaveLength(1);
    expect(todayNotes[0]!.id).toBe("today-note");
  });

  it("computes days until each memorial's next Hebrew anniversary (0 = today)", () => {
    // Derive today's Hebrew date so the assertion holds on any run date.
    const jcal = new JewishCalendar(now);
    const data = makeData({
      memorials: [
        {
          id: "today",
          hebrewName: "פלוני",
          englishName: null,
          relationship: null,
          hebrewMonth: jcal.getJewishMonth(),
          hebrewDay: jcal.getJewishDayOfMonth(),
          isYahrzeit: true,
        },
      ],
    });
    const snapshot = buildDisplaySnapshot(data, { now });
    expect(snapshot.data.memorials[0]!.daysUntil).toBe(0);
  });
});
