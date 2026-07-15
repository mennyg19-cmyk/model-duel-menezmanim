// P11 — walkthrough steps with data-tutorial hooks. Fixed-position card (scroll-safe).

export interface TutorialStep {
  hook: string;
  chapter: string;
  title: string;
  body: string;
}

export const TUTORIAL_SEEN_KEY = "menez-tutorial-seen";
export const TUTORIAL_CHAPTERS_KEY = "menez-tutorial-chapters";

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    hook: "admin-sidebar",
    chapter: "Getting around",
    title: "This is your admin menu",
    body: "Everything you manage for this shul lives here.",
  },
  {
    hook: "org-switcher",
    chapter: "Getting around",
    title: "Switch between shuls",
    body: "If you manage more than one shul, switch between them here.",
  },
  {
    hook: "nav-dashboard",
    chapter: "Getting around",
    title: "Your dashboard",
    body: "A quick overview: counts, live display, and shortcuts.",
  },
  {
    hook: "nav-schedules",
    chapter: "Schedules",
    title: "Set your minyan times",
    body: "Build davening schedules that can follow zmanim and round per minyan.",
  },
  {
    hook: "nav-content",
    chapter: "Content",
    title: "Announcements, memorials & more",
    body: "Add announcements, yahrzeits, sponsors, media, and daily notes.",
  },
  {
    hook: "nav-screens",
    chapter: "Display",
    title: "Screens & styles",
    body: "Each screen shows a board you design. Open a style to use the visual editor.",
  },
  {
    hook: "nav-editor",
    chapter: "Display",
    title: "Visual editor",
    body: "Lay out widgets on the canvas — the same path the live board uses.",
  },
  {
    hook: "live-display",
    chapter: "Display",
    title: "See it live",
    body: "Open the live board in a new tab exactly as it shows on wall screens.",
  },
  {
    hook: "nav-settings",
    chapter: "Setup",
    title: "Location & halacha settings",
    body: "Location, timezone, and halachic prefs drive every zman calculation.",
  },
  {
    hook: "nav-import-export",
    chapter: "Setup",
    title: "Import & export",
    body: "Back up, restore, CSV/JSON/ICS, BeeZee, and multi-week luach exports.",
  },
  {
    hook: "nav-tutorial",
    chapter: "Setup",
    title: "Replay this tour anytime",
    body: "Open Tutorial to see chapters and restart the walkthrough.",
  },
];

export function chapterNames(): string[] {
  const names: string[] = [];
  for (const s of TUTORIAL_STEPS) {
    if (!names.includes(s.chapter)) names.push(s.chapter);
  }
  return names;
}

export function loadCompletedChapters(): Set<string> {
  try {
    const raw = window.localStorage.getItem(TUTORIAL_CHAPTERS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveCompletedChapter(chapter: string) {
  try {
    const set = loadCompletedChapters();
    set.add(chapter);
    window.localStorage.setItem(TUTORIAL_CHAPTERS_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}
