import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { SettingsClient } from "@/admin/settings/SettingsClient";
import { pickMembership, requireAdminMe } from "@/admin/shell/load-admin";
import { prisma } from "@/db/client";
import { orgSettingsDto, parseSettingsBlob } from "@/domain/org-settings";
import type { AdminLocale } from "@/admin/i18n/admin-strings";
import type { AdminThemeId } from "@/admin/theme/admin-themes";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const me = await requireAdminMe(`/admin/${orgSlug}/settings`);
  const membership = pickMembership(me, orgSlug);
  const org = await prisma.organization.findUnique({ where: { id: membership.orgId } });
  if (!org) return null;
  const configs = await prisma.zmanimConfig.findMany({
    where: { orgId: membership.orgId },
    orderBy: { zmanType: "asc" },
  });
  const initial = orgSettingsDto(org, configs);
  const settings = parseSettingsBlob(org.settings);

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="settings"
        locale={(settings.locale?.uiLocale as AdminLocale) ?? "en"}
        themeId={(settings.adminTheme?.id as AdminThemeId) ?? "dark"}
        themeCustom={settings.adminTheme?.custom}
        completedTutorial={settings.tutorial?.completedChapters ?? []}
      >
        <SettingsClient orgId={membership.orgId} initial={initial} />
      </AdminShell>
    </Suspense>
  );
}
