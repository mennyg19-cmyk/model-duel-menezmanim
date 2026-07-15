// === What's in this file ===
// Proves the dual-engine comparison groups competing opinions correctly: each
// concept gathers its variants (GR"A + Tukachinsky, and M"A where it exists), and
// the spread between the extreme times is reported so a human can compare.

import { describe, expect, it } from "vitest";
import { buildHalachicComparison, conceptKey } from "./halachic-comparison";
import { ZmanType } from "./zman-types";
import { ZmanimEngine, type ZmanConfig } from "./zmanim-engine";
import { DEFAULT_OPINIONS } from "./zman-types";

const JERUSALEM = {
  name: "Jerusalem",
  latitude: 31.7683,
  longitude: 35.2137,
  elevation: 754,
  timezone: "Asia/Jerusalem",
  inIsrael: true,
};

function jerusalemResults() {
  const zmanim: ZmanConfig[] = [...DEFAULT_OPINIONS.entries()].map(([type, op]) => ({
    type,
    authority: op.authority,
    degreesBelow: op.degreesBelow,
    fixedMinutes: op.fixedMinutes,
  }));
  const engine = new ZmanimEngine({ location: JERUSALEM, zmanim, candleLightingMinutes: 40 });
  return engine.getZmanimForDate(new Date("2026-06-15T10:00:00Z"));
}

describe("conceptKey", () => {
  it("collapses variants to their base concept", () => {
    expect(conceptKey(ZmanType.SOF_ZMAN_SHMA_TUKACHINSKY)).toBe(ZmanType.SOF_ZMAN_SHMA);
    expect(conceptKey(ZmanType.SOF_ZMAN_SHMA_MGA)).toBe(ZmanType.SOF_ZMAN_SHMA);
    expect(conceptKey(ZmanType.SOF_ZMAN_SHMA_MGA_TUKACHINSKY)).toBe(ZmanType.SOF_ZMAN_SHMA);
    expect(conceptKey(ZmanType.RABBEINU_TAM_TUKACHINSKY)).toBe(ZmanType.RABBEINU_TAM_END);
    expect(conceptKey(ZmanType.CHATZOS)).toBe(ZmanType.CHATZOS);
  });
});

describe("buildHalachicComparison", () => {
  it("gathers all four Sof Zman Shema opinions under one row", () => {
    const rows = buildHalachicComparison(jerusalemResults(), "Asia/Jerusalem");
    const shma = rows.find((r) => r.concept === ZmanType.SOF_ZMAN_SHMA);
    expect(shma).toBeDefined();
    expect(shma!.opinions.length).toBe(4);
    expect(shma!.spreadMinutes).not.toBeNull();
    // GR"A and M"A latest-Shema differ, so there must be a real spread.
    expect(shma!.spreadMinutes!).toBeGreaterThan(0);
  });

  it("formats times in the requested timezone", () => {
    const rows = buildHalachicComparison(jerusalemResults(), "Asia/Jerusalem");
    const hanetz = rows.find((r) => r.concept === ZmanType.HANETZ);
    expect(hanetz!.opinions[0]!.time).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });
});
