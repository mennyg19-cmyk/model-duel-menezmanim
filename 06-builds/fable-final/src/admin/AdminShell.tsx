"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { adminNav } from "./nav";
import { useAdminTheme } from "./AdminThemeProvider";
import { TutorialLauncher } from "./tutorial/TutorialLauncher";
import { t, type UiLocale } from "@/i18n";
import { LocaleToggle } from "@/i18n/LocaleToggle";

export interface ShellMembership {
  orgId: string;
  orgSlug: string;
  role: string;
}

export function AdminShell({
  orgSlug,
  orgName,
  email,
  isSuperAdmin,
  memberships,
  uiLocale,
  children,
}: {
  orgSlug: string;
  orgName: string;
  email: string;
  isSuperAdmin: boolean;
  memberships: ShellMembership[];
  uiLocale: UiLocale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { themeId, setThemeId } = useAdminTheme();
  const items = adminNav(orgSlug);

  function switchOrg(nextSlug: string) {
    if (nextSlug === orgSlug) return;
    localStorage.setItem("menez-last-org", nextSlug);
    const rest = pathname.replace(/^\/admin\/[^/]+/, "") || "";
    router.push(`/admin/${nextSlug}${rest}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        data-tutorial="admin-sidebar"
        style={{
          width: 220,
          background: "var(--admin-nav)",
          borderRight: "1px solid var(--admin-border)",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ padding: "4px 8px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <strong style={{ fontSize: 15 }}>MenEZmanim</strong>
            <div style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>{orgName}</div>
          </div>
          <TutorialLauncher label="?" />
        </div>
        <label style={{ fontSize: 11, color: "var(--admin-muted)", padding: "0 8px" }}>
          {t(uiLocale, "admin.org")}
          <select
            value={orgSlug}
            onChange={(e) => switchOrg(e.target.value)}
            data-testid="org-switcher"
            data-tutorial="org-switcher"
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              marginBottom: 12,
              padding: "8px",
              borderRadius: 6,
              border: "1px solid var(--admin-border)",
              background: "var(--admin-surface)",
              color: "var(--admin-text)",
            }}
          >
            {memberships.map((m) => (
              <option key={m.orgId} value={m.orgSlug}>
                {m.orgSlug} ({m.role})
              </option>
            ))}
          </select>
        </label>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {items.map((item) => {
            const active =
              item.section === "dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.section}
                href={item.href}
                data-tutorial={`nav-${item.section}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: active ? "var(--admin-accent-text)" : "var(--admin-text)",
                  background: active ? "var(--admin-accent)" : "transparent",
                  fontSize: 14,
                }}
              >
                {t(uiLocale, item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div style={{ fontSize: 12, color: "var(--admin-muted)", padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <LocaleToggle current={uiLocale} />
          </div>
          {email}
          {isSuperAdmin ? " · super" : ""}
          {isSuperAdmin ? (
            <div style={{ marginTop: 8 }}>
              <Link href="/admin/super" style={{ color: "var(--admin-accent)", fontSize: 12 }}>
                {t(uiLocale, "admin.super")}
              </Link>
            </div>
          ) : null}
          <div style={{ marginTop: 8 }}>
            {t(uiLocale, "admin.theme")}:{" "}
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value as typeof themeId)}
              style={{
                maxWidth: 120,
                background: "var(--admin-surface)",
                color: "var(--admin-text)",
                border: "1px solid var(--admin-border)",
                borderRadius: 4,
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="mono-light">Mono light</option>
              <option value="mono-dark">Mono dark</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            style={{
              marginTop: 10,
              background: "transparent",
              border: "1px solid var(--admin-border)",
              color: "var(--admin-text)",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {t(uiLocale, "admin.logout")}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 24, overflow: "auto" }}>{children}</main>
    </div>
  );
}
