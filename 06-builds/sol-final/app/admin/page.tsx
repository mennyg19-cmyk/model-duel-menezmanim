import { redirect } from "next/navigation";
import { requireAdminMe } from "@/admin/shell/load-admin";

export default async function AdminIndexPage() {
  const me = await requireAdminMe("/admin");
  const active = me.memberships.filter((m) => m.orgStatus === "active");
  redirect(`/admin/${active[0].orgSlug}`);
}
