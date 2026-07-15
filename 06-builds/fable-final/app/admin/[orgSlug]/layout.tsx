import { redirect } from "next/navigation";
import { AuthError } from "@/auth/guards";
import { getActor } from "@/auth/actor";
import { requireOrgBySlug } from "@/auth/org-access";
import { AdminShell } from "@/admin/AdminShell";
import { AdminThemeProvider } from "@/admin/AdminThemeProvider";
import { TutorialProvider } from "@/admin/tutorial/TutorialProvider";
import { getUiLocale } from "@/i18n/get-locale";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminOrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.memberships.length === 0) redirect("/onboarding");
  const uiLocale = await getUiLocale();

  try {
    const { org } = await requireOrgBySlug(orgSlug, "viewer");
    return (
      <AdminThemeProvider>
        <TutorialProvider>
          <AdminShell
            orgSlug={org.slug}
            orgName={org.name}
            email={actor.email}
            isSuperAdmin={actor.isSuperAdmin}
            memberships={actor.memberships}
            uiLocale={uiLocale}
          >
            {children}
          </AdminShell>
        </TutorialProvider>
      </AdminThemeProvider>
    );
  } catch (err) {
    if (err instanceof AuthError) redirect(`/admin/${actor.memberships[0]!.orgSlug}`);
    throw err;
  }
}
