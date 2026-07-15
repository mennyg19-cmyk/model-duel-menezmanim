"use client";

import { ScheduleRuleEditor } from "@/admin/schedules/ScheduleRuleEditor";
import { getWidget } from "@/widgets/registry";
import type { DisplayObjectAppearance, DisplayObjectTableLayout } from "@/core/board/appearance";
import { getContentEditor, getContentNote, JsonFallback } from "../ContentEditors";
import { contrastText } from "../themes";
import { useDoc, useUi } from "../state/StoreProvider";
import type { EditorObject } from "../types";
import { Field, Section, btn, inputStyle } from "../ui";

const FRAMES = ["ornamental", "modern", "minimal"];
const TEXTURES = ["marble", "stone", "wood", "fabric", "metal", "paper"];
const GRADIENTS = [
  "linear-gradient(135deg,#0f172a,#1e3a5f)",
  "linear-gradient(135deg,#7c2d12,#c2410c)",
  "linear-gradient(135deg,#14532d,#166534)",
  "linear-gradient(90deg,#1e1b4b,#312e81)",
];

function TableLayoutEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const tl = (content.tableLayout as DisplayObjectTableLayout | undefined) ?? {
    columns: 1,
    splitMode: "even",
    showHeader: true,
    headerTextColor: null,
    headerBackgroundColor: null,
    showColumnHeaders: false,
    columnHeaderLabel: null,
    columnHeaderValue: null,
    borderWidth: 0,
    borderColor: null,
    borderRadius: 0,
    alternatingRows: true,
    rowColor1: null,
    rowColor2: null,
    rowSpacing: 4,
    columnGap: 12,
    cellPaddingY: 6,
    cellPaddingX: 10,
    columnSeparator: false,
    columnSeparatorColor: null,
    columnSeparatorWidth: 1,
    textAlign: "left",
    timeFormat: "default",
  };
  const set = (patch: Partial<DisplayObjectTableLayout>) => onChange({ ...content, tableLayout: { ...tl, ...patch } });
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Field label="Columns">
        <select style={inputStyle} value={tl.columns} onChange={(e) => set({ columns: Number(e.target.value) as 1 | 2 | 3 | 4 })}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Split">
        <select style={inputStyle} value={tl.splitMode} onChange={(e) => set({ splitMode: e.target.value as "even" | "fillHeight" })}>
          <option value="even">even</option>
          <option value="fillHeight">fill height</option>
        </select>
      </Field>
      <label style={{ fontSize: 12 }}>
        <input type="checkbox" checked={tl.showHeader} onChange={(e) => set({ showHeader: e.target.checked })} /> Header row
      </label>
      <label style={{ fontSize: 12 }}>
        <input type="checkbox" checked={tl.alternatingRows} onChange={(e) => set({ alternatingRows: e.target.checked })} /> Alternating rows
      </label>
      <Field label="Row color 1">
        <input type="color" style={inputStyle} value={tl.rowColor1 ?? "#1e293b"} onChange={(e) => set({ rowColor1: e.target.value })} />
      </Field>
      <Field label="Row color 2">
        <input type="color" style={inputStyle} value={tl.rowColor2 ?? "#0f172a"} onChange={(e) => set({ rowColor2: e.target.value })} />
      </Field>
      <Field label="Column gap">
        <input type="number" style={inputStyle} value={tl.columnGap} onChange={(e) => set({ columnGap: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Row spacing">
        <input type="number" style={inputStyle} value={tl.rowSpacing} onChange={(e) => set({ rowSpacing: Number(e.target.value) || 0 })} />
      </Field>
      <label style={{ fontSize: 12 }}>
        <input type="checkbox" checked={tl.columnSeparator} onChange={(e) => set({ columnSeparator: e.target.checked })} /> Column separator
      </label>
      <Field label="Text align">
        <select style={inputStyle} value={tl.textAlign} onChange={(e) => set({ textAlign: e.target.value as "left" | "center" | "right" })}>
          <option value="left">left</option>
          <option value="center">center</option>
          <option value="right">right</option>
        </select>
      </Field>
    </div>
  );
}

function AppearanceTab({ obj, onPatch }: { obj: EditorObject; onPatch: (p: Partial<EditorObject>) => void }) {
  const a = obj.appearance;
  const setA = (patch: Partial<DisplayObjectAppearance>) => {
    const next = { ...a, ...patch };
    onPatch({
      appearance: next,
      backColor: patch.backgroundColor ?? obj.backColor,
    });
  };
  const openSections = useUi((s) => s.openSections);
  const toggleSection = useUi((s) => s.toggleSection);

  return (
    <>
      <Section id="font" title="Font" defaultOpen open={openSections.font} onToggle={toggleSection}>
        <Field label="Family">
          <input style={inputStyle} value={obj.fontFamily} onChange={(e) => onPatch({ fontFamily: e.target.value })} />
        </Field>
        <Field label="Size">
          <input type="number" style={inputStyle} value={obj.fontSize} onChange={(e) => onPatch({ fontSize: Number(e.target.value) || 12 })} />
        </Field>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={obj.fontBold} onChange={(e) => onPatch({ fontBold: e.target.checked })} /> Bold
        </label>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={obj.fontItalic} onChange={(e) => onPatch({ fontItalic: e.target.checked })} /> Italic
        </label>
        <Field label="Color">
          <input type="color" style={inputStyle} value={obj.foreColor} onChange={(e) => onPatch({ foreColor: e.target.value })} />
        </Field>
        <button
          type="button"
          style={btn}
          onClick={() => {
            const bg = a.backgroundMode === "solid" ? a.backgroundColor || obj.backColor : obj.backColor;
            onPatch({ foreColor: contrastText(bg === "transparent" ? "#0f172a" : bg) });
          }}
        >
          Auto-contrast text
        </button>
      </Section>
      <Section id="align" title="Align / line height" defaultOpen={false} open={openSections.align} onToggle={toggleSection}>
        <Field label="Text align">
          <select style={inputStyle} value={a.textAlign} onChange={(e) => setA({ textAlign: e.target.value as DisplayObjectAppearance["textAlign"] })}>
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </Field>
        <Field label="Vertical">
          <select style={inputStyle} value={a.verticalAlign} onChange={(e) => setA({ verticalAlign: e.target.value as DisplayObjectAppearance["verticalAlign"] })}>
            <option value="top">top</option>
            <option value="middle">middle</option>
            <option value="bottom">bottom</option>
          </select>
        </Field>
        <Field label="Line height">
          <input
            type="number"
            step="0.1"
            style={inputStyle}
            value={a.lineHeight ?? ""}
            placeholder="auto"
            onChange={(e) => setA({ lineHeight: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
        <Field label="Language">
          <select style={inputStyle} value={obj.language} onChange={(e) => onPatch({ language: e.target.value })}>
            <option value="hebrew">hebrew</option>
            <option value="english">english</option>
            <option value="yiddish">yiddish</option>
            <option value="both">both</option>
          </select>
        </Field>
      </Section>
      <Section id="bg" title="Background" defaultOpen={false} open={openSections.bg} onToggle={toggleSection}>
        <Field label="Mode">
          <select
            style={inputStyle}
            value={a.backgroundMode}
            onChange={(e) => setA({ backgroundMode: e.target.value as DisplayObjectAppearance["backgroundMode"] })}
          >
            {["solid", "transparent", "gradient", "texture", "image", "canvas"].map((m) => (
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
            value={a.backgroundColor === "transparent" ? "#000000" : a.backgroundColor}
            onChange={(e) => {
              setA({ backgroundColor: e.target.value, backgroundMode: "solid" });
              onPatch({ backColor: e.target.value });
            }}
          />
        </Field>
        <Field label="Gradient">
          <select style={inputStyle} value={a.backgroundGradient ?? ""} onChange={(e) => setA({ backgroundGradient: e.target.value || null, backgroundMode: "gradient" })}>
            <option value="">—</option>
            {GRADIENTS.map((g) => (
              <option key={g} value={g}>
                {g.slice(0, 40)}…
              </option>
            ))}
          </select>
        </Field>
        <Field label="Custom gradient CSS">
          <input style={inputStyle} value={a.backgroundGradient ?? ""} onChange={(e) => setA({ backgroundGradient: e.target.value || null })} />
        </Field>
        <Field label="Texture">
          <select style={inputStyle} value={a.backgroundTexture ?? ""} onChange={(e) => setA({ backgroundTexture: e.target.value || null, backgroundMode: "texture" })}>
            <option value="">—</option>
            {TEXTURES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Image (data URL / path)">
          <input style={inputStyle} value={a.backgroundImage ?? ""} onChange={(e) => setA({ backgroundImage: e.target.value || null, backgroundMode: "image" })} />
        </Field>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setA({ backgroundImage: String(reader.result), backgroundMode: "image" });
            reader.readAsDataURL(file);
          }}
        />
      </Section>
      <Section id="frame" title="Frame" defaultOpen={false} open={openSections.frame} onToggle={toggleSection}>
        <Field label="Frame">
          <select style={inputStyle} value={a.frameId ?? ""} onChange={(e) => setA({ frameId: e.target.value || null })}>
            <option value="">none</option>
            {FRAMES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Thickness">
          <input type="number" style={inputStyle} value={a.frameThickness} onChange={(e) => setA({ frameThickness: Number(e.target.value) || 0 })} />
        </Field>
      </Section>
      <Section id="scroll" title="Scrolling" defaultOpen={false} open={openSections.scroll} onToggle={toggleSection}>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={a.scrollingEnabled} onChange={(e) => setA({ scrollingEnabled: e.target.checked })} /> Enable
        </label>
        <Field label="Direction">
          <select
            style={inputStyle}
            value={a.scrollingDirection}
            onChange={(e) => setA({ scrollingDirection: e.target.value as DisplayObjectAppearance["scrollingDirection"] })}
          >
            {["up", "down", "left", "right"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Speed (px/s)">
          <input
            type="number"
            min={5}
            max={200}
            style={inputStyle}
            value={a.scrollingSpeed}
            onChange={(e) => setA({ scrollingSpeed: Math.min(200, Math.max(5, Number(e.target.value) || 60)) })}
          />
        </Field>
      </Section>
      {(obj.type === "ZMANIM_TABLE" || obj.type === "EVENTS_TABLE") && (
        <Section id="table" title="Table layout" defaultOpen={false} open={openSections.table} onToggle={toggleSection}>
          <TableLayoutEditor content={obj.content} onChange={(content) => onPatch({ content })} />
        </Section>
      )}
    </>
  );
}

export function PropertyPanel() {
  const selectedIds = useUi((s) => s.selectedIds);
  const objects = useDoc((s) => s.objects);
  const updateObject = useDoc((s) => s.updateObject);
  const activeTab = useUi((s) => s.activeTab);
  const setActiveTab = useUi((s) => s.setActiveTab);
  const openSections = useUi((s) => s.openSections);
  const toggleSection = useUi((s) => s.toggleSection);
  const sharedData = useUi((s) => s.sharedData);
  const obj = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null;

  if (!obj) {
    return <p style={{ padding: 12, color: "#94a3b8", fontSize: 13 }}>Select a widget to edit its properties.</p>;
  }

  const widget = getWidget(obj.type);
  const patch = (p: Partial<EditorObject>) => updateObject(obj.id, p);
  const Editor = getContentEditor(obj.type);
  const note = getContentNote(obj.type);
  const rules = Array.isArray(obj.scheduleRules) ? obj.scheduleRules : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", borderBottom: "1px solid #334155" }}>
        {(["general", "appearance", "content"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: "8px 4px",
              border: "none",
              background: activeTab === t ? "#334155" : "transparent",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: 11,
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ overflow: "auto", flex: 1 }}>
        {activeTab === "general" && (
          <>
            <Section id="identity" title="Identity" defaultOpen open={openSections.identity} onToggle={toggleSection}>
              <Field label="Name">
                <input style={inputStyle} value={obj.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              <Field label="Type">
                <input style={inputStyle} value={widget?.label ?? obj.type} disabled />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(["posX", "posY", "width", "height"] as const).map((k) => (
                  <Field key={k} label={k}>
                    <input type="number" style={inputStyle} value={obj[k]} onChange={(e) => patch({ [k]: Number(e.target.value) || 0 })} />
                  </Field>
                ))}
              </div>
              <Field label="Z-index">
                <input type="number" style={inputStyle} value={obj.layer} onChange={(e) => patch({ layer: Number(e.target.value) || 0 })} />
              </Field>
              <label style={{ fontSize: 12 }}>
                <input type="checkbox" checked={obj.visible} onChange={(e) => patch({ visible: e.target.checked })} /> Visible
              </label>
            </Section>
            <Section id="schedule" title="Schedule rules" defaultOpen={false} open={openSections.schedule} onToggle={toggleSection}>
              <ScheduleRuleEditor
                rules={rules}
                combineMode="all"
                onChange={({ rules: next }) => patch({ scheduleRules: next.length ? next : null })}
              />
            </Section>
          </>
        )}
        {activeTab === "appearance" && <AppearanceTab obj={obj} onPatch={patch} />}
        {activeTab === "content" && (
          <div style={{ padding: 10, gap: 10 }}>
            {note ? <p style={{ fontSize: 12, color: "#94a3b8" }}>{note}</p> : null}
            {Editor ? (
              <Editor obj={obj} content={obj.content} onChange={(content) => patch({ content })} shared={sharedData} />
            ) : (
              <JsonFallback content={obj.content} onChange={(content) => patch({ content })} />
            )}
            {Editor ? <JsonFallback content={obj.content} onChange={(content) => patch({ content })} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}
