import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/db/client";
import { activeAnnouncements, schedulesForDate } from "../../../src/domain/mobile-data";
import { computeOrgCalendar, computeOrgZmanim, parseDateParam } from "../../../src/domain/org-zmanim";

/**
 * Public congregant bundle for /mobile (R7).
 * Locale fields named distinctly (F-I18N2):
 * - uiLocale: mobile chrome language
 * - boardDefaultLocale: org display default
 * - objectTextLocale: per-row text preference (follows uiLocale here)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("org") ?? searchParams.get("orgSlug");
  if (!slug) {
    return NextResponse.json({ error: "Missing org slug (?org=)" }, { status: 400 });
  }

  const date = parseDateParam(searchParams.get("date"));
  if (!date) {
    return NextResponse.json({ error: "Invalid date parameter" }, { status: 400 });
  }

  const uiLocale = searchParams.get("lang") === "he" ? "he" : "en";

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      zmanimConfigs: true,
      minyanSchedules: { orderBy: { sortOrder: "asc" } },
      announcements: true,
      scheduleGroups: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!org) {
    return NextResponse.json({ error: `Organization not found: ${slug}` }, { status: 404 });
  }

  let settings: { nameHebrew?: string; boardDefaultLocale?: string } = {};
  try {
    settings = JSON.parse(org.settings) as typeof settings;
  } catch {
    settings = {};
  }

  const boardDefaultLocale = settings.boardDefaultLocale === "he" ? "he" : "en";
  const { config, zmanim } = computeOrgZmanim(org, date, org.zmanimConfigs);
  const calendar = computeOrgCalendar(org, date);
  const schedule = schedulesForDate(org.minyanSchedules, date, org, config);
  const announcements = activeAnnouncements(org.announcements, date, org.timezone);

  return NextResponse.json({
    org: {
      slug: org.slug,
      name: org.name,
      nameHebrew: settings.nameHebrew ?? null,
      timezone: org.timezone,
    },
    locales: {
      uiLocale,
      boardDefaultLocale,
      objectTextLocale: uiLocale,
    },
    date: date.toISOString(),
    zmanim,
    calendar,
    schedule,
    announcements,
    groups: org.scheduleGroups.map((g) => ({
      id: g.id,
      name: g.name,
      hebrewName: g.hebrewName,
      color: g.color,
    })),
  });
}
