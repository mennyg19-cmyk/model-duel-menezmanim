import { describe, it, expect } from "vitest";
import {
  gregorianDayOfYear,
  hebrewOrdinal,
  parseTime,
  toMinutesSinceMidnight,
  parseTimeToMins,
  isTimeRangeActive,
  isGregorianRangeActive,
  isHebrewRangeActive,
} from "./calendar-utils";

describe("gregorianDayOfYear", () => {
  it("Jan 1 = day 1", () => {
    expect(gregorianDayOfYear(1, 1)).toBe(1);
  });

  it("Feb 1 = day 32", () => {
    expect(gregorianDayOfYear(2, 1)).toBe(32);
  });

  it("Dec 31 = day 366 (leap year table)", () => {
    expect(gregorianDayOfYear(12, 31)).toBe(366);
  });
});

describe("hebrewOrdinal", () => {
  it("Tishrei 1 (month 7) is the earliest ordinal", () => {
    expect(hebrewOrdinal(7, 1)).toBe(101);
  });

  it("Elul 29 (month 6) is the latest ordinal", () => {
    expect(hebrewOrdinal(6, 29)).toBe(1329);
  });

  it("Nissan (month 1) comes after Adar II (month 13)", () => {
    expect(hebrewOrdinal(1, 1)).toBeGreaterThan(hebrewOrdinal(13, 29));
  });
});

describe("parseTime", () => {
  it("parses HH:MM correctly", () => {
    expect(parseTime("06:30")).toEqual({ hours: 6, minutes: 30 });
  });

  it("handles midnight", () => {
    expect(parseTime("00:00")).toEqual({ hours: 0, minutes: 0 });
  });
});

describe("toMinutesSinceMidnight", () => {
  it("6:30 AM = 390 minutes", () => {
    const d = new Date(2024, 0, 1, 6, 30, 0);
    expect(toMinutesSinceMidnight(d)).toBe(390);
  });
});

describe("parseTimeToMins", () => {
  it("parses valid time", () => {
    expect(parseTimeToMins("14:30")).toBe(870);
  });

  it("returns -1 for invalid input", () => {
    expect(parseTimeToMins("abc")).toBe(-1);
  });
});

describe("isTimeRangeActive", () => {
  it("returns true when time is within normal range", () => {
    const date = new Date(2024, 0, 1, 10, 0);
    expect(isTimeRangeActive("09:00", "11:00", date)).toBe(true);
  });

  it("returns false when time is outside range", () => {
    const date = new Date(2024, 0, 1, 12, 0);
    expect(isTimeRangeActive("09:00", "11:00", date)).toBe(false);
  });

  it("handles midnight wrap-around", () => {
    const date = new Date(2024, 0, 1, 23, 30);
    expect(isTimeRangeActive("22:00", "02:00", date)).toBe(true);
  });
});

describe("isGregorianRangeActive", () => {
  it("returns true for date in normal range", () => {
    expect(isGregorianRangeActive(3, 1, 6, 30, 4, 15)).toBe(true);
  });

  it("returns false for date outside range", () => {
    expect(isGregorianRangeActive(3, 1, 6, 30, 7, 1)).toBe(false);
  });

  it("handles year-boundary wrap-around (Nov-Feb)", () => {
    expect(isGregorianRangeActive(11, 1, 2, 28, 1, 15)).toBe(true);
    expect(isGregorianRangeActive(11, 1, 2, 28, 5, 1)).toBe(false);
  });
});

describe("isHebrewRangeActive", () => {
  it("Tishrei 15 is within Tishrei 1 to Tishrei 22", () => {
    expect(isHebrewRangeActive(7, 1, 7, 22, 7, 15)).toBe(true);
  });

  it("Nissan 1 is NOT within Tishrei 1 to Adar 29", () => {
    expect(isHebrewRangeActive(7, 1, 12, 29, 1, 1)).toBe(false);
  });

  it("handles Elul-to-Cheshvan wrap-around", () => {
    expect(isHebrewRangeActive(6, 25, 8, 7, 7, 1)).toBe(true);
  });
});
