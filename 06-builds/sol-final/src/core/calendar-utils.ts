import { DateTime } from "luxon";

/** Shared date math for scheduler + style-engine (F-DUP-DATEMATH). */
export function gregorianDayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let m = 1; m < month; m++) {
    total += daysInMonth[m];
  }
  return total + day;
}

/**
 * Linearize a Hebrew month/day into a comparable integer.
 * kosher-zmanim uses 1=Nissan..12=Adar, 13=Adar II.
 * Remap so Tishrei=1 … Elul=12/13 for range comparison.
 */
export function hebrewOrdinal(month: number, day: number): number {
  const ORDER: Record<number, number> = {
    7: 1,
    8: 2,
    9: 3,
    10: 4,
    11: 5,
    12: 6,
    13: 7,
    1: 8,
    2: 9,
    3: 10,
    4: 11,
    5: 12,
    6: 13,
  };
  return (ORDER[month] ?? month) * 100 + day;
}

/** Wall-clock parts in an IANA timezone (F-CORE-TZ). */
export function orgLocalParts(date: Date, timezone: string) {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
    second: dt.second,
    weekday: dt.weekday % 7, // Luxon 1=Mon..7=Sun → JS 0=Sun..6=Sat
    minutesSinceMidnight: dt.hour * 60 + dt.minute,
  };
}

export function isDstInZone(date: Date, timezone: string): boolean {
  return Boolean(DateTime.fromJSDate(date, { zone: timezone }).isInDST);
}
