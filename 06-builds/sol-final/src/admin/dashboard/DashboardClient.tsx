"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { planLimits, publicShowUrl, sectionHref } from "@/admin/shell/nav";
import type { DashboardStats, ScreenSummary, StyleSummary } from "@/admin/shell/types";
import { LivePreviewWidget } from "./LivePreviewWidget";
import { QuickAddModals } from "./QuickAddModals";

export function DashboardClient({
  orgId,
  orgSlug,
  orgName,
  stats,
  screens,
  styles,
  primaryScreenId,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
  stats: DashboardStats;
  screens: ScreenSummary[];
  styles: StyleSummary[];
  primaryScreenId: string | null;
}) {
  const router = useRouter();
  const limits = planLimits(stats.plan);
  const liveScreen = primaryScreenId ?? screens[0]?.id ?? null;
  const defaultStyleId = styles.find((s) => s.isDefault)?.id ?? styles[0]?.id ?? null;

  const cards: { label: string; value: number; href: string }[] = [
    { label: "Davening times", value: stats.schedules, href: sectionHref(orgSlug, "schedules") },
    { label: "Announcements", value: stats.announcements, href: `${sectionHref(orgSlug, "content")}&tab=announcements` },
    { label: "Yahrzeits", value: stats.memorials, href: `${sectionHref(orgSlug, "content")}&tab=memorials` },
    { label: "Sponsors", value: stats.sponsors, href: `${sectionHref(orgSlug, "content")}&tab=sponsors` },
    { label: "Members", value: stats.members, href: sectionHref(orgSlug, "members") },
    { label: "Styles", value: stats.styles, href: sectionHref(orgSlug, "screens") },
    { label: "Screens", value: stats.screens, href: sectionHref(orgSlug, "screens") },
  ];

  return (
    <div className="adm-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Dashboard</p>
          <h1>{orgName}</h1>
        </div>
        <div className="adm-inlineActions">
          {liveScreen ? (
            <a
              className="button"
              href={publicShowUrl(orgSlug, liveScreen)}
              target="_blank"
              rel="noreferrer"
              data-tutorial="dashboard-live"
            >
              Live Display
            </a>
          ) : null}
          <Link className="button button-secondary" href={sectionHref(orgSlug, "editor")}>
            Open Editor
          </Link>
        </div>
      </header>

      <section className="adm-statGrid" aria-label="Organization statistics" data-tutorial="dashboard-stats">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="adm-statCard">
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </Link>
        ))}
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Plan & usage</h2>
          <span className="adm-badge">{stats.plan}</span>
        </div>
        <div className="adm-usageGrid">
          <div>
            <span>Screens</span>
            <strong>
              {stats.screens}
              {limits.screens != null ? ` / ${limits.screens}` : " / ∞"}
            </strong>
          </div>
          <div>
            <span>Styles</span>
            <strong>
              {stats.styles}
              {limits.styles != null ? ` / ${limits.styles}` : " / ∞"}
            </strong>
          </div>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Quick actions</h2>
        </div>
        <div className="adm-inlineActions">
          <Link className="button button-secondary" href={sectionHref(orgSlug, "schedules")}>
            Schedules
          </Link>
          <Link className="button button-secondary" href={sectionHref(orgSlug, "content")}>
            Content
          </Link>
          <Link className="button button-secondary" href={sectionHref(orgSlug, "screens")}>
            Screens & Styles
          </Link>
          <Link className="button button-secondary" href={sectionHref(orgSlug, "editor")}>
            Visual Editor
          </Link>
          {liveScreen ? (
            <a className="button button-secondary" href={publicShowUrl(orgSlug, liveScreen)} target="_blank" rel="noreferrer">
              Open live board
            </a>
          ) : null}
        </div>
      </section>

      <QuickAddModals orgId={orgId} onCreated={() => router.refresh()} />

      <LivePreviewWidget
        orgSlug={orgSlug}
        screens={screens.map((s) => ({ id: s.id, name: s.name }))}
        defaultStyleId={defaultStyleId}
      />
    </div>
  );
}
