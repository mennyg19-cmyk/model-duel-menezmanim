"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminNav } from "./nav";
import { planLimits } from "./plan-limits";
import { DashboardBoardPreview } from "./DashboardBoardPreview";
import { QuickAddModals } from "./QuickAddModals";
import { t } from "@/i18n";

export interface DashboardStats {
  orgId: string;
  orgSlug: string;
  orgName: string;
  plan: string;
  status: string;
  counts: {
    schedules: number;
    announcements: number;
    memorials: number;
    sponsors: number;
    members: number;
    styles: number;
    screens: number;
  };
  screens: { id: string; name: string }[];
  primaryScreenId: string | null;
}

export function Dashboard({ orgSlug, initial }: { orgSlug: string; initial: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initial);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/org/by-slug/${encodeURIComponent(orgSlug)}/dashboard`);
    if (!res.ok) {
      setError("Could not load dashboard.");
      return;
    }
    setStats((await res.json()) as DashboardStats);
    setError(null);
  }, [orgSlug]);

  useEffect(() => {
    setStats(initial);
  }, [initial]);

  if (error) return <p style={{ color: "var(--admin-danger)" }}>{error}</p>;

  const limits = planLimits(stats.plan);
  const liveHref = stats.primaryScreenId
    ? `/show/${stats.orgSlug}/${stats.primaryScreenId}`
    : `/show/${stats.orgSlug}`;
  const nav = adminNav(orgSlug).filter((n) => n.section !== "dashboard" && n.section !== "theme");

  const cards: { label: string; value: number; href: string }[] = [
    { label: "Davening times", value: stats.counts.schedules, href: `/admin/${orgSlug}/schedules` },
    { label: "Announcements", value: stats.counts.announcements, href: `/admin/${orgSlug}/content` },
    { label: "Yahrzeits", value: stats.counts.memorials, href: `/admin/${orgSlug}/content` },
    { label: "Sponsors", value: stats.counts.sponsors, href: `/admin/${orgSlug}/content` },
    { label: "Members", value: stats.counts.members, href: `/admin/${orgSlug}/members` },
    { label: "Styles", value: stats.counts.styles, href: `/admin/${orgSlug}/screens` },
    { label: "Screens", value: stats.counts.screens, href: `/admin/${orgSlug}/screens` },
  ];

  return (
    <div>
      <header style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline", marginBottom: 20 }}>
        <h1 style={{ margin: 0, flex: 1 }}>Dashboard</h1>
        <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>
          Plan: <strong style={{ color: "var(--admin-text)" }}>{limits.label}</strong>
          {" · "}
          screens {stats.counts.screens}/{limits.screens}
          {" · "}
          styles {stats.counts.styles}/{limits.styles}
          {" · "}
          members {stats.counts.members}/{limits.members}
          {stats.status !== "active" ? ` · status: ${stats.status}` : ""}
        </span>
        <a
          href={liveHref}
          target="_blank"
          rel="noreferrer"
          data-testid="live-display"
          data-tutorial="live-display"
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            background: "var(--admin-accent)",
            color: "var(--admin-accent-text)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Live Display
        </a>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: 10,
              padding: 14,
              textDecoration: "none",
              color: "var(--admin-text)",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>{c.label}</div>
          </Link>
        ))}
      </div>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Quick actions</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {nav.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--admin-border)",
                background: "var(--admin-surface)",
                color: "var(--admin-text)",
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              {t("en", item.labelKey)}
            </Link>
          ))}
        </div>
      </section>

      <QuickAddModals orgId={stats.orgId} onCreated={() => void load()} />

      <DashboardBoardPreview orgSlug={orgSlug} screens={stats.screens} />
    </div>
  );
}
