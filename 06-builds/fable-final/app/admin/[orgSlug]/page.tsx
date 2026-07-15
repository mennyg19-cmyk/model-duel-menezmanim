import { Dashboard } from "@/admin/Dashboard";
import { loadDashboardStats } from "@/admin/load-dashboard";

export const dynamic = "force-dynamic";

/** P3 dashboard. */
export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const initial = await loadDashboardStats(orgSlug);
  return <Dashboard orgSlug={orgSlug} initial={initial} />;
}
