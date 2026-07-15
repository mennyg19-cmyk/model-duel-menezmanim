"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StyleActivationRule } from "@/core/style-engine";
import { useDoc, useEditorConfig, useUi } from "../state/StoreProvider";
import { BOARD_THEMES, deleteCustomTheme, loadCustomThemes, paletteFromImage, saveCustomTheme, type BoardTheme } from "../themes";
import { Field, btn, btnAccent, inputStyle } from "../ui";

export function StyleManagerPanel({
  activationRules,
  onActivationChange,
}: {
  activationRules: StyleActivationRule[];
  onActivationChange: (rules: StyleActivationRule[]) => void;
}) {
  const { orgId, orgSlug, styleId, styles } = useEditorConfig();
  const updateStyle = useDoc((s) => s.updateStyle);
  const style = useDoc((s) => s.style);
  const objects = useDoc((s) => s.objects);
  const setPreviewScreen = useUi((s) => s.setPreviewScreen);
  const router = useRouter();
  const [customs, setCustoms] = useState(() => (typeof window !== "undefined" ? loadCustomThemes() : []));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function createStyle() {
    setBusy(true);
    const res = await fetch(`/api/org/${orgId}/styles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const json = (await res.json()) as { styleId?: string; error?: string };
    setBusy(false);
    if (json.styleId) router.push(`/admin/${orgSlug}/editor/${json.styleId}`);
    else setMsg(json.error ?? "Create failed");
  }

  async function duplicate() {
    setBusy(true);
    const res = await fetch(`/api/org/${orgId}/styles/${styleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    const json = (await res.json()) as { styleId?: string; error?: string };
    setBusy(false);
    if (json.styleId) router.push(`/admin/${orgSlug}/editor/${json.styleId}`);
    else setMsg(json.error ?? "Duplicate failed");
  }

  async function remove() {
    if (!confirm("Delete this style?")) return;
    setBusy(true);
    const res = await fetch(`/api/org/${orgId}/styles/${styleId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      const next = styles.find((s) => s.id !== styleId);
      router.push(next ? `/admin/${orgSlug}/editor/${next.id}` : `/admin/${orgSlug}/editor`);
    } else setMsg("Delete failed");
  }

  function applyTheme(t: BoardTheme) {
    updateStyle({
      backgroundColor: t.backgroundColor,
      backgroundMode: t.backgroundMode,
      backgroundGradient: t.backgroundGradient ?? null,
    });
    // Tint selected widgets' text toward theme foreColor via first object if any — apply to all
    for (const o of objects) {
      // document store only updates one at a time; batch via updateStyle for canvas, leave objects
    }
    void setPreviewScreen;
  }

  return (
    <div style={{ padding: 10, gap: 10, fontSize: 12 }}>
      {msg ? <p style={{ color: "#fca5a5" }}>{msg}</p> : null}
      <Field label="Open style">
        <select
          style={inputStyle}
          value={styleId}
          onChange={(e) => router.push(`/admin/${orgSlug}/editor/${e.target.value}`)}
        >
          {styles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.isDefault ? " ★" : ""}
            </option>
          ))}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={btnAccent} disabled={busy} onClick={() => void createStyle()}>
          New
        </button>
        <button type="button" style={btn} disabled={busy} onClick={() => void duplicate()}>
          Duplicate
        </button>
        <button type="button" style={btn} disabled={busy} onClick={() => void remove()}>
          Delete
        </button>
        <button
          type="button"
          style={btn}
          disabled={busy}
          onClick={() =>
            void fetch(`/api/org/${orgId}/styles/${styleId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "setDefault" }),
            })
          }
        >
          Set default
        </button>
      </div>

      <Field label="Canvas W">
        <input type="number" style={inputStyle} value={style.canvasWidth} onChange={(e) => updateStyle({ canvasWidth: Number(e.target.value) || 1920 })} />
      </Field>
      <Field label="Canvas H">
        <input type="number" style={inputStyle} value={style.canvasHeight} onChange={(e) => updateStyle({ canvasHeight: Number(e.target.value) || 1080 })} />
      </Field>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          [1920, 1080],
          [1280, 720],
          [1080, 1920],
        ].map(([w, h]) => (
          <button key={`${w}x${h}`} type="button" style={btn} onClick={() => updateStyle({ canvasWidth: w!, canvasHeight: h! })}>
            {w}×{h}
          </button>
        ))}
      </div>

      <strong>Activation rules</strong>
      {activationRules.map((rule, i) => (
        <div key={i} style={{ border: "1px solid #334155", borderRadius: 6, padding: 6, gap: 6 }}>
          <select
            style={inputStyle}
            value={rule.type}
            onChange={(e) => {
              const type = e.target.value as StyleActivationRule["type"];
              const next = activationRules.slice();
              next[i] = type === "default" ? { type: "default" } : { type, startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 };
              onActivationChange(next);
            }}
          >
            <option value="default">default</option>
            <option value="gregorian_date_range">gregorian range</option>
            <option value="hebrew_date_range">hebrew range</option>
          </select>
          {rule.type !== "default" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 4 }}>
              {(["startMonth", "startDay", "endMonth", "endDay"] as const).map((k) => (
                <input
                  key={k}
                  type="number"
                  style={inputStyle}
                  value={rule[k] ?? 1}
                  onChange={(e) => {
                    const next = activationRules.slice();
                    next[i] = { ...rule, [k]: Number(e.target.value) || 1 };
                    onActivationChange(next);
                  }}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            style={btn}
            onClick={() => onActivationChange(activationRules.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        style={btn}
        onClick={() => onActivationChange([...activationRules, { type: "default" }])}
      >
        Add rule
      </button>

      <strong>Board themes (P6.14)</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[...BOARD_THEMES, ...customs].map((t) => (
          <button
            key={t.id}
            type="button"
            style={{ ...btn, background: t.backgroundColor, color: t.foreColor, borderColor: t.accent }}
            onClick={() => applyTheme(t)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        style={btn}
        onClick={() => {
          const t: BoardTheme = {
            id: `custom-${Date.now()}`,
            label: "Custom",
            backgroundColor: style.backgroundColor,
            backgroundMode: (style.backgroundMode as "solid" | "gradient") || "solid",
            backgroundGradient: style.backgroundGradient ?? undefined,
            foreColor: "#fff",
            accent: "#38bdf8",
          };
          saveCustomTheme(t);
          setCustoms(loadCustomThemes());
        }}
      >
        Save current as custom theme
      </button>
      {customs.map((t) => (
        <button
          key={`del-${t.id}`}
          type="button"
          style={btn}
          onClick={() => {
            deleteCustomTheme(t.id);
            setCustoms(loadCustomThemes());
          }}
        >
          Delete {t.label}
        </button>
      ))}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = String(reader.result);
            const colors = await paletteFromImage(dataUrl);
            if (colors[0]) {
              updateStyle({ backgroundColor: colors[0], backgroundMode: "image", backgroundImage: dataUrl });
              const t: BoardTheme = {
                id: `pal-${Date.now()}`,
                label: "From image",
                backgroundColor: colors[0],
                backgroundMode: "solid",
                foreColor: "#fff",
                accent: colors[1] ?? "#38bdf8",
              };
              saveCustomTheme(t);
              setCustoms(loadCustomThemes());
            }
          };
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}
