// === What's in this file ===
// Shared calendar date math used by the scheduler, rules engine, and display
// logic. Pure functions, no framework dependencies.
//
// gregorianDayOfYear()    -- convert month+day into a 1–366 ordinal.
// hebrewOrdinal()         -- linearize a Hebrew date (Tishrei-first order) for comparisons.
// parseTime()             -- parse "HH:MM" into hours + minutes.
// toMinutesSinceMidnight() -- extract total minutes from a Date.
// parseTimeToMins()       -- "HH:MM" → total minutes (returns -1 if invalid).
// isTimeRangeActive()     -- check if a time-of-day is in a range (handles midnight wrap).
// isGregorianRangeActive() -- check if a Gregorian date is in a month/day range.
// isHebrewRangeActive()   -- check if a Hebrew date is in a month/day range.

export function gregorianDayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let m = 1; m < month; m++) {
    total += daysInMonth[m]!;
  }
  return total + day;
}

/**
 * kosher-zmanim uses 1=Nissan..12=Adar, 13=Adar II.
 * The Jewish year starts at Tishrei (month 7). We remap so
 * Tishrei=1, Cheshvan=2, ... Elul=12/13 for ordering comparisons.
 */
export function hebrewOrdinal(month: number, day: number): number {
  const ORDER: Record<number, number> = {
    7: 1, // Tishrei
    8: 2, // Cheshvan
    9: 3, // Kislev
    10: 4, // Teves
    11: 5, // Shevat
    12: 6, // Adar (or Adar I in leap year)
    13: 7, // Adar II
    1: 8, // Nissan
    2: 9, // Iyar
    3: 10, // Sivan
    4: 11, // Tammuz
    5: 12, // Av
    6: 13, // Elul
  };
  return (ORDER[month] ?? month) * 100 + day;
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h ?? 0, minutes: m ?? 0 };
}

export function toMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function parseTimeToMins(s: string): number {
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return -1;
  return parseInt(m[1]!, 10) * 60 + parseInt(m[2]!, 10);
}

export function isTimeRangeActive(
  startTime: string,
  endTime: string,
  date: Date,
): boolean {
  const start = parseTimeToMins(startTime);
  const end = parseTimeToMins(endTime);
  if (start < 0 || end < 0) return false;
  const now = toMinutesSinceMidnight(date);
  if (start <= end) {
    return now >= start && now <= end;
  }
  return now >= start || now <= end;
}

export function isGregorianRangeActive(
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
  gregMonth: number,
  gregDay: number,
): boolean {
  const current = gregorianDayOfYear(gregMonth, gregDay);
  const start = gregorianDayOfYear(startMonth, startDay);
  const end = gregorianDayOfYear(endMonth, endDay);
  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

export function isHebrewRangeActive(
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
  jewishMonth: number,
  jewishDay: number,
): boolean {
  const current = hebrewOrdinal(jewishMonth, jewishDay);
  const start = hebrewOrdinal(startMonth, startDay);
  const end = hebrewOrdinal(endMonth, endDay);
  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}
