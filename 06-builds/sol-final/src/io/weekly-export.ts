import { DateTime } from "luxon";
import { prisma } from "@/db/client";
import { listSchedulesWithTimes } from "@/domain/schedules";
import { stringifyCsv } from "@/io/csv";

export type WeeklyExportOptions = {
  weeks: number;
  basis: "sunday" | "shabbos";
  namesSide: "left" | "right";
  includeParsha: boolean;
  groupIds?: string[];
};

/** P10.3 — multi-week schedule CSV with optional parsha headers. */
export async function buildWeeklyScheduleCsv(orgId: string, options: WeeklyExportOptions): Promise<string> {
  const weeks = Math.min(52, Math.max(1, options.weeks || 1));
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error("Organization not found");

  let schedules = await listSchedulesWithTimes(orgId);
  if (options.groupIds?.length) {
    schedules = schedules.filter((s) => options.groupIds!.some((g) => s.scheduleGroupIds.includes(g)));
  }

  const start = DateTime.now().setZone(org.timezone).startOf("day");

  // Sunday-basis = start on Sunday; Shabbos-basis = start on Saturday
  const cursor =
    options.basis === "shabbos"
      ? start.minus({ days: (start.weekday + 1) % 7 })
      : start.minus({ days: start.weekday % 7 });

  const headers = ["weekStart", "weekEnd", ...(options.includeParsha ? ["parsha"] : []), ...schedules.map((s) => s.name)];
  const rows: Array<Record<string, string>> = [];

  for (let w = 0; w < weeks; w++) {
    const from = cursor.plus({ weeks: w });
    const to = from.plus({ days: 6 });
    const row: Record<string, string> = {
      weekStart: from.toISODate() ?? "",
      weekEnd: to.toISODate() ?? "",
    };
    if (options.includeParsha) row.parsha = `Week ${w + 1}`;
    for (const s of schedules) {
      const label = options.namesSide === "right" ? s.hebrewName || s.name : s.name;
      row[s.name] = `${label}: ${s.computedTime ?? s.fixedTime ?? "—"}`;
    }
    rows.push(row);
  }

  return stringifyCsv(headers, rows);
}

/** F10 — bilingual multi-week HTML suitable for print-to-PDF. */
export async function buildWeeklyScheduleHtml(orgId: string, options: WeeklyExportOptions): Promise<string> {
  const csvLike = await buildWeeklyScheduleCsv(orgId, options);
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const schedules = await listSchedulesWithTimes(orgId);
  const weeks = Math.min(52, Math.max(1, options.weeks || 1));

  const rowsHtml = Array.from({ length: weeks }, (_, w) => {
    const cells = schedules
      .map((s) => {
        const en = s.name;
        const he = s.hebrewName || s.name;
        const time = s.computedTime ?? s.fixedTime ?? "—";
        return `<td><div class="en">${escapeHtml(en)}</div><div class="he" dir="rtl">${escapeHtml(he)}</div><div class="time">${escapeHtml(time)}</div></td>`;
      })
      .join("");
    return `<tr><th>Week ${w + 1}</th>${cells}</tr>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(org?.name ?? "Schedule")} — ${weeks} weeks</title>
<style>
  body { font-family: Georgia, serif; margin: 24px; color: #111; }
  h1 { margin: 0 0 4px; }
  .sub { color: #555; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
  th { background: #f3f3f3; }
  .he { font-size: 1.05rem; }
  .en { font-size: 0.85rem; color: #333; }
  .time { font-weight: 700; margin-top: 4px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(org?.name ?? "Schedule")}</h1>
  <div class="sub">${weeks}-week bilingual schedule · ${options.basis} basis · printable PDF via browser print</div>
  <table>
    <thead><tr><th>Week</th>${schedules.map((s) => `<th>${escapeHtml(s.name)}</th>`).join("")}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <!-- csv-bytes:${csvLike.length} -->
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
