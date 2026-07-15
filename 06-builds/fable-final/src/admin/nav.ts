export type AdminSection =
  | "dashboard"
  | "schedules"
  | "content"
  | "editor"
  | "screens"
  | "members"
  | "settings"
  | "devices"
  | "import-export"
  | "tutorial"
  | "theme";

export interface AdminNavItem {
  section: AdminSection;
  href: string;
  labelKey: string;
  phaseNote?: string;
}

export function adminNav(orgSlug: string): AdminNavItem[] {
  const base = `/admin/${orgSlug}`;
  return [
    { section: "dashboard", href: base, labelKey: "admin.nav.dashboard" },
    { section: "schedules", href: `${base}/schedules`, labelKey: "admin.nav.schedules" },
    { section: "content", href: `${base}/content`, labelKey: "admin.nav.content" },
    { section: "editor", href: `${base}/editor`, labelKey: "admin.nav.editor" },
    { section: "screens", href: `${base}/screens`, labelKey: "admin.nav.screens" },
    { section: "members", href: `${base}/members`, labelKey: "admin.nav.members" },
    { section: "settings", href: `${base}/settings`, labelKey: "admin.nav.settings" },
    { section: "devices", href: `${base}/devices`, labelKey: "admin.nav.devices" },
    { section: "import-export", href: `${base}/import-export`, labelKey: "admin.nav.import-export" },
    { section: "tutorial", href: `${base}/tutorial`, labelKey: "admin.nav.tutorial" },
    { section: "theme", href: `${base}/theme`, labelKey: "admin.nav.theme" },
  ];
}
