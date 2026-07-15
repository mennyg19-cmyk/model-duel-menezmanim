import { describe, it, expect, beforeAll } from "vitest";
import { CalendarEngine } from "./calendar-engine";

let engine: CalendarEngine;

beforeAll(() => {
  engine = new CalendarEngine(true); // Israel
});

describe("CalendarEngine — getJewishDate", () => {
  it("returns correct Hebrew date for a known Gregorian date", () => {
    // Sep 16, 2023 = 1 Tishrei 5784
    const result = engine.getJewishDate(new Date(2023, 8, 16));
    expect(result.year).toBe(5784);
    expect(result.month).toBe(7); // Tishrei = month 7 in kosher-zmanim
    expect(result.day).toBe(1);
    expect(result.isLeapYear).toBe(true); // 5784 is a leap year
  });

  it("formats Hebrew and English", () => {
    const result = engine.getJewishDate(new Date(2023, 8, 16));
    expect(result.formattedHebrew).toBeTruthy();
    expect(result.formattedEnglish).toBeTruthy();
    expect(result.monthNameHebrew).toBeTruthy();
  });
});

describe("CalendarEngine — getParsha", () => {
  it("returns a parsha on Shabbos", () => {
    // Oct 14, 2023 is Shabbos Bereishis (29 Tishrei 5784)
    const result = engine.getParsha(new Date(2023, 9, 14));
    expect(result.parsha).toBeTruthy();
    expect(result.parshaHebrew).toBeTruthy();
  });

  it("returns empty parsha on a weekday", () => {
    const result = engine.getParsha(new Date(2023, 9, 16)); // Monday
    expect(result.parsha).toBe("");
  });

  it("calculates upcoming parsha on a weekday", () => {
    const result = engine.getParsha(new Date(2023, 9, 16)); // Monday
    expect(result.upcoming).toBeTruthy();
  });
});

describe("CalendarEngine — getDafYomi", () => {
  it("returns non-empty daf info for a recent date", () => {
    const result = engine.getDafYomi(new Date(2024, 0, 15));
    expect(result.masechta).toBeTruthy();
    expect(result.daf).toBeGreaterThan(0);
    expect(result.formatted).toBeTruthy();
  });
});

describe("CalendarEngine — getHoliday", () => {
  it("Rosh Hashana is yom tov and assur bemelacha", () => {
    const result = engine.getHoliday(new Date(2023, 8, 16)); // 1 Tishrei 5784
    expect(result.isYomTov).toBe(true);
    expect(result.isAssurBemelacha).toBe(true);
    expect(result.name).toBeTruthy();
  });

  it("Chanukah day 1 is flagged", () => {
    // Dec 8, 2023 = 25 Kislev 5784
    const result = engine.getHoliday(new Date(2023, 11, 8));
    expect(result.isChanukah).toBe(true);
    expect(result.chanukahDay).toBe(1);
  });

  it("regular weekday has no holiday", () => {
    // Jan 3, 2024 = 21 Teves 5784
    const result = engine.getHoliday(new Date(2024, 0, 3));
    expect(result.isYomTov).toBe(false);
    expect(result.name).toBe("");
  });
});

describe("CalendarEngine — getOmer", () => {
  it("returns omer during sefirah period", () => {
    // Apr 24, 2024 = 16 Nissan 5784 = Omer day 1
    const result = engine.getOmer(new Date(2024, 3, 24));
    expect(result).not.toBeNull();
    expect(result!.day).toBe(1);
  });

  it("returns null outside sefirah", () => {
    const result = engine.getOmer(new Date(2024, 0, 15));
    expect(result).toBeNull();
  });
});

describe("CalendarEngine — getTefilahRules", () => {
  it("mashiv haruach in winter (Cheshvan)", () => {
    // Nov 15, 2023 = 2 Kislev 5784
    const result = engine.getTefilahRules(new Date(2023, 10, 15));
    expect(result.mashivHaruach).toBe(true);
    expect(result.moridHatal).toBe(false);
  });

  it("no mashiv haruach in summer (Sivan)", () => {
    // Jun 15, 2024 = 9 Sivan 5784
    const result = engine.getTefilahRules(new Date(2024, 5, 15));
    expect(result.mashivHaruach).toBe(false);
    expect(result.moridHatal).toBe(true);
  });

  it("vesein tal umatar in Israel from 7 Cheshvan", () => {
    // Oct 22, 2023 = 7 Cheshvan 5784
    const result = engine.getTefilahRules(new Date(2023, 9, 22));
    expect(result.veseinTalUmatar).toBe(true);
  });

  it("no tachanun on Shabbos", () => {
    const result = engine.getTefilahRules(new Date(2023, 9, 14)); // Shabbos
    expect(result.tachanun).toBe(false);
    expect(result.isShabbos).toBe(true);
  });

  it("full hallel on Chanukah", () => {
    const result = engine.getTefilahRules(new Date(2023, 11, 8)); // 25 Kislev
    expect(result.hallel).toBe("full");
  });

  it("sefirah count during omer", () => {
    const result = engine.getTefilahRules(new Date(2024, 3, 24)); // 16 Nissan
    expect(result.sefirahCount).toBe(1);
  });
});

describe("CalendarEngine — getAllInfo", () => {
  it("returns all sections in one call", () => {
    const result = engine.getAllInfo(new Date(2024, 0, 15));
    expect(result.date).toBeDefined();
    expect(result.parsha).toBeDefined();
    expect(result.dafYomi).toBeDefined();
    expect(result.holiday).toBeDefined();
    expect(result.tefilah).toBeDefined();
    // omer can be null
  });
});

describe("CalendarEngine — diaspora differences", () => {
  it("diaspora: vesein tal umatar from Dec 5 (year before Gregorian leap)", () => {
    const diaspora = new CalendarEngine(false);
    // 2024 is a Gregorian leap year, so 2023's start is Dec 5
    const result = diaspora.getTefilahRules(new Date(2023, 11, 5)); // Dec 5, 2023
    expect(result.veseinTalUmatar).toBe(true);
  });

  it("diaspora: no vesein tal umatar before Dec 4", () => {
    const diaspora = new CalendarEngine(false);
    const result = diaspora.getTefilahRules(new Date(2023, 10, 30)); // Nov 30
    expect(result.veseinTalUmatar).toBe(false);
  });
});
