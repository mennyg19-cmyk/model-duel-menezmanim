import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { ScreensManager } from "@/admin/screens/ScreensManager";

export const dynamic = "force-dynamic";

/** P7 — Screens & Styles. */
export default async function ScreensPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <ScreensManager orgId={org.id} orgSlug={org.slug} />;
}
