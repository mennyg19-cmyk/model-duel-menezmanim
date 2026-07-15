import { describe, it, expect, beforeEach } from "vitest";
import {
  ZmanimEngine,
  type ZmanimConfig,
} from "./zmanim-engine";
import { ZmanType, HalachicAuthority } from "./zman-types";

const JERUSALEM_CONFIG: ZmanimConfig = {
  location: {
    name: "Jerusalem",
    latitude: 31.7683,
    longitude: 35.2137,
    elevation: 800,
    timezone: "Asia/Jerusalem",
    inIsrael: true,
  },
  zmanim: [
    { type: ZmanType.ALOS, authority: HalachicAuthority.GRA },
    { type: ZmanType.HANETZ, authority: HalachicAuthority.GRA },
    { type: ZmanType.CHATZOS, authority: HalachicAuthority.GRA },
    { type: ZmanType.SHKIAH, authority: HalachicAuthority.GRA },
    { type: ZmanType.TZAIS, authority: HalachicAuthority.GRA },
  ],
  candleLightingMinutes: 40,
};

const SUMMER_SOLSTICE = new Date(2024, 5, 21); // June 21 2024

describe("ZmanimEngine", () => {
  let engine: ZmanimEngine;

  beforeEach(() => {
    engine = new ZmanimEngine(JERUSALEM_CONFIG);
  });

  it("returns results for all configured zmanim", () => {
    const results = engine.getZmanimForDate(SUMMER_SOLSTICE);

    expect(results).toHaveLength(JERUSALEM_CONFIG.zmanim.length);
    for (const result of results) {
      expect(result.time).toBeInstanceOf(Date);
      expect(result.label).toBeTruthy();
      expect(result.hebrewLabel).toBeTruthy();
    }
  });

  it("sunrise is before chatzos, chatzos is before sunset", () => {
    const results = engine.getZmanimForDate(SUMMER_SOLSTICE);

    const sunrise = results.find((r) => r.type === ZmanType.HANETZ)!;
    const chatzos = results.find((r) => r.type === ZmanType.CHATZOS)!;
    const sunset = results.find((r) => r.type === ZmanType.SHKIAH)!;

    expect(sunrise.time).toBeInstanceOf(Date);
    expect(chatzos.time).toBeInstanceOf(Date);
    expect(sunset.time).toBeInstanceOf(Date);

    expect(sunrise.time!.getTime()).toBeLessThan(chatzos.time!.getTime());
    expect(chatzos.time!.getTime()).toBeLessThan(sunset.time!.getTime());
  });

  it("caches results for the same date", () => {
    const first = engine.getZmanimForDate(SUMMER_SOLSTICE);
    const second = engine.getZmanimForDate(SUMMER_SOLSTICE);

    expect(first).toBe(second);
  });

  it("clearCache returns fresh results", () => {
    const first = engine.getZmanimForDate(SUMMER_SOLSTICE);

    engine.clearCache();

    const second = engine.getZmanimForDate(SUMMER_SOLSTICE);
    expect(first).not.toBe(second);

    expect(first[0]!.time!.getTime()).toBe(second[0]!.time!.getTime());
  });
});
