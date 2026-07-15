"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { t, type AdminLocale } from "@/admin/i18n/admin-strings";
import { ThemePickerAdmin } from "@/admin/theme/ThemePickerAdmin";
import type { AdminThemeCustom, AdminThemeId } from "@/admin/theme/admin-themes";
import { TutorialLauncher } from "@/admin/tutorial/TutorialLauncher";
import { LogoutButton } from "./LogoutButton";
import { rewriteOrgPath, sectionHref } from "./nav";
import type { AdminMembership, AdminSection } from "./types";

const NAV: { id: AdminSection; labelKey: Parameters<typeof t>[1]; phaseReady: boolean }[] = [
  { id: "dashboard", labelKey: "nav.dashboard", phaseReady: true },
  { id: "schedules", labelKey: "nav.schedules", phaseReady: true },
  { id: "content", labelKey: "nav.content", phaseReady: true },
  { id: "editor", labelKey: "nav.editor", phaseReady: true },
  { id: "screens", labelKey: "nav.screens", phaseReady: true },
  { id: "members", labelKey: "nav.members", phaseReady: true },
  { id: "settings", labelKey: "nav.settings", phaseReady: true },
  { id: "import", labelKey: "nav.import", phaseReady: true },
];

function detectSection(pathname: string): AdminSection {
  if (pathname.includes("/screens")) return "screens";
  if (pathname.includes("/editor")) return "editor";
  if (pathname.includes("/schedules")) return "schedules";
  if (pathname.includes("/content")) return "content";
  if (pathname.includes("/members")) return "members";
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/import")) return "import";
  return "dashboard";
}

export function AdminShell({
  orgId,
  orgSlug,
  orgName,
  memberships,
  userName,
  section,
  locale = "en",
  themeId = "dark",
  themeCustom,
  completedTutorial = [],
  children,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
  memberships: AdminMembership[];
  userName: string;
  section?: AdminSection;
  locale?: AdminLocale;
  themeId?: AdminThemeId;
  themeCustom?: AdminThemeCustom;
  completedTutorial?: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = section ?? detectSection(pathname);
  const activeOrgs = memberships.filter((m) => m.orgStatus === "active");
  const [completed, setCompleted] = useState(completedTutorial);
  const dir = locale === "he" ? "rtl" : "ltr";
  const labels = useMemo(
    () => ({
      org: t(locale, "nav.org"),
    }),
    [locale],
  );

  function switchOrg(nextSlug: string) {
    if (nextSlug === orgSlug) return;
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    router.push(rewriteOrgPath(pathname, search, nextSlug));
  }

  return (
    <div className="adm-shell" dir={dir}>
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span className="adm-brandMark">מ</span>
          <div>
            <strong>MenEZmanim</strong>
            <small>{orgName}</small>
          </div>
        </div>
        <label className="adm-orgSwitch">
          <span>{labels.org}</span>
          <select
            aria-label={labels.org}
            value={orgSlug}
            onChange={(event) => switchOrg(event.target.value)}
          >
            {activeOrgs.map((m) => (
              <option key={m.orgId} value={m.orgSlug}>
                {m.orgName}
              </option>
            ))}
          </select>
        </label>
        <nav className="adm-nav" aria-label="Admin sections">
          {NAV.map((item) => {
            const href = sectionHref(orgSlug, item.id);
            const isActive = current === item.id;
            const label = t(locale, item.labelKey);
            if (!item.phaseReady) {
              return (
                <span key={item.id} className="adm-navLink adm-navSoon" title="Later phase">
                  {label}
                </span>
              );
            }
            return (
              <Link
                key={item.id}
                href={href}
                className={isActive ? "adm-navLink adm-navActive" : "adm-navLink"}
                data-tutorial={item.id === "editor" ? "editor-entry" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <ThemePickerAdmin orgId={orgId} initialId={themeId} initialCustom={themeCustom} />
        <TutorialLauncher
          orgId={orgId}
          orgSlug={orgSlug}
          completed={completed}
          onCompleted={setCompleted}
        />
        <div className="adm-sideFoot">
          <span className="adm-user">{userName}</span>
          <LogoutButton />
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
