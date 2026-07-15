export type TutorialChapter = {
  id: string;
  title: string;
  steps: { target: string; title: string; body: string; href?: string }[];
};

export const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    steps: [
      {
        target: "[data-tutorial='dashboard-stats']",
        title: "Stats at a glance",
        body: "These cards deep-link into schedules, content, screens, and more.",
        href: "/admin/{orgSlug}",
      },
      {
        target: "[data-tutorial='dashboard-live']",
        title: "Live Display",
        body: "Opens the public board at /show — never /display.",
        href: "/admin/{orgSlug}",
      },
    ],
  },
  {
    id: "screens",
    title: "Screens & Styles",
    steps: [
      {
        target: "[data-tutorial='screens-list']",
        title: "Screens",
        body: "Manage resolutions, style schedules, and public URLs here.",
        href: "/admin/{orgSlug}/screens",
      },
    ],
  },
  {
    id: "schedules",
    title: "Schedules",
    steps: [
      {
        target: "[data-tutorial='schedules-workspace']",
        title: "Minyan schedules",
        body: "Create, group, and reorder davening times.",
        href: "/admin/schedules?org={orgSlug}",
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    steps: [
      {
        target: "[data-tutorial='content-hub']",
        title: "Content hub",
        body: "Announcements, yahrzeits, sponsors, media, and notes.",
        href: "/admin/content?org={orgSlug}",
      },
    ],
  },
  {
    id: "editor",
    title: "Visual editor",
    steps: [
      {
        target: "[data-tutorial='editor-entry']",
        title: "Editor",
        body: "Design the board style used by wall screens.",
        href: "/admin/{orgSlug}/editor",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    steps: [
      {
        target: "[data-tutorial='settings-page']",
        title: "Org settings",
        body: "Location, zmanim, locales, kiosk prefs, and display names.",
        href: "/admin/{orgSlug}/settings",
      },
    ],
  },
  {
    id: "members",
    title: "Members",
    steps: [
      {
        target: "[data-tutorial='members-page']",
        title: "Team access",
        body: "Invite people and change roles. Owner/admin only.",
        href: "/admin/{orgSlug}/members",
      },
    ],
  },
];
