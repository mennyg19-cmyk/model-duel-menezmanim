import { describe, it, expect } from "vitest";
import { getDailyRefraction } from "./refraction";

describe("getDailyRefraction", () => {
  it("returns the exact table value for known dates", () => {
    expect(getDailyRefraction(1, 1)).toBe(0.8338); // Jan 1
    expect(getDailyRefraction(6, 1)).toBe(0.7749); // Jun 1 (near the year's low)
    expect(getDailyRefraction(12, 31)).toBe(0.8339); // Dec 31
  });

  it("handles the last valid day of months with 28-31 days", () => {
    expect(getDailyRefraction(2, 28)).toBe(0.8241); // February
    expect(getDailyRefraction(4, 30)).toBe(0.7824); // April
  });

  it("falls back to a mid-range value for out-of-range dates", () => {
    expect(getDailyRefraction(13, 1)).toBe(0.833); // no such month
    expect(getDailyRefraction(1, 0)).toBe(0.833); // day 0
    expect(getDailyRefraction(2, 30)).toBe(0.833); // February has no day 30
  });
});
