import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { ContentHub } from "@/admin/content/ContentHub";

export const dynamic = "force-dynamic";

/** P5 — Content Hub. */
export default async function ContentPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <ContentHub orgId={org.id} orgSlug={org.slug} />;
}
