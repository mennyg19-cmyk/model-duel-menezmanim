export type AdminThemeId = "dark" | "light" | "mono-dark" | "mono-light" | "custom";

export type AdminThemeCustom = {
  ink?: string;
  muted?: string;
  deep?: string;
  mint?: string;
  gold?: string;
  line?: string;
  panel?: string;
};

export const ADMIN_THEMES: Record<
  Exclude<AdminThemeId, "custom">,
  Required<AdminThemeCustom>
> = {
  dark: {
    ink: "#f8f4e8",
    muted: "#a9b7b2",
    deep: "#071613",
    mint: "#72d8ad",
    gold: "#d8ae66",
    line: "rgba(248, 244, 232, 0.14)",
    panel: "#0f1a17",
  },
  light: {
    ink: "#12201c",
    muted: "#4f635c",
    deep: "#f4f7f5",
    mint: "#1f6b57",
    gold: "#9a6b1f",
    line: "rgba(18, 32, 28, 0.14)",
    panel: "#ffffff",
  },
  "mono-dark": {
    ink: "#f2f2f2",
    muted: "#a0a0a0",
    deep: "#111111",
    mint: "#d0d0d0",
    gold: "#bdbdbd",
    line: "rgba(255, 255, 255, 0.14)",
    panel: "#1a1a1a",
  },
  "mono-light": {
    ink: "#111111",
    muted: "#555555",
    deep: "#f7f7f7",
    mint: "#333333",
    gold: "#666666",
    line: "rgba(0, 0, 0, 0.12)",
    panel: "#ffffff",
  },
};

export function resolveThemeVars(id: AdminThemeId, custom?: AdminThemeCustom): Required<AdminThemeCustom> {
  if (id === "custom") {
    return { ...ADMIN_THEMES.dark, ...custom };
  }
  return ADMIN_THEMES[id];
}

export function applyThemeToElement(
  el: HTMLElement,
  id: AdminThemeId,
  custom?: AdminThemeCustom,
) {
  const vars = resolveThemeVars(id, custom);
  el.style.setProperty("--ink", vars.ink);
  el.style.setProperty("--muted", vars.muted);
  el.style.setProperty("--deep", vars.deep);
  el.style.setProperty("--mint", vars.mint);
  el.style.setProperty("--gold", vars.gold);
  el.style.setProperty("--line", vars.line);
  el.style.setProperty("--adm-panel", vars.panel);
  el.dataset.adminTheme = id;
}
