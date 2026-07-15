import type { AdminMembership, AdminSection } from "./types";

const PLAN_LIMITS: Record<string, { screens: number | null; styles: number | null }> = {
  free: { screens: 1, styles: 3 },
  basic: { screens: 3, styles: 10 },
  pro: { screens: 10, styles: 50 },
  enterprise: { screens: null, styles: null },
};

export function planLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function sectionHref(orgSlug: string, section: AdminSection): string {
  switch (section) {
    case "dashboard":
      return `/admin/${orgSlug}`;
    case "schedules":
      return `/admin/schedules?org=${orgSlug}`;
    case "content":
      return `/admin/content?org=${orgSlug}`;
    case "editor":
      return `/admin/${orgSlug}/editor`;
    case "screens":
      return `/admin/${orgSlug}/screens`;
    case "members":
      return `/admin/${orgSlug}/members`;
    case "settings":
      return `/admin/${orgSlug}/settings`;
    case "import":
      return `/admin/${orgSlug}/import`;
  }
}

export function rewriteOrgPath(pathname: string, search: string, nextSlug: string): string {
  const match = pathname.match(/^\/admin\/([^/]+)(\/.*)?$/);
  if (match && match[1] !== "schedules" && match[1] !== "content" && match[1] !== "super") {
    const rest = match[2] ?? "";
    return `/admin/${nextSlug}${rest}${search}`;
  }
  if (pathname.startsWith("/admin/schedules") || pathname.startsWith("/admin/content")) {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    params.set("org", nextSlug);
    return `${pathname}?${params.toString()}`;
  }
  return `/admin/${nextSlug}`;
}

export function activeMemberships(memberships: AdminMembership[]) {
  return memberships.filter((m) => m.orgStatus === "active");
}

export function publicShowUrl(orgSlug: string, screenId: string) {
  return `/show/${orgSlug}/${screenId}`;
}

export function parseResolution(value: string): { width: number; height: number } | null {
  const match = value.trim().match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return null;
  return { width, height };
}

export function formatResolution(width: number, height: number) {
  return `${Math.round(width)}x${Math.round(height)}`;
}
