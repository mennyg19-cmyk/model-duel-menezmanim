import { prisma } from "@/db/client";
import { DEFAULT_SCHEDULE_GROUPS } from "@/content/default-groups";

export async function cloneOrganization(sourceOrgId: string, name: string, slug: string) {
  const source = await prisma.organization.findUnique({ where: { id: sourceOrgId } });
  if (!source) throw new Error("Source organization not found");

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) throw new Error(`Slug already exists: ${slug}`);

  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        slug,
        status: "active",
        latitude: source.latitude,
        longitude: source.longitude,
        elevation: source.elevation,
        timezone: source.timezone,
        dialect: source.dialect,
        candleLightingMinutes: source.candleLightingMinutes,
        shabbatEndType: source.shabbatEndType,
        shabbatEndValue: source.shabbatEndValue,
        rabbeinu_tam_minutes: source.rabbeinu_tam_minutes,
        amPmFormat: source.amPmFormat,
        inIsrael: source.inIsrael,
        settings: source.settings,
        plan: source.plan,
      },
    });

    const groupMap = new Map<string, string>();
    const groups = await tx.scheduleGroup.findMany({ where: { orgId: sourceOrgId } });
    for (const g of groups) {
      const created = await tx.scheduleGroup.create({
        data: {
          orgId: org.id,
          name: g.name,
          hebrewName: g.hebrewName,
          color: g.color,
          active: g.active,
          sortOrder: g.sortOrder,
          isBuiltIn: g.isBuiltIn,
          autoActivationRules: g.autoActivationRules,
        },
      });
      groupMap.set(g.id, created.id);
    }

    const schedules = await tx.minyanSchedule.findMany({ where: { orgId: sourceOrgId } });
    for (const s of schedules) {
      let groupIds: string[] = [];
      if (s.scheduleGroupIds) {
        try {
          const parsed = JSON.parse(s.scheduleGroupIds) as string[];
          groupIds = parsed.map((id) => groupMap.get(id) ?? id).filter(Boolean);
        } catch {
          groupIds = [];
        }
      }
      await tx.minyanSchedule.create({
        data: {
          orgId: org.id,
          name: s.name,
          hebrewName: s.hebrewName,
          type: s.type,
          baseZman: s.baseZman,
          fixedTime: s.fixedTime,
          offset: s.offset,
          earliest: s.earliest,
          latest: s.latest,
          roundTo: s.roundTo,
          room: s.room,
          dayOfWeekMask: s.dayOfWeekMask,
          scheduleGroupIds: JSON.stringify(groupIds),
          details: s.details,
          isActive: s.isActive,
          sortOrder: s.sortOrder,
        },
      });
    }

    for (const row of await tx.announcement.findMany({ where: { orgId: sourceOrgId } })) {
      await tx.announcement.create({
        data: {
          orgId: org.id,
          title: row.title,
          titleHebrew: row.titleHebrew,
          content: row.content,
          contentHebrew: row.contentHebrew,
          scheduleRules: row.scheduleRules,
          priority: row.priority,
          isActive: row.isActive,
          startDate: row.startDate,
          endDate: row.endDate,
        },
      });
    }

    for (const row of await tx.memorial.findMany({ where: { orgId: sourceOrgId } })) {
      await tx.memorial.create({
        data: {
          orgId: org.id,
          hebrewName: row.hebrewName,
          englishName: row.englishName,
          hebrewFamilyName: row.hebrewFamilyName,
          hebrewBenBat: row.hebrewBenBat,
          hebrewYear: row.hebrewYear,
          hebrewMonth: row.hebrewMonth,
          hebrewDay: row.hebrewDay,
          hebrewAdar: row.hebrewAdar,
          civilDate: row.civilDate,
          isYahrzeit: row.isYahrzeit,
          donorInfo: row.donorInfo,
          notes: row.notes,
          relationship: row.relationship,
          isActive: row.isActive,
        },
      });
    }

    const styleMap = new Map<string, string>();
    const styles = await tx.style.findMany({
      where: { orgId: sourceOrgId },
      include: { displayObjects: true },
    });
    for (const style of styles) {
      const created = await tx.style.create({
        data: {
          orgId: org.id,
          name: style.name,
          backgroundColor: style.backgroundColor,
          backgroundMode: style.backgroundMode,
          backgroundImage: style.backgroundImage,
          backgroundGradient: style.backgroundGradient,
          backgroundTexture: style.backgroundTexture,
          backgroundFrameId: style.backgroundFrameId,
          backgroundFrameThickness: style.backgroundFrameThickness,
          canvasWidth: style.canvasWidth,
          canvasHeight: style.canvasHeight,
          isDefault: style.isDefault,
          activationRules: style.activationRules,
          sortOrder: style.sortOrder,
        },
      });
      styleMap.set(style.id, created.id);
      for (const obj of style.displayObjects) {
        await tx.displayObject.create({
          data: {
            styleId: created.id,
            name: obj.name,
            type: obj.type,
            posX: obj.posX,
            posY: obj.posY,
            width: obj.width,
            height: obj.height,
            layer: obj.layer,
            fontFamily: obj.fontFamily,
            fontSize: obj.fontSize,
            fontBold: obj.fontBold,
            fontItalic: obj.fontItalic,
            foreColor: obj.foreColor,
            backColor: obj.backColor,
            language: obj.language,
            textAlign: obj.textAlign,
            verticalAlign: obj.verticalAlign,
            lineHeight: obj.lineHeight,
            backgroundMode: obj.backgroundMode,
            backgroundImage: obj.backgroundImage,
            backgroundGradient: obj.backgroundGradient,
            backgroundTexture: obj.backgroundTexture,
            frameId: obj.frameId,
            frameThickness: obj.frameThickness,
            scrollingEnabled: obj.scrollingEnabled,
            scrollingDirection: obj.scrollingDirection,
            scrollingSpeed: obj.scrollingSpeed,
            content: obj.content,
            scheduleRules: obj.scheduleRules,
            scheduleGroupVisibility: obj.scheduleGroupVisibility,
            visible: obj.visible,
          },
        });
      }
    }

    for (const screen of await tx.screen.findMany({ where: { orgId: sourceOrgId } })) {
      await tx.screen.create({
        data: {
          orgId: org.id,
          name: screen.name,
          assignedStyleId: screen.assignedStyleId ? styleMap.get(screen.assignedStyleId) ?? null : null,
          styleSchedules: screen.styleSchedules,
          isActive: screen.isActive,
          resolution: screen.resolution,
        },
      });
    }

    return org;
  });
}

export async function reseedDemoOrganization() {
  const demo = await prisma.organization.findUnique({ where: { slug: "demo" } });
  if (!demo) throw new Error("Demo org not found");

  await prisma.$transaction(async (tx) => {
    await tx.displayObject.deleteMany({ where: { style: { orgId: demo.id } } });
    await tx.style.deleteMany({ where: { orgId: demo.id } });
    await tx.screen.deleteMany({ where: { orgId: demo.id } });
    await tx.minyanSchedule.deleteMany({ where: { orgId: demo.id } });
    await tx.scheduleGroup.deleteMany({ where: { orgId: demo.id } });
    await tx.announcement.deleteMany({ where: { orgId: demo.id } });
    await tx.memorial.deleteMany({ where: { orgId: demo.id } });
    await tx.sponsor.deleteMany({ where: { orgId: demo.id } });
    await tx.media.deleteMany({ where: { orgId: demo.id } });
    await tx.zmanimConfig.deleteMany({ where: { orgId: demo.id } });

    await tx.scheduleGroup.createMany({
      data: DEFAULT_SCHEDULE_GROUPS.map((group, index) => ({
        orgId: demo.id,
        name: group.name,
        hebrewName: group.hebrewName,
        color: group.color,
        active: true,
        sortOrder: index,
        isBuiltIn: true,
      })),
    });

    const style = await tx.style.create({
      data: {
        name: "Default Style",
        orgId: demo.id,
        backgroundColor: "#0f172a",
        backgroundMode: "solid",
        canvasWidth: 1920,
        canvasHeight: 1080,
        isDefault: true,
        activationRules: JSON.stringify([{ type: "default" }]),
        sortOrder: 0,
      },
    });

    await tx.screen.create({
      data: {
        id: "main",
        name: "Main Display",
        orgId: demo.id,
        assignedStyleId: style.id,
        styleSchedules: JSON.stringify([
          {
            id: "default-full",
            styleId: style.id,
            breakpoint: "all",
            rules: [{ type: "default" }],
            priority: 0,
          },
        ]),
        isActive: true,
        resolution: "1920x1080",
      },
    });

    await tx.minyanSchedule.create({
      data: {
        orgId: demo.id,
        name: "Weekday Shacharit",
        hebrewName: "שחרית",
        type: "shacharit",
        fixedTime: "07:00",
        dayOfWeekMask: "1111100",
        isActive: true,
        sortOrder: 0,
      },
    });

    await tx.announcement.create({
      data: {
        orgId: demo.id,
        title: "Reseeded notice",
        content: "Demo content restored by super-admin reseed.",
        priority: 1,
        isActive: true,
      },
    });
  });

  return { orgId: demo.id, slug: "demo" };
}
