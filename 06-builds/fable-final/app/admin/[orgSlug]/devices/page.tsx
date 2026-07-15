import { redirect } from "next/navigation";
import { loadOrgBySlug } from "@/auth/org-access";
import { DevicesClient } from "@/admin/devices/DevicesClient";

export const dynamic = "force-dynamic";

/** Sync device pairing for hybrid desktop (Phase 12). */
export default async function DevicesRoute({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await loadOrgBySlug(orgSlug);
  if (!org) redirect("/admin");
  return <DevicesClient orgId={org.id} />;
}
