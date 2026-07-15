export interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  date: Date;
}

export function formatIcs(calendarName: string, events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MenEZmanim//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stampUtc(new Date())}`,
      `DTSTART;VALUE=DATE:${stampDate(event.date)}`,
      `SUMMARY:${escapeText(event.summary)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Minimal ICS → rows for announcement import (P10.1 ICS path). */
export function parseIcsToAnnouncementRecords(text: string): Record<string, string>[] {
  const events = text.split("BEGIN:VEVENT").slice(1);
  const out: Record<string, string>[] = [];
  for (const block of events) {
    const summary = matchField(block, "SUMMARY") ?? "Imported event";
    const description = matchField(block, "DESCRIPTION") ?? "";
    const start = matchField(block, "DTSTART");
    out.push({
      title: unescapeIcs(summary),
      titleHebrew: "",
      content: unescapeIcs(description) || unescapeIcs(summary),
      contentHebrew: "",
      priority: "0",
      isActive: "true",
      startDate: start ? start.replace(/T.*/, "").replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : "",
      endDate: "",
    });
  }
  return out;
}

function matchField(block: string, name: string): string | null {
  const re = new RegExp(`${name}(?:;[^:]*)?:(.+)`);
  const m = block.match(re);
  return m?.[1]?.trim() ?? null;
}

function unescapeIcs(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function stampDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function stampUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
