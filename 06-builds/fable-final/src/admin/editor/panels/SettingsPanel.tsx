"use client";

import { useDoc } from "../state/StoreProvider";
import { Field, btn, inputStyle } from "../ui";

const GRADIENTS = [
  "linear-gradient(135deg,#0f172a,#1e3a5f)",
  "linear-gradient(135deg,#7c2d12,#c2410c)",
  "linear-gradient(135deg,#14532d,#166534)",
  "linear-gradient(90deg,#1e1b4b,#312e81)",
];
const TEXTURES = ["marble", "stone", "wood", "fabric", "metal", "paper"];
const FRAMES = ["ornamental", "modern", "minimal"];

/** Style-level background / frame controls (E5 + canvas bg). */
export function SettingsPanel() {
  const style = useDoc((s) => s.style);
  const updateStyle = useDoc((s) => s.updateStyle);

  return (
    <div style={{ padding: 10, gap: 10, fontSize: 12 }}>
      <Field label="Style name">
        <input style={inputStyle} value={style.name} onChange={(e) => updateStyle({ name: e.target.value })} />
      </Field>
      <Field label="Background mode">
        <select
          style={inputStyle}
          value={style.backgroundMode}
          onChange={(e) => updateStyle({ backgroundMode: e.target.value })}
        >
          {["solid", "gradient", "texture", "image"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Solid color">
        <input
          type="color"
          style={inputStyle}
          value={style.backgroundColor}
          onChange={(e) => updateStyle({ backgroundColor: e.target.value, backgroundMode: "solid" })}
        />
      </Field>
      <Field label="Gradient presets">
        <select
          style={inputStyle}
          value={style.backgroundGradient ?? ""}
          onChange={(e) => updateStyle({ backgroundGradient: e.target.value || null, backgroundMode: "gradient" })}
        >
          <option value="">—</option>
          {GRADIENTS.map((g) => (
            <option key={g} value={g}>
              {g.slice(0, 36)}…
            </option>
          ))}
        </select>
      </Field>
      <Field label="Custom gradient">
        <input
          style={inputStyle}
          value={style.backgroundGradient ?? ""}
          onChange={(e) => updateStyle({ backgroundGradient: e.target.value || null })}
        />
      </Field>
      <Field label="Texture">
        <select
          style={inputStyle}
          value={style.backgroundTexture ?? ""}
          onChange={(e) => updateStyle({ backgroundTexture: e.target.value || null, backgroundMode: "texture" })}
        >
          <option value="">—</option>
          {TEXTURES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Image URL / data">
        <input
          style={inputStyle}
          value={style.backgroundImage ?? ""}
          onChange={(e) => updateStyle({ backgroundImage: e.target.value || null, backgroundMode: "image" })}
        />
      </Field>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => updateStyle({ backgroundImage: String(reader.result), backgroundMode: "image" });
          reader.readAsDataURL(file);
        }}
      />
      <Field label="Canvas frame">
        <select
          style={inputStyle}
          value={style.backgroundFrameId ?? ""}
          onChange={(e) => updateStyle({ backgroundFrameId: e.target.value || null })}
        >
          <option value="">none</option>
          {FRAMES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Frame thickness">
        <input
          type="number"
          style={inputStyle}
          value={style.backgroundFrameThickness ?? 0}
          onChange={(e) => updateStyle({ backgroundFrameThickness: Number(e.target.value) || 0 })}
        />
      </Field>
      <button type="button" style={btn} onClick={() => updateStyle({ backgroundMode: "solid", backgroundImage: null, backgroundGradient: null, backgroundTexture: null })}>
        Reset to solid
      </button>
    </div>
  );
}
