"use client";

import { useEffect, useState } from "react";
import { applyThemeToElement, type AdminThemeId, type AdminThemeCustom } from "@/admin/theme/admin-themes";

const THEME_OPTIONS: { id: AdminThemeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "mono-dark", label: "Mono dark" },
  { id: "mono-light", label: "Mono light" },
  { id: "custom", label: "Custom" },
];

export function ThemePickerAdmin({
  orgId,
  initialId,
  initialCustom,
}: {
  orgId: string;
  initialId: AdminThemeId;
  initialCustom?: AdminThemeCustom;
}) {
  const [themeId, setThemeId] = useState<AdminThemeId>(initialId);
  const [custom, setCustom] = useState<AdminThemeCustom>(initialCustom ?? {});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    applyThemeToElement(root, themeId, custom);
  }, [themeId, custom]);

  async function persist(nextId: AdminThemeId, nextCustom: AdminThemeCustom) {
    setThemeId(nextId);
    setCustom(nextCustom);
    setMsg(null);
    const res = await fetch(`/api/org/${orgId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminTheme: { id: nextId, custom: nextCustom } }),
    });
    if (!res.ok) {
      setMsg("Theme save failed");
      return;
    }
    setMsg("Theme saved");
  }

  return (
    <div className="adm-themePicker" data-tutorial="theme-picker">
      <label>
        Theme
        <select
          value={themeId}
          onChange={(e) => void persist(e.target.value as AdminThemeId, custom)}
        >
          {THEME_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {themeId === "custom" ? (
        <div className="adm-themeCustom">
          {(
            [
              ["ink", "Ink"],
              ["deep", "Background"],
              ["mint", "Accent"],
              ["panel", "Panel"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="color"
                value={(custom[key] as string | undefined) ?? "#72d8ad"}
                onChange={(e) => {
                  const next = { ...custom, [key]: e.target.value };
                  void persist("custom", next);
                }}
              />
            </label>
          ))}
        </div>
      ) : null}
      {msg ? <small className="adm-ok">{msg}</small> : null}
    </div>
  );
}
