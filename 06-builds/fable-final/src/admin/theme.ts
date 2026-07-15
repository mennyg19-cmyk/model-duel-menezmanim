/** P12 — admin UI themes (not display-board styles). */

export type AdminThemeId = "light" | "dark" | "mono-light" | "mono-dark" | "custom";

export interface AdminThemeVars {
  id: AdminThemeId;
  label: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  nav: string;
  danger: string;
}

export const ADMIN_THEMES: Record<Exclude<AdminThemeId, "custom">, AdminThemeVars> = {
  light: {
    id: "light",
    label: "Light",
    bg: "#f1f5f9",
    surface: "#ffffff",
    border: "#cbd5e1",
    text: "#0f172a",
    muted: "#64748b",
    accent: "#2563eb",
    accentText: "#ffffff",
    nav: "#e2e8f0",
    danger: "#dc2626",
  },
  dark: {
    id: "dark",
    label: "Dark",
    bg: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    text: "#e2e8f0",
    muted: "#94a3b8",
    accent: "#fbbf24",
    accentText: "#0f172a",
    nav: "#111827",
    danger: "#f87171",
  },
  "mono-light": {
    id: "mono-light",
    label: "Monochrome light",
    bg: "#fafafa",
    surface: "#ffffff",
    border: "#d4d4d4",
    text: "#171717",
    muted: "#737373",
    accent: "#262626",
    accentText: "#fafafa",
    nav: "#e5e5e5",
    danger: "#525252",
  },
  "mono-dark": {
    id: "mono-dark",
    label: "Monochrome dark",
    bg: "#0a0a0a",
    surface: "#171717",
    border: "#404040",
    text: "#f5f5f5",
    muted: "#a3a3a3",
    accent: "#e5e5e5",
    accentText: "#0a0a0a",
    nav: "#141414",
    danger: "#a3a3a3",
  },
};

export const THEME_STORAGE_KEY = "menez-admin-theme";
export const CUSTOM_THEME_STORAGE_KEY = "menez-admin-theme-custom";

export const DEFAULT_CUSTOM: AdminThemeVars = {
  id: "custom",
  label: "Custom",
  bg: "#12203a",
  surface: "#1a2d4d",
  border: "#2d4a73",
  text: "#e8eef7",
  muted: "#8fa3bf",
  accent: "#38bdf8",
  accentText: "#0c1929",
  nav: "#0d1829",
  danger: "#fb7185",
};

export function themeToCssVars(t: AdminThemeVars): Record<string, string> {
  return {
    "--admin-bg": t.bg,
    "--admin-surface": t.surface,
    "--admin-border": t.border,
    "--admin-text": t.text,
    "--admin-muted": t.muted,
    "--admin-accent": t.accent,
    "--admin-accent-text": t.accentText,
    "--admin-nav": t.nav,
    "--admin-danger": t.danger,
  };
}
