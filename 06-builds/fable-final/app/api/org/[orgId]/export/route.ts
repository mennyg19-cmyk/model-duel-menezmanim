import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { orgs } from "@/db/schema";
import { loadBoardData, loadOrgZmanimContext } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import {
  buildOrgBackup,
  listEntityRows,
  listMemorialsRaw,
  listSponsorsRaw,
} from "@/server/io-repo";
import { getEntityDef, sampleCsv, sampleJson, type EntityKey } from "@/io/entities";
import { formatCsv } from "@/io/csv";
import { formatIcs, type IcsEvent } from "@/io/ics";
import { generateZmanimHtml, type ZmanimHtmlData } from "@/io/zmanim-html";
import { boardSnapshotToSvg } from "@/io/screenshot";
import { ZmanimEngine } from "@/core/zmanim-engine";
import { CalendarEngine } from "@/core/calendar-engine";

export const dynamic = "force-dynamic";

const ENTITY_KEYS: EntityKey[] = ["groups", "minyanim", "announcements", "memorials", "sponsors", "media"];

/** E19 — export downloads. */
export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");

    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });

    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "";
    const format = url.searchParams.get("format") ?? "csv";
    const stamp = new Date().toISOString().slice(0, 10);
    const slug = org.slug;

    if (type === "sample") {
      const entity = url.searchParams.get("entity") as EntityKey;
      if (!ENTITY_KEYS.includes(entity)) return NextResponse.json({ error: "Bad entity." }, { status: 400 });
      if (format === "json") return file(sampleJson(entity), "application/json", `sample-${entity}.json`);
      return file(sampleCsv(entity), "text/csv", `sample-${entity}.csv`);
    }

    if (type === "backup") {
      const backup = await buildOrgBackup(orgId);
      return file(JSON.stringify(backup, null, 2), "application/json", `${slug}-backup-${stamp}.json`);
    }

    if (type === "ics") {
      const events = await buildIcsEvents(orgId);
      return file(formatIcs(`${org.name} dates`, events), "text/calendar", `${slug}-dates-${stamp}.ics`);
    }

    if (type === "zmanim" || type === "weekly") {
      const weeks = clampWeeks(url.searchParams.get("weeks"));
      const groupFilter = url.searchParams.get("groups"); // comma names, optional (P10.3)
      const namesSide = url.searchParams.get("names") === "right" ? "right" : "left";
      const basis = url.searchParams.get("basis") === "shabbos" ? "shabbos" : "sunday";
      const ctx = await loadOrgZmanimContext(slug);
      if (!ctx) return NextResponse.json({ error: "Org context missing." }, { status: 404 });
      const data = buildZmanimData(ctx, weeks, basis);
      if (format === "html") {
        return file(
          generateZmanimHtml(data, { language: "both", fontSize: 14, includeParsha: true, includeHoliday: true }),
          "text/html",
          `${slug}-luach-${stamp}.html`,
        );
      }
      return file(zmanimCsv(data, { namesSide, groupFilter }), "text/csv", `${slug}-luach-${stamp}.csv`);
    }

    if (type === "screenshot") {
      const screenId = url.searchParams.get("screenId") ?? undefined;
      const board = await loadBoardData(slug, screenId);
      if (!board) return NextResponse.json({ error: "No board/screen." }, { status: 404 });
      const snapshot = buildDisplaySnapshot(board, { now: new Date(), breakpoint: "full", mode: "display" });
      if (format === "html") {
        const svg = boardSnapshotToSvg(snapshot);
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${slug} screenshot</title>
<style>body{margin:0;background:#111;display:flex;justify-content:center;align-items:flex-start;min-height:100vh}
img,svg{max-width:100%;height:auto}</style></head><body>${svg}
<script>setTimeout(function(){window.print()},500)</script></body></html>`;
        return file(html, "text/html", `${slug}-board-${stamp}.html`);
      }
      return file(boardSnapshotToSvg(snapshot), "image/svg+xml", `${slug}-board-${stamp}.svg`);
    }

    if (ENTITY_KEYS.includes(type as EntityKey)) {
      const key = type as EntityKey;
      const def = getEntityDef(key)!;
      const rows = await listEntityRows(orgId, key);
      if (format === "json") {
        return file(JSON.stringify(rows, null, 2), "application/json", `${slug}-${key}-${stamp}.json`);
      }
      return file(formatCsv(def.columns, rows), "text/csv", `${slug}-${key}-${stamp}.csv`);
    }

    return NextResponse.json({ error: `unknown type "${type}"` }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

function file(body: string, contentType: string, filename: string): NextResponse {
  return new NextResponse(body, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function clampWeeks(raw: string | null): number {
  const n = Number(raw ?? "4");
  if (Number.isNaN(n)) return 4;
  return Math.min(52, Math.max(1, Math.round(n)));
}

type Ctx = NonNullable<Awaited<ReturnType<typeof loadOrgZmanimContext>>>;

function buildZmanimData(ctx: Ctx, weeks: number, basis: "sunday" | "shabbos"): ZmanimHtmlData {
  const tz = ctx.location.timezone;
  const engine = new ZmanimEngine({
    location: ctx.location,
    zmanim: ctx.zmanim,
    candleLightingMinutes: ctx.candleLightingMinutes,
  });
  const calendar = new CalendarEngine(ctx.inIsrael);

  const start = DateTime.now().setZone(tz).startOf("day");
  // Luxon: Mon=1 … Sun=7. Sunday week: back weekday%7. Friday (Shabbos eve) week: (weekday+2)%7.
  const aligned =
    basis === "shabbos"
      ? start.minus({ days: (start.weekday + 2) % 7 })
      : start.minus({ days: start.weekday % 7 });

  const totalDays = weeks * 7;
  const days: ZmanimHtmlData["days"] = [];
  for (let i = 0; i < totalDays; i++) {
    const dt = aligned.plus({ days: i });
    const jsDate = dt.toJSDate();
    const info = calendar.getAllInfo(jsDate);
    const zmanim = engine.getZmanimForDate(jsDate).map((z) => ({
      label: z.label,
      hebrewLabel: z.hebrewLabel,
      time: z.time ? DateTime.fromJSDate(z.time).setZone(tz).toFormat("h:mm a") : "—",
    }));
    days.push({
      date: jsDate,
      hebrewDate: info.date.formattedHebrew,
      dayOfWeek: dt.toFormat("ccc"),
      parsha: info.parsha.parsha || undefined,
      holiday: info.holiday.name || undefined,
      zmanim,
    });
  }

  return {
    orgName: ctx.org.name,
    orgNameHebrew: ctx.org.name,
    dateRange: { start: aligned.toJSDate(), end: aligned.plus({ days: totalDays - 1 }).toJSDate() },
    days,
  };
}

function zmanimCsv(
  data: ZmanimHtmlData,
  opts: { namesSide: "left" | "right"; groupFilter: string | null },
): string {
  const zmanColumns = (data.days[0]?.zmanim ?? []).map((z) =>
    opts.namesSide === "right" ? `${z.label} / ${z.hebrewLabel}` : `${z.hebrewLabel} / ${z.label}`,
  );
  const columns = ["Date", "Hebrew date", "Day", "Parsha", "Holiday", ...zmanColumns];
  let rows = data.days.map((day) => {
    const record: Record<string, string> = {
      Date: day.date.toISOString().slice(0, 10),
      "Hebrew date": day.hebrewDate,
      Day: day.dayOfWeek,
      Parsha: day.parsha ?? "",
      Holiday: day.holiday ?? "",
    };
    day.zmanim.forEach((z, i) => {
      record[zmanColumns[i]!] = z.time;
    });
    return record;
  });
  if (opts.groupFilter?.trim()) {
    const needles = opts.groupFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    rows = rows.filter((r) => needles.some((n) => r.Parsha.toLowerCase().includes(n) || r.Holiday.toLowerCase().includes(n) || r.Day.toLowerCase().includes(n)));
  }
  return formatCsv(columns, rows);
}

async function buildIcsEvents(orgId: string): Promise<IcsEvent[]> {
  const [spons, mems] = await Promise.all([listSponsorsRaw(orgId), listMemorialsRaw(orgId)]);
  const events: IcsEvent[] = [];
  for (const s of spons) {
    if (s.civilDate) {
      events.push({
        uid: `sponsor-${s.id}@menezmanim`,
        summary: `Sponsor: ${s.sponsorName}`,
        description: s.englishText ?? s.hebrewText ?? undefined,
        date: new Date(s.civilDate),
      });
    }
  }
  for (const m of mems) {
    if (m.civilDate) {
      events.push({
        uid: `memorial-${m.id}@menezmanim`,
        summary: `Yahrzeit: ${m.englishName ?? m.hebrewName}`,
        description: m.notes ?? undefined,
        date: new Date(m.civilDate),
      });
    }
  }
  return events;
}
