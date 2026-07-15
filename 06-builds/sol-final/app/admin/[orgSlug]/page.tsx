import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { DashboardClient } from "@/admin/dashboard/DashboardClient";
import { loadDashboardData, loadShellPrefs, pickMembership, requireAdminMe } from "@/admin/shell/load-admin";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const me = await requireAdminMe(`/admin/${orgSlug}`);
  const membership = pickMembership(me, orgSlug);
  const [data, prefs] = await Promise.all([
    loadDashboardData(membership.orgId),
    loadShellPrefs(membership.orgId),
  ]);
  const primaryScreen = data.screens.find((s) => s.isActive)?.id ?? data.screens[0]?.id ?? null;

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="dashboard"
        locale={prefs.locale}
        themeId={prefs.themeId}
        themeCustom={prefs.themeCustom}
        completedTutorial={prefs.completedTutorial}
      >
        <DashboardClient
          orgId={membership.orgId}
          orgSlug={membership.orgSlug}
          orgName={membership.orgName}
          stats={data.stats}
          screens={data.screens}
          styles={data.styles}
          primaryScreenId={primaryScreen}
        />
      </AdminShell>
    </Suspense>
  );
}
