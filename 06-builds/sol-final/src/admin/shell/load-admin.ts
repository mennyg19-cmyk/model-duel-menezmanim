import { notFound, redirect } from "next/navigation";
import type { AdminLocale } from "@/admin/i18n/admin-strings";
import type { AdminThemeCustom, AdminThemeId } from "@/admin/theme/admin-themes";
import { getSessionUser } from "@/auth/session";
import { getMeByUserId, type MembershipSummary, type MeResponse } from "@/domain/identity";
import { prisma } from "@/db/client";
import { parseSettingsBlob } from "@/domain/org-settings";

export async function loadShellPrefs(orgId: string): Promise<{
  locale: AdminLocale;
  themeId: AdminThemeId;
  themeCustom?: AdminThemeCustom;
  completedTutorial: string[];
}> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const settings = parseSettingsBlob(org?.settings);
  return {
    locale: (settings.locale?.uiLocale as AdminLocale) ?? "en",
    themeId: (settings.adminTheme?.id as AdminThemeId) ?? "dark",
    themeCustom: settings.adminTheme?.custom,
    completedTutorial: settings.tutorial?.completedChapters ?? [],
  };
}

export async function requireAdminMe(nextPath: string): Promise<MeResponse> {
  const session = await getSessionUser();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const me = await getMeByUserId(session.id);
  if (!me) redirect("/onboarding");
  const active = me.memberships.filter((m) => m.orgStatus === "active");
  if (active.length === 0) redirect("/onboarding");
  return me;
}

export function pickMembership(me: MeResponse, orgSlug: string): MembershipSummary {
  const active = me.memberships.filter((m) => m.orgStatus === "active");
  const selected = active.find((m) => m.orgSlug === orgSlug || m.orgId === orgSlug);
  if (!selected) notFound();
  return selected;
}

export async function loadDashboardData(orgId: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) notFound();

  const [schedules, announcements, memorials, sponsors, members, styles, screens] = await Promise.all([
    prisma.minyanSchedule.count({ where: { orgId } }),
    prisma.announcement.count({ where: { orgId } }),
    prisma.memorial.count({ where: { orgId } }),
    prisma.sponsor.count({ where: { orgId } }),
    prisma.orgMembership.count({ where: { orgId } }),
    prisma.style.findMany({
      where: { orgId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { displayObjects: true } } },
    }),
    prisma.screen.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
  ]);

  return {
    plan: org.plan,
    stats: {
      schedules,
      announcements,
      memorials,
      sponsors,
      members,
      styles: styles.length,
      screens: screens.length,
      plan: org.plan,
    },
    styles: styles.map((s) => ({
      id: s.id,
      name: s.name,
      isDefault: s.isDefault,
      canvasWidth: s.canvasWidth,
      canvasHeight: s.canvasHeight,
      backgroundColor: s.backgroundColor,
      backgroundMode: s.backgroundMode,
      backgroundGradient: s.backgroundGradient,
      backgroundImage: s.backgroundImage,
      objectCount: s._count.displayObjects,
    })),
    screens: screens.map((s) => ({
      id: s.id,
      name: s.name,
      resolution: s.resolution,
      isActive: s.isActive,
      assignedStyleId: s.assignedStyleId,
      lastSeenAt: s.lastSeenAt?.toISOString() ?? null,
      styleSchedules: s.styleSchedules ? JSON.parse(s.styleSchedules) : null,
    })),
  };
}
