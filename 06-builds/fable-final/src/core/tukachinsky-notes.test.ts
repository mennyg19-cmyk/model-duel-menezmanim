import { describe, it, expect } from "vitest";
import {
  TUKACHINSKY_NOTES,
  getNotesForDate,
  getNotesForPeriod,
} from "./tukachinsky-notes";

describe("TUKACHINSKY_NOTES", () => {
  it("has at least 50 entries (the curated baseline)", () => {
    expect(TUKACHINSKY_NOTES.length).toBeGreaterThanOrEqual(50);
  });

  it("every entry has required fields and a valid category", () => {
    const validCategories = ["minhag", "tefillah", "halacha", "seasonal"];
    for (const note of TUKACHINSKY_NOTES) {
      expect(note.hebrewMonth).toBeGreaterThanOrEqual(1);
      expect(note.hebrewMonth).toBeLessThanOrEqual(13);
      expect(note.hebrewDay).toBeGreaterThanOrEqual(1);
      expect(note.hebrewDay).toBeLessThanOrEqual(30);
      expect(validCategories).toContain(note.category);
      expect(note.noteHebrew.length).toBeGreaterThan(0);
      expect(note.noteEnglish.length).toBeGreaterThan(0);
    }
  });
});

describe("getNotesForDate", () => {
  it("returns multiple notes for Rosh Hashana (7/1)", () => {
    const notes = getNotesForDate(7, 1);
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes.every((n) => n.hebrewMonth === 7 && n.hebrewDay === 1)).toBe(
      true,
    );
  });

  it("returns empty for a date with no notes", () => {
    const notes = getNotesForDate(8, 15);
    expect(notes).toHaveLength(0);
  });

  it("finds Yom Kippur notes on 7/10", () => {
    const notes = getNotesForDate(7, 10);
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes.some((n) => n.noteEnglish.includes("Yom Kippur"))).toBe(true);
  });
});

describe("getNotesForPeriod", () => {
  it("returns notes within a normal (non-wrapping) range", () => {
    const notes = getNotesForPeriod(9, 1, 9, 30);
    expect(notes.length).toBeGreaterThanOrEqual(3);
    expect(notes.every((n) => n.hebrewMonth === 9)).toBe(true);
  });

  it("handles wrap-around range (Elul -> Cheshvan)", () => {
    const notes = getNotesForPeriod(6, 25, 8, 7);
    expect(notes.length).toBeGreaterThanOrEqual(4);
    const months = new Set(notes.map((n) => n.hebrewMonth));
    expect(months.has(6) || months.has(7) || months.has(8)).toBe(true);
  });
});
