import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { MembersManager } from "@/admin/members/MembersManager";
import { pickMembership, requireAdminMe } from "@/admin/shell/load-admin";
import { prisma } from "@/db/client";
import { parseSettingsBlob } from "@/domain/org-settings";
import type { AdminLocale } from "@/admin/i18n/admin-strings";
import type { AdminThemeId } from "@/admin/theme/admin-themes";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const me = await requireAdminMe(`/admin/${orgSlug}/members`);
  const membership = pickMembership(me, orgSlug);
  if (!me.isSuperAdmin && !["owner", "admin"].includes(membership.role)) {
    return (
      <Suspense>
        <AdminShell
          orgId={membership.orgId}
          orgSlug={membership.orgSlug}
          orgName={membership.orgName}
          memberships={me.memberships}
          userName={me.name}
          section="members"
        >
          <div className="adm-page">
            <p className="adm-error">Owner or admin role required to manage members.</p>
          </div>
        </AdminShell>
      </Suspense>
    );
  }

  const org = await prisma.organization.findUnique({ where: { id: membership.orgId } });
  const settings = parseSettingsBlob(org?.settings);

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="members"
        locale={(settings.locale?.uiLocale as AdminLocale) ?? "en"}
        themeId={(settings.adminTheme?.id as AdminThemeId) ?? "dark"}
        themeCustom={settings.adminTheme?.custom}
        completedTutorial={settings.tutorial?.completedChapters ?? []}
      >
        <MembersManager orgId={membership.orgId} />
      </AdminShell>
    </Suspense>
  );
}
