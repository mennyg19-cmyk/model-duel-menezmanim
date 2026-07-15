// === What's in this file ===
// The curated daily notes from Luach Eretz Yisrael (Tukachinsky), covering
// holidays, fast days, tefillah changes, seasonal customs, and Jerusalem
// minhagim. These are the SEED SOURCE for the D16 TukachinskyNote table — they
// get loaded into the global baseline once, and from then on the database is
// the live source of truth. They live here in code so we can seed a fresh DB
// deterministically.
//
// TukachinskyNote      -- shape of one note (Hebrew date, category, bilingual text).
// TUKACHINSKY_NOTES    -- the full ~65-entry array, organized by Hebrew month.
// getNotesForDate()    -- filter the constant array by exact Hebrew month+day.
// getNotesForPeriod()  -- filter by a range of Hebrew dates (with wrap-around).

export interface TukachinskyNote {
  hebrewMonth: number; // 1=Nissan … 7=Tishrei … 12=Adar (13=Adar II in leap year)
  hebrewDay: number;
  category: "minhag" | "tefillah" | "halacha" | "seasonal";
  noteHebrew: string;
  noteEnglish: string;
  source?: string;
}

export const TUKACHINSKY_NOTES: TukachinskyNote[] = [
  // ── Tishrei (7) ──────────────────────────────────────────────
  {
    hebrewMonth: 7,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew: "\u05E8\u05D0\u05E9 \u05D4\u05E9\u05E0\u05D4 \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF \u05DE\u05E8\u05F4\u05D4 \u05E2\u05D3 \u05D0\u05D7\u05E8\u05D9 \u05D9\u05D5\u05F4\u05DB",
    noteEnglish:
      "Rosh Hashana \u2014 No Tachanun from Rosh Hashana through after Yom Kippur",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05EA\u05E9\u05E8\u05D9",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 1,
    category: "minhag",
    noteHebrew:
      "\u05EA\u05E7\u05D9\u05E2\u05EA \u05E9\u05D5\u05E4\u05E8 \u2014 \u05DE\u05D0\u05D4 \u05E7\u05D5\u05DC\u05D5\u05EA. \u05DE\u05E0\u05D4\u05D2 \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD: \u05EA\u05D5\u05E7\u05E2\u05D9\u05DD \u05D2\u05DD \u05D1\u05D9\u05E9\u05D9\u05D1\u05D4",
    noteEnglish:
      "Shofar blowing \u2014 100 blasts. Jerusalem custom: blow also while seated",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D4\u05DC\u05F3 \u05E8\u05F4\u05D4",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 2,
    category: "minhag",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D4\u05E9\u05E0\u05D4 \u05D9\u05D5\u05DD \u05E9\u05E0\u05D9 \u2014 \u05E4\u05E8\u05D9 \u05D7\u05D3\u05E9 \u05DC\u05E9\u05D4\u05D7\u05D9\u05D9\u05E0\u05D5 \u05D1\u05DC\u05D9\u05DC\u05D4",
    noteEnglish:
      "Rosh Hashana second day \u2014 new fruit for Shehecheyanu at night",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05F3 \u05E1\u05F4\u05D0",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 3,
    category: "halacha",
    noteHebrew:
      "\u05E6\u05D5\u05DD \u05D2\u05D3\u05DC\u05D9\u05D4 \u2014 \u05EA\u05E2\u05E0\u05D9\u05EA \u05E6\u05D9\u05D1\u05D5\u05E8",
    noteEnglish: "Fast of Gedaliah \u2014 public fast day",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05DE\u05F4\u05D8",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 10,
    category: "tefillah",
    noteHebrew:
      "\u05D9\u05D5\u05DD \u05DB\u05D9\u05E4\u05D5\u05E8 \u2014 \u05DB\u05DC \u05E0\u05D3\u05E8\u05D9, \u05D7\u05DE\u05E9 \u05EA\u05E4\u05D9\u05DC\u05D5\u05EA, \u05E0\u05E2\u05D9\u05DC\u05D4",
    noteEnglish:
      "Yom Kippur \u2014 Kol Nidrei, five tefillos, Neilah",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D9\u05D5\u05F4\u05DB",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 10,
    category: "halacha",
    noteHebrew:
      "\u05D7\u05DE\u05D9\u05E9\u05D4 \u05E2\u05D9\u05E0\u05D5\u05D9\u05D9\u05DD: \u05D0\u05DB\u05D9\u05DC\u05D4, \u05E9\u05EA\u05D9\u05D4, \u05E8\u05D7\u05D9\u05E6\u05D4, \u05E1\u05D9\u05DB\u05D4, \u05E0\u05E2\u05D9\u05DC\u05EA \u05D4\u05E1\u05E0\u05D3\u05DC",
    noteEnglish:
      "Five afflictions: eating, drinking, washing, anointing, leather shoes",
    source: "\u05D9\u05D5\u05DE\u05D0 \u05E2\u05D2:",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 15,
    category: "tefillah",
    noteHebrew:
      "\u05E1\u05D5\u05DB\u05D5\u05EA \u2014 \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD, \u05D4\u05D5\u05E9\u05E2\u05E0\u05D5\u05EA, \u05E0\u05D9\u05E1\u05D5\u05DA \u05D4\u05DE\u05D9\u05DD",
    noteEnglish:
      "Sukkos \u2014 Full Hallel, Hoshanot, water libation",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E1\u05D5\u05DB\u05D5\u05EA",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 15,
    category: "minhag",
    noteHebrew:
      "\u05E0\u05D5\u05D4\u05D2\u05D9\u05DD \u05DC\u05D9\u05E9\u05D5\u05DF \u05D1\u05E1\u05D5\u05DB\u05D4 \u05D1\u05D0\u05F4\u05D9. \u05D0\u05D5\u05E9\u05E4\u05D9\u05D6\u05D9\u05DF: \u05D0\u05D1\u05E8\u05D4\u05DD \u05D0\u05D1\u05D9\u05E0\u05D5",
    noteEnglish:
      "Custom to sleep in sukkah in Eretz Yisrael. Ushpizin: Avraham Avinu",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 21,
    category: "tefillah",
    noteHebrew:
      "\u05D4\u05D5\u05E9\u05E2\u05E0\u05D0 \u05E8\u05D1\u05D4 \u2014 \u05E9\u05D1\u05E2 \u05D4\u05E7\u05E4\u05D5\u05EA, \u05D7\u05D9\u05D1\u05D5\u05D8 \u05E2\u05E8\u05D1\u05D4",
    noteEnglish:
      "Hoshana Rabbah \u2014 seven hakafot, beating the aravah",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E1\u05F4\u05D3",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 22,
    category: "tefillah",
    noteHebrew:
      "\u05E9\u05DE\u05D9\u05E0\u05D9 \u05E2\u05E6\u05E8\u05EA \u2014 \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DE\u05E9\u05D9\u05D1 \u05D4\u05E8\u05D5\u05D7 \u05D5\u05DE\u05D5\u05E8\u05D9\u05D3 \u05D4\u05D2\u05E9\u05DD \u05D1\u05DE\u05D5\u05E1\u05E3",
    noteEnglish:
      "Shmini Atzeres \u2014 Begin Mashiv HaRuach U'Morid HaGeshem at Mussaf",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E9\u05DE\u05E2\u05F4\u05E6",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 22,
    category: "tefillah",
    noteHebrew:
      "\u05EA\u05E4\u05D9\u05DC\u05EA \u05D2\u05E9\u05DD \u2014 \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05E4\u05D9\u05DC\u05EA \u05D2\u05E9\u05DD \u05D1\u05DE\u05D5\u05E1\u05E3",
    noteEnglish:
      "Tefillas Geshem \u2014 recite the prayer for rain at Mussaf",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05E7\u05D9\u05F4\u05D3",
  },
  {
    hebrewMonth: 7,
    hebrewDay: 22,
    category: "minhag",
    noteHebrew:
      "\u05E9\u05DE\u05D7\u05EA \u05EA\u05D5\u05E8\u05D4 \u05D1\u05D0\u05F4\u05D9 \u2014 \u05D4\u05E7\u05E4\u05D5\u05EA \u05D5\u05E1\u05D9\u05D5\u05DD \u05D4\u05EA\u05D5\u05E8\u05D4",
    noteEnglish:
      "Simchas Torah in Eretz Yisrael \u2014 Hakafot and completion of the Torah",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9",
  },

  // ── Cheshvan (8) ──────────────────────────────────────────────
  {
    hebrewMonth: 8,
    hebrewDay: 7,
    category: "tefillah",
    noteHebrew:
      "\u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05F4\u05D5\u05EA\u05DF \u05D8\u05DC \u05D5\u05DE\u05D8\u05E8 \u05DC\u05D1\u05E8\u05DB\u05D4\u05F4 \u05D1\u05E2\u05E8\u05D1\u05D9\u05EA (\u05D1\u05D0\u05F4\u05D9)",
    noteEnglish:
      "Begin reciting V'sein Tal U'Matar in Maariv (in Eretz Yisrael)",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05E7\u05D9\u05F4\u05D6",
  },
  {
    hebrewMonth: 8,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D7\u05E9\u05D5\u05DF \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Cheshvan \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },

  // ── Kislev (9) ──────────────────────────────────────────────
  {
    hebrewMonth: 9,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05DB\u05E1\u05DC\u05D5 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Kislev \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 9,
    hebrewDay: 25,
    category: "tefillah",
    noteHebrew:
      "\u05D7\u05E0\u05D5\u05DB\u05D4 \u2014 \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD, \u05E2\u05DC \u05D4\u05E0\u05E1\u05D9\u05DD, \u05D4\u05D3\u05DC\u05E7\u05EA \u05E0\u05E8\u05D5\u05EA",
    noteEnglish:
      "Chanukah \u2014 Full Hallel, Al HaNissim, candle lighting",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05F4\u05E2\u2014\u05EA\u05E8\u05E4\u05F4\u05D1",
  },
  {
    hebrewMonth: 9,
    hebrewDay: 25,
    category: "minhag",
    noteHebrew:
      "\u05DE\u05E0\u05D4\u05D2 \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD: \u05DE\u05D3\u05DC\u05D9\u05E7\u05D9\u05DD \u05D1\u05E4\u05EA\u05D7 \u05D4\u05D1\u05D9\u05EA \u05DE\u05D1\u05D7\u05D5\u05E5",
    noteEnglish:
      "Jerusalem custom: light at the doorway outside the home",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D7\u05E0\u05D5\u05DB\u05D4",
  },
  {
    hebrewMonth: 9,
    hebrewDay: 25,
    category: "halacha",
    noteHebrew:
      "\u05D0\u05D9\u05DF \u05EA\u05D7\u05E0\u05D5\u05DF \u05DB\u05DC \u05D9\u05DE\u05D9 \u05D7\u05E0\u05D5\u05DB\u05D4 (\u05DB\u05F4\u05D4 \u05DB\u05E1\u05DC\u05D5 \u2014 \u05D1\u05F3 \u05D8\u05D1\u05EA)",
    noteEnglish:
      "No Tachanun throughout Chanukah (25 Kislev \u2014 2 Teves)",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E4\u05F4\u05D2",
  },

  // ── Teves (10) ──────────────────────────────────────────────
  {
    hebrewMonth: 10,
    hebrewDay: 2,
    category: "tefillah",
    noteHebrew:
      "\u05D9\u05D5\u05DD \u05D0\u05D7\u05E8\u05D5\u05DF \u05E9\u05DC \u05D7\u05E0\u05D5\u05DB\u05D4 \u2014 \u05D6\u05D0\u05EA \u05D7\u05E0\u05D5\u05DB\u05D4. \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD",
    noteEnglish:
      "Last day of Chanukah \u2014 Zos Chanukah. Full Hallel",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9",
  },
  {
    hebrewMonth: 10,
    hebrewDay: 10,
    category: "halacha",
    noteHebrew:
      "\u05E2\u05E9\u05E8\u05D4 \u05D1\u05D8\u05D1\u05EA \u2014 \u05EA\u05E2\u05E0\u05D9\u05EA \u05E6\u05D9\u05D1\u05D5\u05E8, \u05E6\u05D5\u05DD \u05E2\u05DC \u05DE\u05E6\u05D5\u05E8 \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD",
    noteEnglish:
      "Tenth of Teves \u2014 public fast, commemorating siege of Jerusalem",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05F4\u05E0",
  },

  // ── Shevat (11) ──────────────────────────────────────────────
  {
    hebrewMonth: 11,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05E9\u05D1\u05D8 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Shevat \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 11,
    hebrewDay: 15,
    category: "minhag",
    noteHebrew:
      "\u05D8\u05F4\u05D5 \u05D1\u05E9\u05D1\u05D8 \u2014 \u05E8\u05D0\u05E9 \u05D4\u05E9\u05E0\u05D4 \u05DC\u05D0\u05D9\u05DC\u05E0\u05D5\u05EA. \u05D0\u05D5\u05DB\u05DC\u05D9\u05DD \u05E4\u05D9\u05E8\u05D5\u05EA \u05D0\u05F4\u05D9",
    noteEnglish:
      "Tu B'Shvat \u2014 New Year for trees. Eat fruits of Eretz Yisrael",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E9\u05D1\u05D8",
  },
  {
    hebrewMonth: 11,
    hebrewDay: 15,
    category: "tefillah",
    noteHebrew:
      "\u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF \u05D1\u05D8\u05F4\u05D5 \u05D1\u05E9\u05D1\u05D8",
    noteEnglish: "No Tachanun on Tu B'Shvat",
    source:
      "\u05DE\u05E9\u05E0\u05F4\u05D1 \u05EA\u05E7\u05E2\u05F4\u05D1",
  },

  // ── Adar (12) ──────────────────────────────────────────────
  {
    hebrewMonth: 12,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05D3\u05E8 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC. \u05DE\u05E9\u05E0\u05DB\u05E0\u05E1 \u05D0\u05D3\u05E8 \u05DE\u05E8\u05D1\u05D9\u05DF \u05D1\u05E9\u05DE\u05D7\u05D4",
    noteEnglish:
      "Rosh Chodesh Adar \u2014 Ya'aleh V'Yavo, Half Hallel. Increase joy in Adar",
    source: "\u05EA\u05E2\u05E0\u05D9\u05EA \u05DB\u05D8.",
  },
  {
    hebrewMonth: 12,
    hebrewDay: 13,
    category: "halacha",
    noteHebrew:
      "\u05EA\u05E2\u05E0\u05D9\u05EA \u05D0\u05E1\u05EA\u05E8 \u2014 \u05EA\u05E2\u05E0\u05D9\u05EA \u05E6\u05D9\u05D1\u05D5\u05E8 \u05DC\u05E4\u05E0\u05D9 \u05E4\u05D5\u05E8\u05D9\u05DD",
    noteEnglish:
      "Fast of Esther \u2014 public fast before Purim",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E4\u05F4\u05D5",
  },
  {
    hebrewMonth: 12,
    hebrewDay: 14,
    category: "tefillah",
    noteHebrew:
      "\u05E4\u05D5\u05E8\u05D9\u05DD \u2014 \u05DE\u05D2\u05D9\u05DC\u05D4, \u05E2\u05DC \u05D4\u05E0\u05E1\u05D9\u05DD, \u05DE\u05E9\u05DC\u05D5\u05D7 \u05DE\u05E0\u05D5\u05EA \u05D5\u05DE\u05EA\u05E0\u05D5\u05EA \u05DC\u05D0\u05D1\u05D9\u05D5\u05E0\u05D9\u05DD",
    noteEnglish:
      "Purim \u2014 Megillah, Al HaNissim, Mishloach Manos, Matanos La'evyonim",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E6\u05F4\u05D2\u2014\u05EA\u05E8\u05E6\u05F4\u05D3",
  },
  {
    hebrewMonth: 12,
    hebrewDay: 14,
    category: "minhag",
    noteHebrew:
      "\u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF \u05D1\u05D9\u05F4\u05D3 \u05D5\u05D8\u05F4\u05D5 \u05D0\u05D3\u05E8",
    noteEnglish: "No Tachanun on 14th and 15th of Adar",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E6\u05F4\u05D6",
  },
  {
    hebrewMonth: 12,
    hebrewDay: 15,
    category: "minhag",
    noteHebrew:
      "\u05E9\u05D5\u05E9\u05DF \u05E4\u05D5\u05E8\u05D9\u05DD \u2014 \u05E4\u05D5\u05E8\u05D9\u05DD \u05D1\u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD \u05D4\u05DE\u05D5\u05E7\u05E4\u05EA \u05D7\u05D5\u05DE\u05D4",
    noteEnglish:
      "Shushan Purim \u2014 Purim in walled cities (Jerusalem)",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E8\u05E4\u05F4\u05D7",
  },

  // ── Nissan (1) ──────────────────────────────────────────────
  {
    hebrewMonth: 1,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05E0\u05D9\u05E1\u05DF \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF \u05DB\u05DC \u05D7\u05D5\u05D3\u05E9 \u05E0\u05D9\u05E1\u05DF",
    noteEnglish:
      "Rosh Chodesh Nissan \u2014 No Tachanun the entire month of Nissan",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D8",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 14,
    category: "halacha",
    noteHebrew:
      "\u05E2\u05E8\u05D1 \u05E4\u05E1\u05D7 \u2014 \u05D1\u05D3\u05D9\u05E7\u05EA \u05D7\u05DE\u05E5 (\u05D1\u05DC\u05D9\u05DC \u05D9\u05F4\u05D3), \u05D1\u05D9\u05E2\u05D5\u05E8 \u05D7\u05DE\u05E5, \u05EA\u05E2\u05E0\u05D9\u05EA \u05D1\u05DB\u05D5\u05E8\u05D5\u05EA",
    noteEnglish:
      "Erev Pesach \u2014 Bedikas Chametz (night of 14th), burning chametz, fast of firstborn",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DC\u05F4\u05D0, \u05EA\u05E2\u05F4\u05D1",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 15,
    category: "tefillah",
    noteHebrew:
      "\u05E4\u05E1\u05D7 \u2014 \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD (\u05DC\u05D9\u05DC\u05D4 \u05E8\u05D0\u05E9\u05D5\u05DF \u05D5\u05D1\u05D9\u05D5\u05DD), \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0",
    noteEnglish:
      "Pesach \u2014 Full Hallel (first night and day), Ya'aleh V'Yavo",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E4\u05F4\u05D6",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 15,
    category: "tefillah",
    noteHebrew:
      "\u05DE\u05E4\u05E1\u05D9\u05E7\u05D9\u05DD \u05F4\u05D5\u05EA\u05DF \u05D8\u05DC \u05D5\u05DE\u05D8\u05E8\u05F4 \u2014 \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05F4\u05D5\u05EA\u05DF \u05D1\u05E8\u05DB\u05D4\u05F4",
    noteEnglish:
      "Stop reciting V'sein Tal U'Matar \u2014 say V'sein Beracha",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05E7\u05D9\u05F4\u05D6",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 15,
    category: "tefillah",
    noteHebrew:
      "\u05EA\u05E4\u05D9\u05DC\u05EA \u05D8\u05DC \u2014 \u05D1\u05DE\u05D5\u05E1\u05E3 \u05E8\u05D0\u05E9\u05D5\u05DF \u05E9\u05DC \u05E4\u05E1\u05D7. \u05DE\u05E4\u05E1\u05D9\u05E7\u05D9\u05DD \u05DE\u05E9\u05D9\u05D1 \u05D4\u05E8\u05D5\u05D7, \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DE\u05D5\u05E8\u05D9\u05D3 \u05D4\u05D8\u05DC",
    noteEnglish:
      "Tefillas Tal \u2014 at first Mussaf of Pesach. Stop Mashiv HaRuach, begin Morid HaTal",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E4\u05E1\u05D7",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 16,
    category: "tefillah",
    noteHebrew:
      "\u05D7\u05D5\u05DC \u05D4\u05DE\u05D5\u05E2\u05D3 \u05E4\u05E1\u05D7 \u2014 \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC, \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0",
    noteEnglish:
      "Chol HaMoed Pesach \u2014 Half Hallel, Ya'aleh V'Yavo",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E6\u05F4 \u05E1\u05F4\u05D3",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 16,
    category: "seasonal",
    noteHebrew:
      "\u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05E1\u05E4\u05D9\u05E8\u05EA \u05D4\u05E2\u05D5\u05DE\u05E8 \u05DE\u05DC\u05D9\u05DC \u05D8\u05F4\u05D6 \u05E0\u05D9\u05E1\u05DF",
    noteEnglish:
      "Begin counting Sefiras HaOmer from the night of 16 Nissan",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E4\u05F4\u05D8",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 21,
    category: "tefillah",
    noteHebrew:
      "\u05E9\u05D1\u05D9\u05E2\u05D9 \u05E9\u05DC \u05E4\u05E1\u05D7 \u2014 \u05E9\u05D9\u05E8\u05EA \u05D4\u05D9\u05DD. \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD \u05D1\u05D0\u05F4\u05D9",
    noteEnglish:
      "Seventh day of Pesach \u2014 Shiras HaYam. Full Hallel in Eretz Yisrael",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9",
  },

  // ── Iyar (2) ──────────────────────────────────────────────
  {
    hebrewMonth: 2,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05D9\u05D9\u05E8 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Iyar \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 2,
    hebrewDay: 14,
    category: "halacha",
    noteHebrew:
      "\u05E4\u05E1\u05D7 \u05E9\u05E0\u05D9 \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF",
    noteEnglish: "Pesach Sheini \u2014 No Tachanun",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D0\u05D9\u05D9\u05E8",
  },
  {
    hebrewMonth: 2,
    hebrewDay: 18,
    category: "minhag",
    noteHebrew:
      "\u05DC\u05F4\u05D2 \u05D1\u05E2\u05D5\u05DE\u05E8 \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF. \u05DE\u05D5\u05EA\u05E8 \u05DC\u05D4\u05E1\u05EA\u05E4\u05E8 \u05D5\u05DC\u05E9\u05DE\u05D5\u05E2 \u05DE\u05D5\u05D6\u05D9\u05E7\u05D4",
    noteEnglish:
      "Lag B'Omer \u2014 No Tachanun. Haircuts and music permitted",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E6\u05F4\u05D2",
  },
  {
    hebrewMonth: 2,
    hebrewDay: 18,
    category: "minhag",
    noteHebrew:
      "\u05DE\u05E0\u05D4\u05D2 \u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD: \u05E2\u05D5\u05DC\u05D9\u05DD \u05DC\u05E7\u05D1\u05E8 \u05E8\u05E9\u05D1\u05F4\u05D9 \u05D1\u05DE\u05D9\u05E8\u05D5\u05DF",
    noteEnglish:
      "Jerusalem custom: pilgrimage to the grave of Rashbi in Meron",
    source: "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9",
  },

  // ── Sivan (3) ──────────────────────────────────────────────
  {
    hebrewMonth: 3,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05E1\u05D9\u05D5\u05DF \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Sivan \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 3,
    hebrewDay: 6,
    category: "tefillah",
    noteHebrew:
      "\u05E9\u05D1\u05D5\u05E2\u05D5\u05EA \u2014 \u05D7\u05D2 \u05DE\u05EA\u05DF \u05EA\u05D5\u05E8\u05EA\u05E0\u05D5. \u05D4\u05DC\u05DC \u05E9\u05DC\u05DD, \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D0\u05E7\u05D3\u05DE\u05D5\u05EA",
    noteEnglish:
      "Shavuos \u2014 Festival of the Giving of the Torah. Full Hallel, Ya'aleh V'Yavo, Akdamus",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E6\u05F4\u05D3",
  },
  {
    hebrewMonth: 3,
    hebrewDay: 6,
    category: "minhag",
    noteHebrew:
      "\u05DE\u05E0\u05D4\u05D2 \u05D0\u05DB\u05D9\u05DC\u05EA \u05DE\u05D0\u05DB\u05DC\u05D9 \u05D7\u05DC\u05D1 \u05D1\u05E9\u05D1\u05D5\u05E2\u05D5\u05EA. \u05EA\u05D9\u05E7\u05D5\u05DF \u05DC\u05D9\u05DC \u05E9\u05D1\u05D5\u05E2\u05D5\u05EA",
    noteEnglish:
      "Custom of eating dairy on Shavuos. All-night Torah study (Tikkun)",
    source:
      "\u05E8\u05DE\u05F4\u05D0 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E6\u05F4\u05D3",
  },
  {
    hebrewMonth: 3,
    hebrewDay: 6,
    category: "tefillah",
    noteHebrew:
      "\u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF \u05DE\u05E8\u05F4\u05D7 \u05E1\u05D9\u05D5\u05DF \u05E2\u05D3 \u05D9\u05F4\u05D1 \u05E1\u05D9\u05D5\u05DF (\u05E9\u05D1\u05E2\u05EA \u05D9\u05DE\u05D9 \u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DF)",
    noteEnglish:
      "No Tachanun from Rosh Chodesh Sivan through 12 Sivan (Tashlumim days)",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E1\u05D9\u05D5\u05DF",
  },

  // ── Tammuz (4) ──────────────────────────────────────────────
  {
    hebrewMonth: 4,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05EA\u05DE\u05D5\u05D6 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Tammuz \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 4,
    hebrewDay: 17,
    category: "halacha",
    noteHebrew:
      "\u05E9\u05D1\u05E2\u05D4 \u05E2\u05E9\u05E8 \u05D1\u05EA\u05DE\u05D5\u05D6 \u2014 \u05EA\u05E2\u05E0\u05D9\u05EA \u05E6\u05D9\u05D1\u05D5\u05E8. \u05EA\u05D7\u05D9\u05DC\u05EA \u05D9\u05DE\u05D9 \u05D1\u05D9\u05DF \u05D4\u05DE\u05E6\u05E8\u05D9\u05DD",
    noteEnglish:
      "17th of Tammuz \u2014 public fast. Beginning of the Three Weeks",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05DE\u05F4\u05D8",
  },
  {
    hebrewMonth: 4,
    hebrewDay: 17,
    category: "seasonal",
    noteHebrew:
      "\u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05D9\u05DE\u05D9 \u05D1\u05D9\u05DF \u05D4\u05DE\u05E6\u05E8\u05D9\u05DD \u2014 \u05D0\u05D9\u05DF \u05E9\u05D5\u05DE\u05E2\u05D9\u05DD \u05DE\u05D5\u05D6\u05D9\u05E7\u05D4, \u05D0\u05D9\u05DF \u05E0\u05D5\u05E9\u05D0\u05D9\u05DD \u05E0\u05E9\u05D9\u05DD",
    noteEnglish:
      "Three Weeks begin \u2014 no music, no weddings",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E0\u05F4\u05D0",
  },

  // ── Av (5) ──────────────────────────────────────────────
  {
    hebrewMonth: 5,
    hebrewDay: 1,
    category: "seasonal",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05D1 \u2014 \u05EA\u05D7\u05D9\u05DC\u05EA \u05EA\u05E9\u05E2\u05EA \u05D4\u05D9\u05DE\u05D9\u05DD. \u05DE\u05DE\u05E2\u05D8\u05D9\u05DD \u05D1\u05E9\u05DE\u05D7\u05D4",
    noteEnglish:
      "Rosh Chodesh Av \u2014 beginning of the Nine Days. Decrease joy",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E0\u05F4\u05D0",
  },
  {
    hebrewMonth: 5,
    hebrewDay: 1,
    category: "halacha",
    noteHebrew:
      "\u05EA\u05E9\u05E2\u05EA \u05D4\u05D9\u05DE\u05D9\u05DD \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DB\u05DC\u05D9\u05DD \u05D1\u05E9\u05E8 \u05D5\u05D0\u05D9\u05DF \u05E9\u05D5\u05EA\u05D9\u05DD \u05D9\u05D9\u05DF (\u05D7\u05D5\u05E5 \u05DE\u05E9\u05D1\u05EA)",
    noteEnglish:
      "Nine Days \u2014 no meat or wine (except Shabbos)",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E0\u05F4\u05D0 \u05E1\u05F4\u05D8",
  },
  {
    hebrewMonth: 5,
    hebrewDay: 9,
    category: "halacha",
    noteHebrew:
      "\u05EA\u05E9\u05E2\u05D4 \u05D1\u05D0\u05D1 \u2014 \u05EA\u05E2\u05E0\u05D9\u05EA \u05E6\u05D9\u05D1\u05D5\u05E8. \u05D7\u05DE\u05D9\u05E9\u05D4 \u05E2\u05D9\u05E0\u05D5\u05D9\u05D9\u05DD \u05DB\u05D9\u05D5\u05F4\u05DB",
    noteEnglish:
      "Tisha B'Av \u2014 public fast. Five afflictions like Yom Kippur",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E0\u05F4\u05D1\u2014\u05EA\u05E7\u05E0\u05F4\u05D6",
  },
  {
    hebrewMonth: 5,
    hebrewDay: 9,
    category: "tefillah",
    noteHebrew:
      "\u05E7\u05E8\u05D9\u05D0\u05EA \u05E7\u05D9\u05E0\u05D5\u05EA. \u05D0\u05D9\u05DF \u05DE\u05E0\u05D9\u05D7\u05D9\u05DD \u05EA\u05E4\u05D9\u05DC\u05D9\u05DF \u05D1\u05E9\u05D7\u05E8\u05D9\u05EA, \u05DE\u05E0\u05D9\u05D7\u05D9\u05DD \u05D1\u05DE\u05E0\u05D7\u05D4",
    noteEnglish:
      "Recite Kinnos. No tefillin at Shacharis; put on at Mincha",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E0\u05F4\u05D4",
  },
  {
    hebrewMonth: 5,
    hebrewDay: 15,
    category: "minhag",
    noteHebrew:
      "\u05D8\u05F4\u05D5 \u05D1\u05D0\u05D1 \u2014 \u05D0\u05D9\u05DF \u05D0\u05D5\u05DE\u05E8\u05D9\u05DD \u05EA\u05D7\u05E0\u05D5\u05DF. \u05D9\u05D5\u05DD \u05E9\u05DE\u05D7\u05D4",
    noteEnglish: "Tu B'Av \u2014 No Tachanun. Day of joy",
    source: "\u05EA\u05E2\u05E0\u05D9\u05EA \u05DC:",
  },

  // ── Elul (6) ──────────────────────────────────────────────
  {
    hebrewMonth: 6,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05DC\u05D5\u05DC \u2014 \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DC\u05EA\u05E7\u05D5\u05E2 \u05E9\u05D5\u05E4\u05E8 \u05D1\u05E9\u05D7\u05E8\u05D9\u05EA",
    noteEnglish:
      "Rosh Chodesh Elul \u2014 begin blowing shofar at Shacharis",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E4\u05F4\u05D0",
  },
  {
    hebrewMonth: 6,
    hebrewDay: 1,
    category: "minhag",
    noteHebrew:
      "\u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DC\u05D5\u05DE\u05E8 \u05DC\u05F4\u05D3 \u05DE\u05D6\u05DE\u05D5\u05E8 \u05F4\u05DC\u05D3\u05D5\u05D3 \u05D4\u05F3 \u05D0\u05D5\u05E8\u05D9\u05F4 \u05E2\u05D3 \u05D4\u05D5\u05E9\u05E2\u05E0\u05D0 \u05E8\u05D1\u05D4",
    noteEnglish:
      "Begin reciting Psalm 27 \"L'Dovid Hashem Ori\" until Hoshana Rabbah",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D0\u05DC\u05D5\u05DC",
  },
  {
    hebrewMonth: 6,
    hebrewDay: 25,
    category: "seasonal",
    noteHebrew:
      "\u05E1\u05DC\u05D9\u05D7\u05D5\u05EA \u2014 \u05DE\u05E0\u05D4\u05D2 \u05E1\u05E4\u05E8\u05D3/\u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD: \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05E1\u05DC\u05D9\u05D7\u05D5\u05EA \u05DE\u05E8\u05F4\u05D7 \u05D0\u05DC\u05D5\u05DC",
    noteEnglish:
      "Selichos \u2014 Sefardi/Jerusalem custom: Selichos from Rosh Chodesh Elul",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05D0\u05DC\u05D5\u05DC",
  },
  {
    hebrewMonth: 6,
    hebrewDay: 29,
    category: "tefillah",
    noteHebrew:
      "\u05E2\u05E8\u05D1 \u05E8\u05D0\u05E9 \u05D4\u05E9\u05E0\u05D4 \u2014 \u05E1\u05DC\u05D9\u05D7\u05D5\u05EA \u05DE\u05D9\u05D5\u05D7\u05D3\u05D5\u05EA. \u05D0\u05D9\u05DF \u05EA\u05D5\u05E7\u05E2\u05D9\u05DD \u05E9\u05D5\u05E4\u05E8",
    noteEnglish:
      "Erev Rosh Hashana \u2014 special Selichos. No shofar blowing",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E7\u05E4\u05F4\u05D0",
  },

  // ── Sefira period notes (cross-month) ──────────────────────
  {
    hebrewMonth: 1,
    hebrewDay: 17,
    category: "seasonal",
    noteHebrew:
      "\u05D9\u05DE\u05D9 \u05E1\u05E4\u05D9\u05E8\u05EA \u05D4\u05E2\u05D5\u05DE\u05E8 \u2014 \u05DE\u05E0\u05D4\u05D2\u05D9 \u05D0\u05D1\u05DC\u05D5\u05EA: \u05D0\u05D9\u05DF \u05EA\u05E1\u05E4\u05D5\u05E8\u05EA, \u05D0\u05D9\u05DF \u05E0\u05D9\u05E9\u05D5\u05D0\u05D9\u05DF",
    noteEnglish:
      "Sefira period \u2014 mourning customs: no haircuts, no weddings",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05E6\u05F4\u05D2",
  },

  // ── Additional Shabbos notes ───────────────────────────────
  {
    hebrewMonth: 7,
    hebrewDay: 15,
    category: "seasonal",
    noteHebrew:
      "\u05E9\u05D1\u05EA \u05D7\u05D5\u05DC \u05D4\u05DE\u05D5\u05E2\u05D3 \u05E1\u05D5\u05DB\u05D5\u05EA \u2014 \u05E7\u05D5\u05E8\u05D0\u05D9\u05DD \u05E7\u05D4\u05DC\u05EA",
    noteEnglish:
      "Shabbos Chol HaMoed Sukkos \u2014 read Koheles (Ecclesiastes)",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E1\u05D5\u05DB\u05D5\u05EA",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 15,
    category: "seasonal",
    noteHebrew:
      "\u05E9\u05D1\u05EA \u05D7\u05D5\u05DC \u05D4\u05DE\u05D5\u05E2\u05D3 \u05E4\u05E1\u05D7 \u2014 \u05E7\u05D5\u05E8\u05D0\u05D9\u05DD \u05E9\u05D9\u05E8 \u05D4\u05E9\u05D9\u05E8\u05D9\u05DD",
    noteEnglish:
      "Shabbos Chol HaMoed Pesach \u2014 read Shir HaShirim (Song of Songs)",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E4\u05E1\u05D7",
  },
  {
    hebrewMonth: 3,
    hebrewDay: 6,
    category: "seasonal",
    noteHebrew:
      "\u05E7\u05D5\u05E8\u05D0\u05D9\u05DD \u05DE\u05D2\u05D9\u05DC\u05EA \u05E8\u05D5\u05EA \u05D1\u05E9\u05D1\u05D5\u05E2\u05D5\u05EA",
    noteEnglish: "Read Megillas Ruth on Shavuos",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05E9\u05D1\u05D5\u05E2\u05D5\u05EA",
  },

  // ── Vesein Tal Umatar for chutz la'aretz ──────────────────
  {
    hebrewMonth: 8,
    hebrewDay: 7,
    category: "seasonal",
    noteHebrew:
      "\u05D1\u05D0\u05F4\u05D9 \u05E9\u05D5\u05D0\u05DC\u05D9\u05DD \u05D8\u05DC \u05D5\u05DE\u05D8\u05E8 \u05DE\u05D6\u05F3 \u05D7\u05E9\u05D5\u05DF. \u05D1\u05D7\u05D5\u05F4\u05DC \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05E1\u05F3 \u05D9\u05D5\u05DD \u05D0\u05D7\u05E8\u05D9 \u05EA\u05E7\u05D5\u05E4\u05EA \u05EA\u05E9\u05E8\u05D9",
    noteEnglish:
      "In Eretz Yisrael ask for rain from 7 Cheshvan. In chutz la'aretz 60 days after Tekufas Tishrei",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05E7\u05D9\u05F4\u05D6",
  },

  // ── Rosh Chodesh general ──────────────────────────────────
  {
    hebrewMonth: 4,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u2014 \u05DE\u05D5\u05E1\u05E3, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC, \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0. \u05D0\u05D9\u05DF \u05EA\u05D7\u05E0\u05D5\u05DF",
    noteEnglish:
      "Rosh Chodesh \u2014 Mussaf, Half Hallel, Ya'aleh V'Yavo. No Tachanun",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },

  // ── Shabbos general notes ─────────────────────────────────
  {
    hebrewMonth: 7,
    hebrewDay: 10,
    category: "seasonal",
    noteHebrew:
      "\u05E9\u05D1\u05EA \u05E9\u05D5\u05D1\u05D4 \u2014 \u05D4\u05E9\u05D1\u05EA \u05E9\u05D1\u05D9\u05DF \u05E8\u05F4\u05D4 \u05DC\u05D9\u05D5\u05F4\u05DB. \u05D3\u05E8\u05E9\u05EA \u05E9\u05D1\u05EA \u05E9\u05D5\u05D1\u05D4",
    noteEnglish:
      "Shabbos Shuva \u2014 Shabbos between Rosh Hashana and Yom Kippur. Special drasha",
    source:
      "\u05DC\u05D5\u05D7 \u05D0\u05F4\u05D9, \u05EA\u05E9\u05E8\u05D9",
  },

  // ── Additional seasonal ───────────────────────────────────
  {
    hebrewMonth: 5,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05D1 \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Av \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 6,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D0\u05DC\u05D5\u05DC \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Elul \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 10,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05D8\u05D1\u05EA \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC. \u05E2\u05D3\u05D9\u05D9\u05DF \u05D1\u05EA\u05D5\u05DA \u05D7\u05E0\u05D5\u05DB\u05D4",
    noteEnglish:
      "Rosh Chodesh Teves \u2014 Ya'aleh V'Yavo, Half Hallel. Still within Chanukah",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
  {
    hebrewMonth: 1,
    hebrewDay: 1,
    category: "tefillah",
    noteHebrew:
      "\u05E8\u05D0\u05E9 \u05D7\u05D5\u05D3\u05E9 \u05E0\u05D9\u05E1\u05DF \u2014 \u05D9\u05E2\u05DC\u05D4 \u05D5\u05D9\u05D1\u05D5\u05D0, \u05D7\u05E6\u05D9 \u05D4\u05DC\u05DC",
    noteEnglish:
      "Rosh Chodesh Nissan \u2014 Ya'aleh V'Yavo, Half Hallel",
    source:
      "\u05E9\u05D5\u05F4\u05E2 \u05D0\u05D5\u05F4\u05D7 \u05EA\u05DB\u05F4\u05D1",
  },
];

export function getNotesForDate(
  month: number,
  day: number,
): TukachinskyNote[] {
  return TUKACHINSKY_NOTES.filter(
    (note) => note.hebrewMonth === month && note.hebrewDay === day,
  );
}

/**
 * Handles wrap-around when startMonth > endMonth (e.g. Elul -> Cheshvan
 * crossing the Adar/Nissan boundary).
 */
export function getNotesForPeriod(
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
): TukachinskyNote[] {
  const wraps =
    startMonth > endMonth ||
    (startMonth === endMonth && startDay > endDay);

  return TUKACHINSKY_NOTES.filter((note) => {
    const m = note.hebrewMonth;
    const d = note.hebrewDay;

    if (wraps) {
      const afterStart =
        m > startMonth || (m === startMonth && d >= startDay);
      const beforeEnd = m < endMonth || (m === endMonth && d <= endDay);
      return afterStart || beforeEnd;
    }

    const afterStart =
      m > startMonth || (m === startMonth && d >= startDay);
    const beforeEnd = m < endMonth || (m === endMonth && d <= endDay);
    return afterStart && beforeEnd;
  });
}
