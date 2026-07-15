import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { ImportExportHub } from "@/admin/import-export/ImportExportHub";
import { loadShellPrefs, pickMembership, requireAdminMe } from "@/admin/shell/load-admin";

export default async function AdminImportPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const me = await requireAdminMe(`/admin/${orgSlug}/import`);
  const membership = pickMembership(me, orgSlug);
  const prefs = await loadShellPrefs(membership.orgId);

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="import"
        locale={prefs.locale}
        themeId={prefs.themeId}
        themeCustom={prefs.themeCustom}
        completedTutorial={prefs.completedTutorial}
      >
        <ImportExportHub orgId={membership.orgId} orgSlug={membership.orgSlug} />
      </AdminShell>
    </Suspense>
  );
}
