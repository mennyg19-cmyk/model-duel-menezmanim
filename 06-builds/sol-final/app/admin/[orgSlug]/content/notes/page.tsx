import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../../../src/auth/session";
import { getMeByUserId } from "../../../../../src/domain/identity";
import { ContentHub } from "../../../content/content-hub";

export default async function OrgNotesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const me = await getMeByUserId(session.id);
  if (!me) redirect("/onboarding");

  const { orgSlug } = await params;
  const membership = me.memberships.find(
    (m) => m.orgSlug === orgSlug && m.orgStatus === "active",
  );
  if (!membership && !me.isSuperAdmin) {
    redirect("/admin/content");
  }

  const orgId = membership?.orgId;
  const orgName = membership?.orgName ?? orgSlug;
  if (!orgId) {
    // Super-admin without membership: resolve via demo fallback not allowed — send to content picker
    redirect("/admin/content");
  }

  return (
    <main className="hub-page">
      <div className="hub-topnav">
        <Link href="/admin">Admin</Link>
        <Link href={`/admin/content?org=${orgSlug}`}>Full content hub</Link>
      </div>
      <ContentHub orgId={orgId} orgName={orgName} orgSlug={orgSlug} initialTab="notes" />
    </main>
  );
}
