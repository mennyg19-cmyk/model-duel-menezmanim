import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { OrgSettings } from "@/db/json";
import { orgs, zmanimConfigs } from "@/db/schema";
import { planLimits } from "@/admin/plan-limits";

export const dynamic = "force-dynamic";

function serOrg(row: typeof orgs.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    plan: row.plan,
    latitude: row.latitude,
    longitude: row.longitude,
    elevation: row.elevation,
    timezone: row.timezone,
    inIsrael: row.inIsrael,
    dialect: row.dialect,
    candleLightingMinutes: row.candleLightingMinutes,
    shabbatEndType: row.shabbatEndType,
    shabbatEndValue: row.shabbatEndValue,
    rabbeinuTamMinutes: row.rabbeinuTamMinutes,
    amPmFormat: row.amPmFormat,
    settings: (row.settings ?? {}) as OrgSettings,
    planLimits: planLimits(row.plan),
  };
}

function serZman(row: typeof zmanimConfigs.$inferSelect) {
  return {
    id: row.id,
    zmanType: row.zmanType,
    authority: row.authority,
    degreesBelow: row.degreesBelow,
    fixedMinutes: row.fixedMinutes,
    earliest: row.earliest,
    latest: row.latest,
    roundTo: row.roundTo,
    offset: row.offset,
  };
}

/** Org settings + zmanim overrides (P9 / D1 / D10). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });
    const zmanRows = await db.select().from(zmanimConfigs).where(eq(zmanimConfigs.orgId, orgId));
    return NextResponse.json({ org: serOrg(org), zmanimConfigs: zmanRows.map(serZman) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

type PutBody = {
  name?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  inIsrael?: boolean;
  dialect?: string;
  candleLightingMinutes?: number;
  shabbatEndType?: string;
  shabbatEndValue?: number;
  rabbeinuTamMinutes?: number;
  amPmFormat?: boolean;
  settings?: OrgSettings;
  zmanimConfigs?: Array<{
    zmanType: string;
    authority: string;
    degreesBelow?: number | null;
    fixedMinutes?: number | null;
    earliest?: string | null;
    latest?: string | null;
    roundTo?: number | null;
    offset?: number | null;
  }>;
};

/** F7 — one coherent save for profile/location/halacha/settings/zman overrides. */
export async function PUT(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");
    const body = (await request.json().catch(() => null)) as PutBody | null;
    if (!body) return NextResponse.json({ error: "Body required." }, { status: 400 });

    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found." }, { status: 404 });

    const nextSettings = body.settings !== undefined ? body.settings : ((org.settings ?? {}) as OrgSettings);
    // Keep column in sync when settings carry Rabbeinu Tam minutes (P9.3).
    let rabbeinuTamMinutes = body.rabbeinuTamMinutes ?? org.rabbeinuTamMinutes;
    const bag = nextSettings as Record<string, unknown>;
    if (bag.rabbeinuTamType === "minutes" && typeof bag.rabbeinuTamValue === "number") {
      rabbeinuTamMinutes = bag.rabbeinuTamValue;
    }

    await db
      .update(orgs)
      .set({
        name: body.name?.trim() || org.name,
        latitude: body.latitude ?? org.latitude,
        longitude: body.longitude ?? org.longitude,
        elevation: body.elevation ?? org.elevation,
        timezone: body.timezone?.trim() || org.timezone,
        inIsrael: body.inIsrael ?? org.inIsrael,
        dialect: body.dialect?.trim() || org.dialect,
        candleLightingMinutes: body.candleLightingMinutes ?? org.candleLightingMinutes,
        shabbatEndType: body.shabbatEndType ?? org.shabbatEndType,
        shabbatEndValue: body.shabbatEndValue ?? org.shabbatEndValue,
        rabbeinuTamMinutes,
        amPmFormat: body.amPmFormat ?? org.amPmFormat,
        settings: nextSettings,
      })
      .where(eq(orgs.id, orgId));

    if (body.zmanimConfigs) {
      await db.delete(zmanimConfigs).where(eq(zmanimConfigs.orgId, orgId));
      if (body.zmanimConfigs.length > 0) {
        await db.insert(zmanimConfigs).values(
          body.zmanimConfigs.map((z) => ({
            orgId,
            zmanType: z.zmanType,
            authority: z.authority,
            degreesBelow: z.degreesBelow ?? null,
            fixedMinutes: z.fixedMinutes ?? null,
            earliest: z.earliest ?? null,
            latest: z.latest ?? null,
            roundTo: z.roundTo ?? null,
            offset: z.offset ?? null,
          })),
        );
      }
    }

    const [updated] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
    const zmanRows = await db.select().from(zmanimConfigs).where(eq(zmanimConfigs.orgId, orgId));
    return NextResponse.json({ org: serOrg(updated!), zmanimConfigs: zmanRows.map(serZman), savedAt: new Date().toISOString() });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
