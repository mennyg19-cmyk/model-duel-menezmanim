import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  announcements,
  displayObjects,
  memorials,
  minyanSchedules,
  orgMemberships,
  orgs,
  scheduleGroups,
  screens,
  styles,
} from "@/db/schema";
import { DEFAULT_SCHEDULE_GROUPS } from "@/core/schedule-groups";

/** Clone schedules/groups/announcements/memorials/styles/objects into a new org (SA.6). */
export async function cloneOrgContent(sourceOrgId: string, targetOrgId: string): Promise<{ copied: Record<string, number> }> {
  const groupIdMap = new Map<string, string>();
  const styleIdMap = new Map<string, string>();

  const groups = await db.select().from(scheduleGroups).where(eq(scheduleGroups.orgId, sourceOrgId));
  for (const g of groups) {
    const [row] = await db
      .insert(scheduleGroups)
      .values({
        orgId: targetOrgId,
        name: g.name,
        hebrewName: g.hebrewName,
        color: g.color,
        sortOrder: g.sortOrder,
        isBuiltIn: g.isBuiltIn,
        autoActivationRules: g.autoActivationRules,
      })
      .returning();
    if (row) groupIdMap.set(g.id, row.id);
  }

  const remapGroups = (ids: string[] | null | undefined) =>
    (ids ?? []).map((id) => groupIdMap.get(id)).filter(Boolean) as string[];

  const mins = await db.select().from(minyanSchedules).where(eq(minyanSchedules.orgId, sourceOrgId));
  for (const m of mins) {
    await db.insert(minyanSchedules).values({
      orgId: targetOrgId,
      name: m.name,
      hebrewName: m.hebrewName,
      type: m.type,
      baseZman: m.baseZman,
      fixedTime: m.fixedTime,
      offset: m.offset,
      earliest: m.earliest,
      latest: m.latest,
      roundTo: m.roundTo,
      roundDirection: m.roundDirection,
      room: m.room,
      dayOfWeekMask: m.dayOfWeekMask,
      scheduleGroupIds: remapGroups(m.scheduleGroupIds as string[] | null),
      details: m.details,
      isActive: m.isActive,
      sortOrder: m.sortOrder,
    });
  }

  const anns = await db.select().from(announcements).where(eq(announcements.orgId, sourceOrgId));
  for (const a of anns) {
    await db.insert(announcements).values({
      orgId: targetOrgId,
      title: a.title,
      titleHebrew: a.titleHebrew,
      content: a.content,
      contentHebrew: a.contentHebrew,
      scheduleRules: a.scheduleRules,
      priority: a.priority,
      isActive: a.isActive,
      startDate: a.startDate,
      endDate: a.endDate,
    });
  }

  const mems = await db.select().from(memorials).where(eq(memorials.orgId, sourceOrgId));
  for (const m of mems) {
    await db.insert(memorials).values({
      orgId: targetOrgId,
      hebrewName: m.hebrewName,
      englishName: m.englishName,
      hebrewFamilyName: m.hebrewFamilyName,
      hebrewBenBat: m.hebrewBenBat,
      relationship: m.relationship,
      donorInfo: m.donorInfo,
      hebrewMonth: m.hebrewMonth,
      hebrewDay: m.hebrewDay,
      isYahrzeit: m.isYahrzeit,
      notes: m.notes,
      isActive: m.isActive,
    });
  }

  const styleRows = await db.select().from(styles).where(eq(styles.orgId, sourceOrgId));
  for (const s of styleRows) {
    const [ns] = await db
      .insert(styles)
      .values({
        orgId: targetOrgId,
        name: s.name,
        backgroundColor: s.backgroundColor,
        backgroundMode: s.backgroundMode,
        backgroundImage: s.backgroundImage,
        backgroundGradient: s.backgroundGradient,
        backgroundTexture: s.backgroundTexture,
        backgroundFrameId: s.backgroundFrameId,
        backgroundFrameThickness: s.backgroundFrameThickness,
        canvasWidth: s.canvasWidth,
        canvasHeight: s.canvasHeight,
        isDefault: s.isDefault,
        activationRules: s.activationRules,
        sortOrder: s.sortOrder,
      })
      .returning();
    if (ns) styleIdMap.set(s.id, ns.id);
  }

  const styleIds = [...styleIdMap.keys()];
  if (styleIds.length) {
    const objs = await db.select().from(displayObjects).where(inArray(displayObjects.styleId, styleIds));
    for (const o of objs) {
      const newStyleId = styleIdMap.get(o.styleId);
      if (!newStyleId) continue;
      await db.insert(displayObjects).values({
        styleId: newStyleId,
        name: o.name,
        type: o.type,
        posX: o.posX,
        posY: o.posY,
        width: o.width,
        height: o.height,
        layer: o.layer,
        fontFamily: o.fontFamily,
        fontSize: o.fontSize,
        fontBold: o.fontBold,
        fontItalic: o.fontItalic,
        foreColor: o.foreColor,
        backColor: o.backColor,
        language: o.language,
        textAlign: o.textAlign,
        verticalAlign: o.verticalAlign,
        lineHeight: o.lineHeight,
        backgroundMode: o.backgroundMode,
        backgroundImage: o.backgroundImage,
        backgroundGradient: o.backgroundGradient,
        backgroundTexture: o.backgroundTexture,
        frameId: o.frameId,
        frameThickness: o.frameThickness,
        scrollingEnabled: o.scrollingEnabled,
        scrollingDirection: o.scrollingDirection,
        scrollingSpeed: o.scrollingSpeed,
        content: o.content,
        scheduleRules: o.scheduleRules,
        scheduleGroupVisibility: o.scheduleGroupVisibility,
        visible: o.visible,
      });
    }
  }

  return {
    copied: {
      groups: groups.length,
      minyanim: mins.length,
      announcements: anns.length,
      memorials: mems.length,
      styles: styleRows.length,
    },
  };
}

export async function createOrgWithDefaults(input: {
  name: string;
  slug: string;
  status?: string;
  plan?: string;
  ownerUserId?: string | null;
}) {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const existing = await db.select({ id: orgs.id }).from(orgs).where(eq(orgs.slug, slug)).limit(1);
  if (existing.length) throw new Error("Slug already taken.");

  const [org] = await db
    .insert(orgs)
    .values({
      name: input.name.trim(),
      slug,
      status: input.status ?? "pending",
      plan: input.plan ?? "free",
      latitude: 31.7683,
      longitude: 35.2137,
      elevation: 754,
      timezone: "Asia/Jerusalem",
      inIsrael: true,
    })
    .returning();
  if (!org) throw new Error("Create failed.");

  if (input.ownerUserId) {
    await db.insert(orgMemberships).values({ userId: input.ownerUserId, orgId: org.id, role: "owner" });
  }

  // Seed a few default groups (C11 defaults subset).
  let sort = 0;
  for (const g of DEFAULT_SCHEDULE_GROUPS.slice(0, 5)) {
    await db.insert(scheduleGroups).values({
      orgId: org.id,
      name: g.name,
      hebrewName: g.hebrewName,
      color: g.color,
      sortOrder: sort++,
      isBuiltIn: true,
    });
  }

  const [style] = await db
    .insert(styles)
    .values({ orgId: org.id, name: "Main Board", isDefault: true, backgroundColor: "#0f172a" })
    .returning();
  if (style) {
    await db.insert(screens).values({
      orgId: org.id,
      name: "Main Screen",
      assignedStyleId: style.id,
      styleSchedules: [
        { id: `mig-${style.id}-def`, styleId: style.id, priority: 0, breakpoint: "all", rules: [{ type: "default" }] },
      ],
      resolution: "1920x1080",
    });
  }

  return org;
}

export async function listAllOrgs() {
  const rows = await db.select().from(orgs);
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export async function getOrgCounts(orgId: string) {
  const [s, st, m] = await Promise.all([
    db.select({ id: screens.id }).from(screens).where(eq(screens.orgId, orgId)),
    db.select({ id: styles.id }).from(styles).where(eq(styles.orgId, orgId)),
    db.select({ id: orgMemberships.id }).from(orgMemberships).where(eq(orgMemberships.orgId, orgId)),
  ]);
  return { screens: s.length, styles: st.length, members: m.length };
}
