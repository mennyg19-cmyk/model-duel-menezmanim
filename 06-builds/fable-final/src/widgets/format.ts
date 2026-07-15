// === What's in this file ===
// Small shared helpers every widget uses to turn the snapshot's ISO time strings
// into the text shown on the board, always in the org's timezone (the snapshot
// carries times as UTC ISO strings so they survive JSON; we format them back in
// the board's zone here).
//
// formatClockTime() -- a wall-clock time ("7:42" / "07:42" / with seconds / am-pm).
// formatZmanTime()  -- a zman/minyan time from an ISO string, or a dash when null.

import { DateTime } from "luxon";

export interface TimeFormatOptions {
  use24h?: boolean;
  showSeconds?: boolean;
  hideAmPm?: boolean;
}

export function formatClockTime(date: DateTime, options: TimeFormatOptions = {}): string {
  const { use24h = false, showSeconds = false, hideAmPm = false } = options;
  if (use24h) {
    return date.toFormat(showSeconds ? "HH:mm:ss" : "HH:mm");
  }
  const base = showSeconds ? "h:mm:ss" : "h:mm";
  return date.toFormat(hideAmPm ? base : `${base} a`);
}

export function formatZmanTime(iso: string | null, timezone: string, options: TimeFormatOptions = {}): string {
  if (!iso) return "—";
  const dt = DateTime.fromISO(iso, { zone: timezone });
  if (!dt.isValid) return "—";
  return formatClockTime(dt, options);
}
