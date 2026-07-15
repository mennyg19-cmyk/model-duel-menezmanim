import { redirect } from "next/navigation";
import { getActor } from "@/auth/actor";
import { AdminThemeProvider } from "@/admin/AdminThemeProvider";
import { SuperAdminConsole } from "@/admin/super/SuperAdminConsole";

export const dynamic = "force-dynamic";

/** R6 — super-admin console (SA.1–SA.9). */
export default async function SuperAdminPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!actor.isSuperAdmin) redirect(actor.memberships[0] ? `/admin/${actor.memberships[0].orgSlug}` : "/");

  return (
    <AdminThemeProvider>
      <div style={{ minHeight: "100vh", padding: 24, background: "var(--admin-bg)", color: "var(--admin-text)" }}>
        <SuperAdminConsole />
      </div>
    </AdminThemeProvider>
  );
}
