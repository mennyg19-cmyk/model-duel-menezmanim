import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireActor } from "@/auth/guards";
import { DEFAULT_SCHEDULE_GROUPS } from "@/core/schedule-groups";
import { db } from "@/db/client";
import { orgMemberships, orgs, scheduleGroups, screens, styles } from "@/db/schema";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]+$/;

export interface OnboardingBody {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  inIsrael: boolean;
  dialect: string;
  candleLightingMinutes?: number;
  shabbatEndType?: string;
  shabbatEndValue?: number;
}

/** GET ?slug= — uniqueness check for the onboarding form. */
export async function GET(request: Request) {
  try {
    await requireActor();
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
  const slug = new URL(request.url).searchParams.get("slug")?.trim().toLowerCase() ?? "";
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });
  const taken = (await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.slug, slug)).limit(1)).length > 0;
  return NextResponse.json({ slug, available: !taken });
}

/** E2 — create org + seed defaults; new orgs enter pending (P4o.6). */
export async function POST(request: Request) {
  let actor;
  try {
    actor = await requireActor();
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const body = (await request.json().catch(() => null)) as OnboardingBody | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const name = body.name?.trim() ?? "";
  const slug = body.slug?.trim().toLowerCase() ?? "";
  if (!name) return NextResponse.json({ error: "Give the organization a name." }, { status: 400 });
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "URL slug: lowercase letters, numbers, dashes only." }, { status: 400 });
  }
  const taken = (await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.slug, slug)).limit(1)).length > 0;
  if (taken) return NextResponse.json({ error: "That URL slug is already taken." }, { status: 409 });

  const [org] = await db
    .insert(orgs)
    .values({
      name,
      slug,
      status: "pending",
      latitude: Number(body.latitude) || 0,
      longitude: Number(body.longitude) || 0,
      elevation: Number(body.elevation) || 0,
      timezone: body.timezone?.trim() || "Asia/Jerusalem",
      inIsrael: Boolean(body.inIsrael),
      dialect: body.dialect || "Ashkenazi",
      candleLightingMinutes: body.candleLightingMinutes ?? 18,
      shabbatEndType: body.shabbatEndType ?? "degrees",
      shabbatEndValue: body.shabbatEndValue ?? 8.5,
    })
    .returning();

  if (!org) return NextResponse.json({ error: "org create failed" }, { status: 500 });

  await db.insert(orgMemberships).values({ userId: actor.userId, orgId: org.id, role: "owner" });

  await db.insert(scheduleGroups).values(
    DEFAULT_SCHEDULE_GROUPS.map((group, index) => ({
      orgId: org.id,
      name: group.name,
      hebrewName: group.hebrewName,
      color: group.color,
      active: true,
      sortOrder: index,
      isBuiltIn: true,
    })),
  );

  const [style] = await db
    .insert(styles)
    .values({ orgId: org.id, name: "Main display", isDefault: true })
    .returning({ id: styles.id });

  if (style) {
    await db.insert(screens).values({
      orgId: org.id,
      name: "Main screen",
      assignedStyleId: style.id,
      styleSchedules: [
        { id: `mig-${style.id}-def`, styleId: style.id, priority: 0, breakpoint: "all", rules: [{ type: "default" }] },
      ],
    });
  }

  return NextResponse.json({ ok: true, orgId: org.id, slug: org.slug, status: org.status });
}
