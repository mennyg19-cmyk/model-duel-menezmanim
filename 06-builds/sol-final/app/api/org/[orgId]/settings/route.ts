import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import {
  mergeSettingsBlob,
  orgSettingsDto,
  parseSettingsBlob,
  type OrgSettingsBlob,
} from "../../../../../src/domain/org-settings";

type Ctx = { params: Promise<{ orgId: string }> };

type SettingsPutBody = {
  profile?: { name?: string };
  location?: {
    latitude?: number;
    longitude?: number;
    elevation?: number;
    timezone?: string;
    inIsrael?: boolean;
  };
  halacha?: {
    dialect?: string;
    candleLightingMinutes?: number;
    shabbatEndType?: string;
    shabbatEndValue?: number;
    amPmFormat?: boolean;
    rabbeinuTam?: { type: "minutes" | "degrees"; value: number };
  };
  locale?: OrgSettingsBlob["locale"];
  kiosk?: OrgSettingsBlob["kiosk"];
  displayNames?: OrgSettingsBlob["displayNames"];
  adminTheme?: OrgSettingsBlob["adminTheme"];
  tutorial?: OrgSettingsBlob["tutorial"];
  zmanimConfigs?: Array<{
    zmanType: string;
    authority: string;
    degreesBelow?: number | null;
    fixedMinutes?: number | null;
    earliest?: string | null;
    latest?: string | null;
    roundTo?: number | null;
    offset?: number | null;
    delete?: boolean;
  }>;
};

/** Coherent settings read/write (F7) — section patches merge; never clobber unrelated keys. */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;

  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  const configs = await prisma.zmanimConfig.findMany({
    where: { orgId: access.orgId },
    orderBy: { zmanType: "asc" },
  });
  return NextResponse.json(orgSettingsDto(org, configs));
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as SettingsPutBody;
  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const currentSettings = parseSettingsBlob(org.settings);
  const settingsPatch: Partial<OrgSettingsBlob> = {};
  if (body.locale) settingsPatch.locale = body.locale;
  if (body.kiosk) settingsPatch.kiosk = body.kiosk;
  if (body.displayNames) settingsPatch.displayNames = body.displayNames;
  if (body.adminTheme) settingsPatch.adminTheme = body.adminTheme;
  if (body.tutorial) settingsPatch.tutorial = body.tutorial;
  if (body.halacha?.rabbeinuTam) settingsPatch.rabbeinuTam = body.halacha.rabbeinuTam;

  const nextSettings = mergeSettingsBlob(currentSettings, settingsPatch);

  const columnData: Record<string, unknown> = {
    settings: JSON.stringify(nextSettings),
  };
  if (body.profile?.name != null) columnData.name = String(body.profile.name).trim() || org.name;
  if (body.location) {
    if (body.location.latitude != null) columnData.latitude = Number(body.location.latitude);
    if (body.location.longitude != null) columnData.longitude = Number(body.location.longitude);
    if (body.location.elevation != null) columnData.elevation = Number(body.location.elevation);
    if (body.location.timezone != null) columnData.timezone = String(body.location.timezone);
    if (body.location.inIsrael != null) columnData.inIsrael = Boolean(body.location.inIsrael);
  }
  if (body.halacha) {
    if (body.halacha.dialect != null) columnData.dialect = String(body.halacha.dialect);
    if (body.halacha.candleLightingMinutes != null) {
      columnData.candleLightingMinutes = Number(body.halacha.candleLightingMinutes);
    }
    if (body.halacha.shabbatEndType != null) columnData.shabbatEndType = String(body.halacha.shabbatEndType);
    if (body.halacha.shabbatEndValue != null) columnData.shabbatEndValue = Number(body.halacha.shabbatEndValue);
    if (body.halacha.amPmFormat != null) columnData.amPmFormat = Boolean(body.halacha.amPmFormat);
    if (body.halacha.rabbeinuTam) {
      if (body.halacha.rabbeinuTam.type === "minutes") {
        columnData.rabbeinu_tam_minutes = Math.round(body.halacha.rabbeinuTam.value);
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({ where: { id: access.orgId }, data: columnData });

    if (Array.isArray(body.zmanimConfigs)) {
      for (const row of body.zmanimConfigs) {
        const zmanType = String(row.zmanType ?? "");
        if (!zmanType) continue;
        if (row.delete) {
          await tx.zmanimConfig.deleteMany({ where: { orgId: access.orgId, zmanType } });
          continue;
        }
        await tx.zmanimConfig.upsert({
          where: { orgId_zmanType: { orgId: access.orgId, zmanType } },
          create: {
            orgId: access.orgId,
            zmanType,
            authority: String(row.authority ?? "GRA"),
            degreesBelow: row.degreesBelow ?? null,
            fixedMinutes: row.fixedMinutes ?? null,
            earliest: row.earliest ?? null,
            latest: row.latest ?? null,
            roundTo: row.roundTo ?? null,
            offset: row.offset ?? null,
          },
          update: {
            authority: String(row.authority ?? "GRA"),
            degreesBelow: row.degreesBelow ?? null,
            fixedMinutes: row.fixedMinutes ?? null,
            earliest: row.earliest ?? null,
            latest: row.latest ?? null,
            roundTo: row.roundTo ?? null,
            offset: row.offset ?? null,
          },
        });
      }
    }
  });

  const updated = await prisma.organization.findUnique({ where: { id: access.orgId } });
  const configs = await prisma.zmanimConfig.findMany({
    where: { orgId: access.orgId },
    orderBy: { zmanType: "asc" },
  });
  return NextResponse.json(orgSettingsDto(updated!, configs));
}
