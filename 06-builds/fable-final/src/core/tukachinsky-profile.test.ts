import { describe, it, expect } from "vitest";
import { TUKACHINSKY_PROFILE } from "./tukachinsky-profile";
import { ZmanType } from "./zman-types";

describe("TUKACHINSKY_PROFILE", () => {
  it("has exactly 13 entries (one per Tukachinsky zman type)", () => {
    expect(TUKACHINSKY_PROFILE.size).toBe(13);
  });

  it("alos is 90 fixed minutes", () => {
    const alos = TUKACHINSKY_PROFILE.get(ZmanType.ALOS_TUKACHINSKY);
    expect(alos).toBeDefined();
    expect(alos!.fixedMinutes).toBe(90);
    expect(alos!.degreesBelow).toBeUndefined();
  });

  it("misheyakir is 11.5 degrees below", () => {
    const m = TUKACHINSKY_PROFILE.get(ZmanType.MISHEYAKIR_TUKACHINSKY);
    expect(m).toBeDefined();
    expect(m!.degreesBelow).toBe(11.5);
  });

  it("sunrise and sunset use 0.833 degrees (standard refraction)", () => {
    const sr = TUKACHINSKY_PROFILE.get(ZmanType.HANETZ_TUKACHINSKY);
    const ss = TUKACHINSKY_PROFILE.get(ZmanType.SHKIAH_TUKACHINSKY);
    expect(sr!.degreesBelow).toBe(0.833);
    expect(ss!.degreesBelow).toBe(0.833);
  });

  it("tzais is 8.5 degrees below", () => {
    const tz = TUKACHINSKY_PROFILE.get(ZmanType.TZAIS_TUKACHINSKY);
    expect(tz!.degreesBelow).toBe(8.5);
  });

  it("Rabbeinu Tam is 72 fixed minutes", () => {
    const rt = TUKACHINSKY_PROFILE.get(ZmanType.RABBEINU_TAM_TUKACHINSKY);
    expect(rt!.fixedMinutes).toBe(72);
  });

  it("every entry has a note and source string", () => {
    for (const [, def] of TUKACHINSKY_PROFILE) {
      expect(def.note.length).toBeGreaterThan(0);
      expect(def.source.length).toBeGreaterThan(0);
    }
  });
});
