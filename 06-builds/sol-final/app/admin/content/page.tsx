import { Suspense } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";
import { loadShellPrefs, pickMembership, requireAdminMe } from "@/admin/shell/load-admin";
import { ContentHub } from "./content-hub";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const me = await requireAdminMe("/admin/content");
  const active = me.memberships.filter((m) => m.orgStatus === "active");
  const selected =
    active.find((m) => m.orgSlug === params.org || m.orgId === params.org) ?? active[0];
  const membership = pickMembership(me, selected.orgSlug);
  const prefs = await loadShellPrefs(membership.orgId);

  const tab =
    params.tab === "memorials" ||
    params.tab === "sponsors" ||
    params.tab === "media" ||
    params.tab === "notes" ||
    params.tab === "announcements"
      ? params.tab
      : "announcements";

  return (
    <Suspense fallback={<main className="adm-shell">Loading…</main>}>
      <AdminShell
        orgId={membership.orgId}
        orgSlug={membership.orgSlug}
        orgName={membership.orgName}
        memberships={me.memberships}
        userName={me.name}
        section="content"
        locale={prefs.locale}
        themeId={prefs.themeId}
        themeCustom={prefs.themeCustom}
        completedTutorial={prefs.completedTutorial}
      >
        <div data-tutorial="content-hub">
          <ContentHub
            orgId={membership.orgId}
            orgName={membership.orgName}
            orgSlug={membership.orgSlug}
            initialTab={tab}
          />
        </div>
      </AdminShell>
    </Suspense>
  );
}
