import { redirect } from "next/navigation";
import { getSessionUser } from "@/auth/session";
import { getMeByUserId } from "@/domain/identity";
import { SuperAdminConsole } from "@/admin/super/SuperAdminConsole";
import { LogoutButton } from "@/admin/shell/LogoutButton";
import Link from "next/link";

export default async function SuperAdminPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/admin/super");
  const me = await getMeByUserId(session.id);
  if (!me?.isSuperAdmin) redirect("/admin");

  return (
    <main className="adm-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="adm-main">
        <div className="adm-inlineActions" style={{ padding: "1rem 1.5rem 0" }}>
          <Link className="button button-secondary" href="/admin">
            ← Admin
          </Link>
          <LogoutButton />
        </div>
        <SuperAdminConsole />
      </div>
    </main>
  );
}
