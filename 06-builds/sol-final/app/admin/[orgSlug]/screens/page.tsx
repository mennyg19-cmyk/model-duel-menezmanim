import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { ScreenManager } from "@/admin/screens/ScreenManager";
import { loadDashboardData, loadShellPrefs, pickMembership, requireAdminMe } from "@/admin/shell/load-admin";

export default async function AdminScreensPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const me = await requireAdminMe(`/admin/${orgSlug}/screens`);
  const membership = pickMembership(me, orgSlug);
  const [data, prefs] = await Promise.all([
    loadDashboardData(membership.orgId),
    loadShellPrefs(membership.orgId),
  ]);

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="screens"
        locale={prefs.locale}
        themeId={prefs.themeId}
        themeCustom={prefs.themeCustom}
        completedTutorial={prefs.completedTutorial}
      >
        <div data-tutorial="screens-list">
          <ScreenManager
            orgId={membership.orgId}
            orgSlug={membership.orgSlug}
            initialScreens={data.screens}
            initialStyles={data.styles}
          />
        </div>
      </AdminShell>
    </Suspense>
  );
}
