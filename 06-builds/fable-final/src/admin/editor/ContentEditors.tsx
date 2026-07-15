"use client";

import type { SharedBoardData } from "@/core/board/types";
import type { EditorObject } from "./types";
import { Field, inputStyle } from "./ui";
import type { CSSProperties, ComponentType } from "react";

export interface ContentEditorProps {
  obj: EditorObject;
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  shared: SharedBoardData | null;
}

const grid: CSSProperties = { display: "grid", gap: 8 };
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 12 };

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={row}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const set = new Set(selected);
  return (
    <Field label={label}>
      <div style={{ maxHeight: 140, overflow: "auto", border: "1px solid #334155", borderRadius: 6, padding: 6 }}>
        {options.length === 0 ? <span style={{ fontSize: 11, color: "#94a3b8" }}>None loaded</span> : null}
        {options.map((o) => (
          <label key={o.id} style={row}>
            <input
              type="checkbox"
              checked={set.has(o.id)}
              onChange={() => {
                const next = new Set(set);
                if (next.has(o.id)) next.delete(o.id);
                else next.add(o.id);
                onChange([...next]);
              }}
            />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export function PlainTextEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { text?: string };
  return (
    <div style={grid}>
      <Field label="Text">
        <textarea style={inputStyle} rows={4} value={c.text ?? ""} onChange={(e) => onChange({ ...content, text: e.target.value })} />
      </Field>
    </div>
  );
}

export function RichTextEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { html?: string };
  return (
    <div style={grid}>
      <Field label="HTML">
        <textarea style={{ ...inputStyle, fontFamily: "monospace" }} rows={6} value={c.html ?? ""} onChange={(e) => onChange({ ...content, html: e.target.value })} />
      </Field>
    </div>
  );
}

export function DigitalClockEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { format24h?: boolean; showSeconds?: boolean; showAmPm?: boolean };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  return (
    <div style={grid}>
      <Switch label="24-hour" checked={!!c.format24h} onChange={(v) => set("format24h", v)} />
      <Switch label="Seconds" checked={c.showSeconds ?? true} onChange={(v) => set("showSeconds", v)} />
      <Switch label="AM/PM" checked={c.showAmPm ?? true} onChange={(v) => set("showAmPm", v)} />
    </div>
  );
}

export function AnalogClockEditor({ content, onChange }: ContentEditorProps) {
  const c = content as Record<string, unknown>;
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  return (
    <div style={grid}>
      <Field label="Preset">
        <select style={inputStyle} value={String(c.preset ?? "classic")} onChange={(e) => set("preset", e.target.value)}>
          {["classic", "modern", "minimal", "custom"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      {(["faceColor", "borderColor", "handColor", "numbersColor", "ticksColor"] as const).map((k) => (
        <Field key={k} label={k}>
          <input type="color" style={inputStyle} value={String(c[k] ?? "#ffffff")} onChange={(e) => set(k, e.target.value)} />
        </Field>
      ))}
    </div>
  );
}

export function MediaViewerEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { mediaIds?: string[]; intervalSeconds?: number; fit?: string; fade?: boolean };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const options = (shared?.media ?? []).map((m) => ({ id: m.id, label: m.url.slice(0, 40) }));
  return (
    <div style={grid}>
      <MultiSelect label="Media (empty = all)" options={options} selected={c.mediaIds ?? []} onChange={(ids) => set("mediaIds", ids)} />
      <Field label="Interval (sec)">
        <input type="number" style={inputStyle} value={c.intervalSeconds ?? 10} onChange={(e) => set("intervalSeconds", Number(e.target.value) || 1)} />
      </Field>
      <Field label="Fit">
        <select style={inputStyle} value={c.fit ?? "contain"} onChange={(e) => set("fit", e.target.value)}>
          <option value="contain">contain</option>
          <option value="cover">cover</option>
        </select>
      </Field>
      <Switch label="Fade" checked={c.fade ?? true} onChange={(v) => set("fade", v)} />
    </div>
  );
}

export function ZmanimTableEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { daysAhead?: number; title?: string; zmanim?: Record<string, boolean>; use24h?: boolean };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const off = String(c.daysAhead ?? 0);
  const list = shared?.zmanimByOffset[off] ?? shared?.zmanimByOffset["0"] ?? [];
  const checked = (t: string) => (c.zmanim ? !!c.zmanim[t] : true);
  return (
    <div style={grid}>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Day offset">
        <input type="number" style={inputStyle} value={c.daysAhead ?? 0} onChange={(e) => set("daysAhead", Number(e.target.value) || 0)} />
      </Field>
      <Switch label="24-hour" checked={!!c.use24h} onChange={(v) => set("use24h", v)} />
      <div style={{ maxHeight: 160, overflow: "auto", border: "1px solid #334155", borderRadius: 6, padding: 6 }}>
        {list.map((z) => (
          <label key={z.type} style={row}>
            <input
              type="checkbox"
              checked={checked(z.type)}
              onChange={() => {
                const next: Record<string, boolean> = {};
                for (const item of list) next[item.type] = checked(item.type);
                next[z.type] = !checked(z.type);
                set("zmanim", next);
              }}
            />
            {z.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function EventsTableEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as {
    title?: string;
    groupIds?: string[];
    showRoom?: boolean;
    emphasizeCurrentNext?: boolean;
    use24h?: boolean;
  };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const groups = (shared?.scheduleGroups ?? []).map((g) => ({ id: g.id, label: g.name }));
  return (
    <div style={grid}>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <MultiSelect label="Groups" options={groups} selected={c.groupIds ?? []} onChange={(ids) => set("groupIds", ids)} />
      <Switch label="Show room" checked={!!c.showRoom} onChange={(v) => set("showRoom", v)} />
      <Switch label="Emphasize current/next" checked={!!c.emphasizeCurrentNext} onChange={(v) => set("emphasizeCurrentNext", v)} />
      <Switch label="24-hour" checked={!!c.use24h} onChange={(v) => set("use24h", v)} />
    </div>
  );
}

export function ScrollingTickerEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { announcementIds?: string[]; separator?: string; layout?: string };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const opts = (shared?.announcements ?? []).map((a) => ({ id: a.id, label: a.text.slice(0, 40) }));
  return (
    <div style={grid}>
      <MultiSelect label="Announcements (empty = all)" options={opts} selected={c.announcementIds ?? []} onChange={(ids) => set("announcementIds", ids)} />
      <Field label="Separator">
        <input style={inputStyle} value={c.separator ?? " • "} onChange={(e) => set("separator", e.target.value)} />
      </Field>
    </div>
  );
}

export function JewishInfoEditor({ content, onChange }: ContentEditorProps) {
  const c = content as {
    showItems?: Record<string, boolean>;
    itemOrder?: string[];
    layout?: string;
    horizontalSeparator?: string;
    itemTitles?: Record<string, { mode: string; text?: string }>;
  };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const items = c.itemOrder ?? ["parsha", "daf", "holiday", "omer", "tefilah", "notes"];
  return (
    <div style={grid}>
      <Field label="Layout">
        <select style={inputStyle} value={c.layout ?? "vertical"} onChange={(e) => set("layout", e.target.value)}>
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
        </select>
      </Field>
      <Field label="Separator">
        <input style={inputStyle} value={c.horizontalSeparator ?? " | "} onChange={(e) => set("horizontalSeparator", e.target.value)} />
      </Field>
      {items.map((id) => {
        const title = c.itemTitles?.[id] ?? { mode: "default" };
        return (
          <div key={id} style={{ border: "1px solid #334155", borderRadius: 6, padding: 6, gap: 6 }}>
            <Switch
              label={id}
              checked={c.showItems?.[id] ?? true}
              onChange={(v) => set("showItems", { ...(c.showItems ?? {}), [id]: v })}
            />
            <Field label="Title mode">
              <select
                style={inputStyle}
                value={title.mode}
                onChange={(e) =>
                  set("itemTitles", { ...(c.itemTitles ?? {}), [id]: { ...title, mode: e.target.value } })
                }
              >
                {["hidden", "default", "custom", "inline"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            {title.mode === "custom" || title.mode === "inline" ? (
              <Field label="Custom text">
                <input
                  style={inputStyle}
                  value={title.text ?? ""}
                  onChange={(e) => set("itemTitles", { ...(c.itemTitles ?? {}), [id]: { ...title, text: e.target.value } })}
                />
              </Field>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function CountdownEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { source?: string; zmanType?: string; groupId?: string; title?: string; format?: string };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const zmanim = shared?.zmanimByOffset["0"] ?? [];
  const groups = shared?.scheduleGroups ?? [];
  return (
    <div style={grid}>
      <Field label="Source">
        <select style={inputStyle} value={c.source ?? "zman"} onChange={(e) => set("source", e.target.value)}>
          <option value="zman">zman</option>
          <option value="group">group</option>
        </select>
      </Field>
      <Field label="Zman">
        <select style={inputStyle} value={c.zmanType ?? ""} onChange={(e) => set("zmanType", e.target.value)}>
          {zmanim.map((z) => (
            <option key={z.type} value={z.type}>
              {z.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Group">
        <select style={inputStyle} value={c.groupId ?? ""} onChange={(e) => set("groupId", e.target.value)}>
          <option value="">—</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
    </div>
  );
}

const EDITORS: Record<string, ComponentType<ContentEditorProps>> = {
  PLAIN_TEXT: PlainTextEditor,
  RICH_TEXT: RichTextEditor,
  DIGITAL_CLOCK: DigitalClockEditor,
  ANALOG_CLOCK: AnalogClockEditor,
  MEDIA_VIEWER: MediaViewerEditor,
  ZMANIM_TABLE: ZmanimTableEditor,
  EVENTS_TABLE: EventsTableEditor,
  SCROLLING_TICKER: ScrollingTickerEditor,
  JEWISH_INFO: JewishInfoEditor,
  COUNTDOWN_TIMER: CountdownEditor,
};

const NOTES: Record<string, string> = {
  YAHRZEIT_DISPLAY: "Fills from memorials for the board date.",
  SEFIRA_COUNTER: "Omer count fills automatically.",
  DATE_PICKER: "Shows the board Hebrew/English date.",
  FIDS_BOARD: "Rows come from minyan schedules.",
};

export function getContentEditor(type: string): ComponentType<ContentEditorProps> | null {
  return EDITORS[type] ?? null;
}

export function getContentNote(type: string): string | null {
  return NOTES[type] ?? null;
}

export function JsonFallback({ content, onChange }: { content: Record<string, unknown>; onChange: (n: Record<string, unknown>) => void }) {
  return (
    <Field label="Raw JSON">
      <textarea
        style={{ ...inputStyle, fontFamily: "monospace" }}
        rows={8}
        value={JSON.stringify(content, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value) as Record<string, unknown>);
          } catch {
            /* keep typing */
          }
        }}
      />
    </Field>
  );
}
