import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { NotesPanel } from "@/admin/content/NotesPanel";

export const dynamic = "force-dynamic";

/** P5.6 — daily notes hybrid. */
export default async function NotesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <NotesPanel orgId={org.id} orgSlug={org.slug} />;
}
