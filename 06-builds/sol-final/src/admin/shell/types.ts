export type AdminMembership = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  orgStatus: string;
  role: string;
};

export type AdminSection =
  | "dashboard"
  | "schedules"
  | "content"
  | "editor"
  | "screens"
  | "members"
  | "settings"
  | "import";

export type DashboardStats = {
  schedules: number;
  announcements: number;
  memorials: number;
  sponsors: number;
  members: number;
  styles: number;
  screens: number;
  plan: string;
};

export type ScreenSummary = {
  id: string;
  name: string;
  resolution: string;
  isActive: boolean;
  assignedStyleId: string | null;
  lastSeenAt: string | null;
  styleSchedules: unknown;
};

export type StyleSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundMode: string | null;
  backgroundGradient: string | null;
  backgroundImage: string | null;
  objectCount: number;
};
