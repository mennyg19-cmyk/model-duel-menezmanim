import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { loadShellPrefs, pickMembership, requireAdminMe } from "@/admin/shell/load-admin";
import { ScheduleWorkspace } from "./schedule-workspace";

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const params = await searchParams;
  const me = await requireAdminMe("/admin/schedules");
  const active = me.memberships.filter((m) => m.orgStatus === "active");
  const selected =
    active.find((m) => m.orgSlug === params.org || m.orgId === params.org) ?? active[0];
  const membership = pickMembership(me, selected.orgSlug);
  const prefs = await loadShellPrefs(membership.orgId);

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="schedules"
        locale={prefs.locale}
        themeId={prefs.themeId}
        themeCustom={prefs.themeCustom}
        completedTutorial={prefs.completedTutorial}
      >
        <div data-tutorial="schedules-workspace">
          <ScheduleWorkspace orgId={membership.orgId} orgName={membership.orgName} orgSlug={membership.orgSlug} />
        </div>
      </AdminShell>
    </Suspense>
  );
}
