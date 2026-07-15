"use client";

import { ADMIN_THEMES, type AdminThemeVars } from "./theme";
import { useAdminTheme } from "./AdminThemeProvider";

/** P12 — full theme picker with custom color slots. */
export function ThemePickerAdmin() {
  const { themeId, setThemeId, custom, setCustom } = useAdminTheme();

  const slots: { key: keyof AdminThemeVars; label: string }[] = [
    { key: "bg", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "border", label: "Border" },
    { key: "text", label: "Text" },
    { key: "muted", label: "Muted" },
    { key: "accent", label: "Accent" },
    { key: "accentText", label: "Accent text" },
    { key: "nav", label: "Nav" },
    { key: "danger", label: "Danger" },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin theme</h1>
      <p style={{ color: "var(--admin-muted)", maxWidth: 520 }}>
        Colors the admin shell only — not the public display board. Choice is stored in this browser.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        {(Object.keys(ADMIN_THEMES) as Array<keyof typeof ADMIN_THEMES>).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setThemeId(id)}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: themeId === id ? "2px solid var(--admin-accent)" : "1px solid var(--admin-border)",
              background: ADMIN_THEMES[id].surface,
              color: ADMIN_THEMES[id].text,
              cursor: "pointer",
            }}
          >
            {ADMIN_THEMES[id].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setThemeId("custom")}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: themeId === "custom" ? "2px solid var(--admin-accent)" : "1px solid var(--admin-border)",
            background: custom.surface,
            color: custom.text,
            cursor: "pointer",
          }}
        >
          Custom
        </button>
      </div>

      <h2 style={{ fontSize: 16 }}>Custom color slots</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
        {slots.map(({ key, label }) => (
          <label key={key} style={{ fontSize: 13 }}>
            {label}
            <input
              type="color"
              value={normalizeHex(String(custom[key]))}
              onChange={(e) => {
                setCustom({ [key]: e.target.value });
                setThemeId("custom");
              }}
              style={{ display: "block", width: "100%", height: 36, marginTop: 4, cursor: "pointer" }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function normalizeHex(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return "#888888";
}
