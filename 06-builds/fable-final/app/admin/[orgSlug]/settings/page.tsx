import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { SettingsPage } from "@/admin/settings/SettingsPage";

export const dynamic = "force-dynamic";

/** P9 — Settings. */
export default async function OrgSettingsRoute({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <SettingsPage orgId={org.id} />;
}
