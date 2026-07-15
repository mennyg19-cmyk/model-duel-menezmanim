import { DateTime } from "luxon";
import { prisma } from "@/db/client";
import { listSchedulesWithTimes } from "@/domain/schedules";
import { announcementDto, memorialDto, sponsorDto } from "@/domain/content";
import { parseCsv, stringifyCsv, mapColumns } from "@/io/csv";
import { applyBzsImport } from "@/io/bzs-apply";

export type ImportCategory =
  | "schedules"
  | "announcements"
  | "yahrzeit"
  | "sponsors"
  | "media"
  | "bezee"
  | "groups-events"
  | "json-announcements"
  | "json-yahrzeit"
  | "json-sponsors";

export function sampleCsv(category: ImportCategory): string {
  switch (category) {
    case "schedules":
      return stringifyCsv(
        ["name", "hebrewName", "type", "fixedTime", "baseZman", "offset", "dayOfWeekMask", "isActive"],
        [
          {
            name: "Shacharit",
            hebrewName: "שחרית",
            type: "shacharit",
            fixedTime: "07:00",
            baseZman: "",
            offset: 0,
            dayOfWeekMask: "1111100",
            isActive: true,
          },
        ],
      );
    case "announcements":
    case "json-announcements":
      return stringifyCsv(
        ["title", "titleHebrew", "content", "contentHebrew", "priority", "isActive"],
        [{ title: "Kiddush", titleHebrew: "קידוש", content: "After davening", contentHebrew: "", priority: 1, isActive: true }],
      );
    case "yahrzeit":
    case "json-yahrzeit":
      return stringifyCsv(
        ["hebrewName", "englishName", "hebrewMonth", "hebrewDay", "relationship", "isYahrzeit", "isActive"],
        [{ hebrewName: "פלוני", englishName: "Ploni", hebrewMonth: 1, hebrewDay: 15, relationship: "father", isYahrzeit: true, isActive: true }],
      );
    case "sponsors":
    case "json-sponsors":
      return stringifyCsv(
        ["sponsorName", "type", "englishText", "hebrewText", "isActive"],
        [{ sponsorName: "Anonymous", type: "kiddush", englishText: "Sponsored by…", hebrewText: "", isActive: true }],
      );
    case "groups-events":
      return stringifyCsv(
        ["groupName", "hebrewName", "color", "active"],
        [{ groupName: "Weekday", hebrewName: "חול", color: "#3b82f6", active: true }],
      );
    default:
      return stringifyCsv(["name"], [{ name: "example" }]);
  }
}

export function sampleJson(category: "announcements" | "yahrzeit" | "sponsors"): string {
  if (category === "announcements") {
    return JSON.stringify(
      [{ title: "Notice", content: "Sample announcement", priority: 1, isActive: true }],
      null,
      2,
    );
  }
  if (category === "yahrzeit") {
    return JSON.stringify(
      [{ hebrewName: "פלוני", englishName: "Ploni", hebrewMonth: 1, hebrewDay: 10, isYahrzeit: true, isActive: true }],
      null,
      2,
    );
  }
  return JSON.stringify(
    [{ sponsorName: "Family Cohen", type: "general", englishText: "In memory of…", isActive: true }],
    null,
    2,
  );
}

export async function previewImport(input: {
  category: ImportCategory;
  content: string;
  mapping?: Record<string, string>;
}): Promise<{ preview: unknown[]; errors: string[]; count: number }> {
  const { category, content, mapping } = input;
  if (category.startsWith("json-") || (content.trim().startsWith("[") && category !== "bezee")) {
    try {
      const parsed = JSON.parse(content) as unknown[];
      if (!Array.isArray(parsed)) return { preview: [], errors: ["JSON root must be an array"], count: 0 };
      return { preview: parsed.slice(0, 20), errors: [], count: parsed.length };
    } catch (err) {
      return { preview: [], errors: [err instanceof Error ? err.message : "Invalid JSON"], count: 0 };
    }
  }
  if (category === "bezee") {
    try {
      const { parseBzs } = await import("@/io/beezee");
      const parsed = parseBzs(content);
      return {
        preview: [
          { zmanimDefs: parsed.zmanimDefs.length, toladotEntries: parsed.toladotEntries.length },
          ...parsed.toladotEntries.slice(0, 5),
        ],
        errors:
          parsed.zmanimDefs.length === 0 && parsed.toladotEntries.length === 0
            ? ["No BeeZee entries found"]
            : [],
        count: parsed.zmanimDefs.length + parsed.toladotEntries.length,
      };
    } catch (err) {
      return { preview: [], errors: [err instanceof Error ? err.message : "BZS parse failed"], count: 0 };
    }
  }

  const csv = parseCsv(content);
  const rows = mapping ? mapColumns(csv.rows, mapping) : csv.rows;
  return { preview: rows.slice(0, 20), errors: csv.errors, count: rows.length };
}

export async function commitImport(input: {
  orgId: string;
  category: ImportCategory;
  content: string;
  mapping?: Record<string, string>;
  mode?: "append" | "replace";
}): Promise<{ written: number; errors: string[] }> {
  const mode = input.mode ?? "append";
  const errors: string[] = [];

  if (input.category === "bezee") {
    const result = await applyBzsImport(input.orgId, input.content, mode);
    return { written: result.zmanimWritten + result.minyanimWritten, errors: [] };
  }

  if (input.category.startsWith("json-") || input.content.trim().startsWith("[")) {
    const items = JSON.parse(input.content) as Record<string, unknown>[];
    return commitRows(input.orgId, input.category.replace("json-", "") as ImportCategory, items, mode, errors);
  }

  const csv = parseCsv(input.content);
  errors.push(...csv.errors);
  const rows = input.mapping ? mapColumns(csv.rows, input.mapping) : csv.rows;
  return commitRows(input.orgId, input.category, rows, mode, errors);
}

async function commitRows(
  orgId: string,
  category: ImportCategory,
  rows: Record<string, unknown>[],
  mode: "append" | "replace",
  errors: string[],
) {
  let written = 0;
  if (category === "announcements") {
    if (mode === "replace") await prisma.announcement.deleteMany({ where: { orgId } });
    for (const row of rows) {
      await prisma.announcement.create({
        data: {
          orgId,
          title: String(row.title ?? "Untitled"),
          titleHebrew: (row.titleHebrew as string) || null,
          content: String(row.content ?? ""),
          contentHebrew: (row.contentHebrew as string) || null,
          priority: Number(row.priority ?? 0),
          isActive: String(row.isActive ?? "true") !== "false",
        },
      });
      written++;
    }
  } else if (category === "yahrzeit") {
    if (mode === "replace") await prisma.memorial.deleteMany({ where: { orgId } });
    for (const row of rows) {
      await prisma.memorial.create({
        data: {
          orgId,
          hebrewName: String(row.hebrewName ?? "נפטר"),
          englishName: (row.englishName as string) || null,
          hebrewMonth: Number(row.hebrewMonth ?? 1),
          hebrewDay: Number(row.hebrewDay ?? 1),
          relationship: (row.relationship as string) || null,
          isYahrzeit: String(row.isYahrzeit ?? "true") !== "false",
          isActive: String(row.isActive ?? "true") !== "false",
        },
      });
      written++;
    }
  } else if (category === "sponsors") {
    if (mode === "replace") await prisma.sponsor.deleteMany({ where: { orgId } });
    for (const row of rows) {
      await prisma.sponsor.create({
        data: {
          orgId,
          sponsorName: String(row.sponsorName ?? "Sponsor"),
          type: String(row.type ?? "general"),
          englishText: (row.englishText as string) || null,
          hebrewText: (row.hebrewText as string) || null,
          isActive: String(row.isActive ?? "true") !== "false",
        },
      });
      written++;
    }
  } else if (category === "schedules" || category === "groups-events") {
    if (category === "groups-events") {
      for (const row of rows) {
        const name = String(row.groupName ?? row.name ?? "").trim();
        if (!name) {
          errors.push("Missing groupName");
          continue;
        }
        await prisma.scheduleGroup.create({
          data: {
            orgId,
            name,
            hebrewName: String(row.hebrewName ?? name),
            color: String(row.color ?? "#64748b"),
            active: String(row.active ?? "true") !== "false",
            sortOrder: written,
            isBuiltIn: false,
          },
        });
        written++;
      }
    } else {
      if (mode === "replace") await prisma.minyanSchedule.deleteMany({ where: { orgId } });
      for (const row of rows) {
        await prisma.minyanSchedule.create({
          data: {
            orgId,
            name: String(row.name ?? "Event"),
            hebrewName: String(row.hebrewName ?? row.name ?? "אירוע"),
            type: String(row.type ?? "other"),
            fixedTime: (row.fixedTime as string) || null,
            baseZman: (row.baseZman as string) || null,
            offset: Number(row.offset ?? 0),
            dayOfWeekMask: String(row.dayOfWeekMask ?? "1111111"),
            isActive: String(row.isActive ?? "true") !== "false",
            sortOrder: written,
          },
        });
        written++;
      }
    }
  } else if (category === "media") {
    errors.push("Media import expects binary uploads via Content hub; CSV media lists are not files.");
  } else {
    errors.push(`Unsupported category: ${category}`);
  }
  return { written, errors };
}

export async function exportOrgData(
  orgId: string,
  type:
    | "announcements"
    | "memorials"
    | "sponsors"
    | "schedules"
    | "groups"
    | "full-json"
    | "ics-schedules",
  format: "csv" | "json" | "ics" = "csv",
): Promise<{ filename: string; contentType: string; body: string }> {
  if (type === "full-json" || format === "json") {
    const [org, announcements, memorials, sponsors, schedules, groups, styles, screens] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId } }),
      prisma.announcement.findMany({ where: { orgId } }),
      prisma.memorial.findMany({ where: { orgId } }),
      prisma.sponsor.findMany({ where: { orgId } }),
      prisma.minyanSchedule.findMany({ where: { orgId } }),
      prisma.scheduleGroup.findMany({ where: { orgId } }),
      prisma.style.findMany({ where: { orgId }, include: { displayObjects: true } }),
      prisma.screen.findMany({ where: { orgId } }),
    ]);
    const body = JSON.stringify(
      { org, announcements, memorials, sponsors, schedules, groups, styles, screens, exportedAt: new Date().toISOString() },
      null,
      2,
    );
    return { filename: `org-${org?.slug ?? orgId}-backup.json`, contentType: "application/json", body };
  }

  if (type === "ics-schedules" || format === "ics") {
    const schedules = await listSchedulesWithTimes(orgId);
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MenEZmanim//EN"];
    for (const s of schedules) {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${s.id}@menezmanim`);
      lines.push(`SUMMARY:${s.name}`);
      if (s.computedTime || s.fixedTime) {
        const t = (s.computedTime || s.fixedTime || "00:00").replace(":", "");
        const day = DateTime.now().toFormat("yyyyLLdd");
        lines.push(`DTSTART:${day}T${t.padStart(4, "0")}00`);
      }
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return { filename: "schedules.ics", contentType: "text/calendar", body: lines.join("\r\n") };
  }

  if (type === "announcements") {
    const rows = await prisma.announcement.findMany({ where: { orgId } });
    return {
      filename: "announcements.csv",
      contentType: "text/csv; charset=utf-8",
      body: stringifyCsv(
        ["title", "titleHebrew", "content", "contentHebrew", "priority", "isActive"],
        rows.map((r) => {
          const dto = announcementDto(r);
          return {
            title: dto.title,
            titleHebrew: dto.titleHebrew,
            content: dto.content,
            contentHebrew: dto.contentHebrew,
            priority: dto.priority,
            isActive: dto.isActive,
          };
        }),
      ),
    };
  }
  if (type === "memorials") {
    const rows = await prisma.memorial.findMany({ where: { orgId } });
    return {
      filename: "memorials.csv",
      contentType: "text/csv; charset=utf-8",
      body: stringifyCsv(
        ["hebrewName", "englishName", "hebrewMonth", "hebrewDay", "relationship", "isYahrzeit", "isActive"],
        rows.map((r) => {
          const dto = memorialDto(r);
          return {
            hebrewName: dto.hebrewName,
            englishName: dto.englishName,
            hebrewMonth: dto.hebrewMonth,
            hebrewDay: dto.hebrewDay,
            relationship: dto.relationship,
            isYahrzeit: dto.isYahrzeit,
            isActive: dto.isActive,
          };
        }),
      ),
    };
  }
  if (type === "sponsors") {
    const rows = await prisma.sponsor.findMany({ where: { orgId } });
    return {
      filename: "sponsors.csv",
      contentType: "text/csv; charset=utf-8",
      body: stringifyCsv(
        ["sponsorName", "type", "englishText", "hebrewText", "isActive"],
        rows.map((r) => {
          const dto = sponsorDto(r);
          return {
            sponsorName: dto.sponsorName,
            type: dto.type,
            englishText: dto.englishText,
            hebrewText: dto.hebrewText,
            isActive: dto.isActive,
          };
        }),
      ),
    };
  }
  if (type === "groups") {
    const rows = await prisma.scheduleGroup.findMany({ where: { orgId } });
    return {
      filename: "groups.csv",
      contentType: "text/csv; charset=utf-8",
      body: stringifyCsv(
        ["name", "hebrewName", "color", "active", "sortOrder"],
        rows.map((r) => ({
          name: r.name,
          hebrewName: r.hebrewName,
          color: r.color,
          active: r.active,
          sortOrder: r.sortOrder,
        })),
      ),
    };
  }
  const schedules = await listSchedulesWithTimes(orgId);
  return {
    filename: "schedules.csv",
    contentType: "text/csv; charset=utf-8",
    body: stringifyCsv(
      ["name", "hebrewName", "type", "fixedTime", "computedTime", "baseZman", "offset", "isActive"],
      schedules.map((s) => ({
        name: s.name,
        hebrewName: s.hebrewName,
        type: s.type,
        fixedTime: s.fixedTime,
        computedTime: s.computedTime,
        baseZman: s.baseZman,
        offset: s.offset,
        isActive: s.isActive,
      })),
    ),
  };
}
