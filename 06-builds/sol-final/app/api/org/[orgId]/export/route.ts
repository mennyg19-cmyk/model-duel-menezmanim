import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { exportOrgData } from "../../../../../src/io/import-export";
import { buildWeeklyScheduleCsv, buildWeeklyScheduleHtml } from "../../../../../src/io/weekly-export";
import { buildBoardScreenshotSvg } from "../../../../../src/io/screenshot";
import { prisma } from "../../../../../src/db/client";

type Ctx = { params: Promise<{ orgId: string }> };

/** E19 export — CSV/JSON/ICS, weekly CSV/HTML(PDF), screenshot SVG. */
export async function GET(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;

  const url = request.nextUrl;
  const kind = url.searchParams.get("kind") ?? "schedules";
  const format = (url.searchParams.get("format") ?? "csv") as "csv" | "json" | "ics";

  if (kind === "weekly") {
    const weeks = Number(url.searchParams.get("weeks") ?? 4);
    const basis = (url.searchParams.get("basis") ?? "sunday") as "sunday" | "shabbos";
    const asHtml = url.searchParams.get("format") === "html" || url.searchParams.get("format") === "pdf";
    if (asHtml) {
      const html = await buildWeeklyScheduleHtml(access.orgId, {
        weeks,
        basis,
        namesSide: "left",
        includeParsha: true,
      });
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="weekly-schedule.html"`,
        },
      });
    }
    const csv = await buildWeeklyScheduleCsv(access.orgId, {
      weeks,
      basis,
      namesSide: "left",
      includeParsha: true,
    });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="weekly-schedule.csv"`,
      },
    });
  }

  if (kind === "screenshot") {
    const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
    const screenId = url.searchParams.get("screenId") ?? "main";
    const svg = await buildBoardScreenshotSvg(org?.slug ?? access.orgId, screenId);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="board-${screenId}.svg"`,
      },
    });
  }

  const exported = await exportOrgData(
    access.orgId,
    kind as "announcements" | "memorials" | "sponsors" | "schedules" | "groups" | "full-json" | "ics-schedules",
    format,
  );
  return new NextResponse(exported.body, {
    headers: {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename="${exported.filename}"`,
    },
  });
}
