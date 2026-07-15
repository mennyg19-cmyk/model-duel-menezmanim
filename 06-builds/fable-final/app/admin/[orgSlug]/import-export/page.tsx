import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { ImportExportHub } from "@/admin/import-export/ImportExportHub";

export const dynamic = "force-dynamic";

/** P10 — Import / Export. */
export default async function ImportExportPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <ImportExportHub orgId={org.id} orgSlug={org.slug} />;
}
