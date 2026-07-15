import { loadOrgBySlug } from "@/auth/org-access";
import { ScheduleEditor } from "@/admin/schedules/ScheduleEditor";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** P4 — Schedules / Minyanim admin. */
export default async function SchedulesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <ScheduleEditor orgId={org.id} />;
}
