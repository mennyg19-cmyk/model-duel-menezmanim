import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { MembersManager } from "@/admin/members/MembersManager";

export const dynamic = "force-dynamic";

/** P8 — Members. */
export default async function MembersPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <MembersManager orgId={org.id} orgSlug={org.slug} />;
}
