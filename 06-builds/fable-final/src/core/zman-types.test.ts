import { describe, it, expect } from "vitest";
import { HalachicAuthority, ZmanType, DEFAULT_OPINIONS } from "./zman-types";

describe("zman types and opinions", () => {
  it("has the 10 halachic authorities", () => {
    expect(Object.keys(HalachicAuthority)).toHaveLength(10);
  });

  it("gives every zman type a default opinion", () => {
    const zmanTypes = Object.values(ZmanType);
    for (const type of zmanTypes) {
      expect(DEFAULT_OPINIONS.has(type)).toBe(true);
    }
    expect(DEFAULT_OPINIONS.size).toBe(zmanTypes.length);
  });

  it("keeps the well-known default opinions", () => {
    expect(DEFAULT_OPINIONS.get(ZmanType.TZAIS)?.degreesBelow).toBe(8.5);
    expect(DEFAULT_OPINIONS.get(ZmanType.CANDLE_LIGHTING)).toMatchObject({
      authority: HalachicAuthority.FIXED_MINUTES,
      fixedMinutes: 40,
    });
    expect(DEFAULT_OPINIONS.get(ZmanType.ALOS_TUKACHINSKY)?.fixedMinutes).toBe(
      90,
    );
    expect(DEFAULT_OPINIONS.get(ZmanType.RABBEINU_TAM_END)).toMatchObject({
      authority: HalachicAuthority.RABBEINU_TAM,
      fixedMinutes: 72,
    });
  });
});
