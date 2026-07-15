export type AdminLocale = "en" | "he";

const STRINGS = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.schedules": "Schedules",
    "nav.content": "Content",
    "nav.editor": "Editor",
    "nav.screens": "Screens",
    "nav.members": "Members",
    "nav.settings": "Settings",
    "nav.import": "Import",
    "nav.org": "Organization",
    "nav.signOut": "Sign out",
    "nav.tutorial": "Tutorial",
    "nav.theme": "Theme",
    "members.title": "Members",
    "members.invite": "Invite",
    "members.pending": "Pending invites",
    "settings.title": "Settings",
    "settings.save": "Save changes",
    "settings.saved": "Saved",
    "tutorial.open": "Start tutorial",
  },
  he: {
    "nav.dashboard": "לוח בקרה",
    "nav.schedules": "לוחות זמנים",
    "nav.content": "תוכן",
    "nav.editor": "עורך",
    "nav.screens": "מסכים",
    "nav.members": "חברים",
    "nav.settings": "הגדרות",
    "nav.import": "ייבוא",
    "nav.org": "ארגון",
    "nav.signOut": "התנתק",
    "nav.tutorial": "הדרכה",
    "nav.theme": "ערכת נושא",
    "members.title": "חברים",
    "members.invite": "הזמן",
    "members.pending": "הזמנות ממתינות",
    "settings.title": "הגדרות",
    "settings.save": "שמור שינויים",
    "settings.saved": "נשמר",
    "tutorial.open": "התחל הדרכה",
  },
} as const;

export type AdminStringKey = keyof (typeof STRINGS)["en"];

export function t(locale: AdminLocale, key: AdminStringKey): string {
  return STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
}
