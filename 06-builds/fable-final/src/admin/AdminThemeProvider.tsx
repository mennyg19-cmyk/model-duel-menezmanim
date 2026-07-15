"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ADMIN_THEMES,
  CUSTOM_THEME_STORAGE_KEY,
  DEFAULT_CUSTOM,
  THEME_STORAGE_KEY,
  themeToCssVars,
  type AdminThemeId,
  type AdminThemeVars,
} from "./theme";

interface ThemeContextValue {
  themeId: AdminThemeId;
  theme: AdminThemeVars;
  custom: AdminThemeVars;
  setThemeId: (id: AdminThemeId) => void;
  setCustom: (partial: Partial<AdminThemeVars>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<AdminThemeId>("dark");
  const [custom, setCustomState] = useState<AdminThemeVars>(DEFAULT_CUSTOM);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as AdminThemeId | null;
      if (stored && (stored === "custom" || stored in ADMIN_THEMES)) setThemeIdState(stored);
      const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (raw) setCustomState({ ...DEFAULT_CUSTOM, ...JSON.parse(raw), id: "custom", label: "Custom" });
    } catch {
      /* ignore */
    }
  }, []);

  const setThemeId = useCallback((id: AdminThemeId) => {
    setThemeIdState(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }, []);

  const setCustom = useCallback((partial: Partial<AdminThemeVars>) => {
    setCustomState((prev) => {
      const next = { ...prev, ...partial, id: "custom" as const, label: "Custom" };
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const theme = themeId === "custom" ? custom : ADMIN_THEMES[themeId];
  const value = useMemo(
    () => ({ themeId, theme, custom, setThemeId, setCustom }),
    [themeId, theme, custom, setThemeId, setCustom],
  );

  const style = themeToCssVars(theme) as CSSProperties;

  return (
    <ThemeContext.Provider value={value}>
      <div style={{ ...style, minHeight: "100vh", background: "var(--admin-bg)", color: "var(--admin-text)" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAdminTheme requires AdminThemeProvider");
  return ctx;
}
