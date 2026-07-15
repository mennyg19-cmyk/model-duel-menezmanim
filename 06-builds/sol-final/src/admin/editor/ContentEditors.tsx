"use client";

import type { SharedBoardData } from "@/core/board/types";
import type { EditorObject } from "./types";
import { Field, inputStyle } from "./ui";
import { useState, type CSSProperties, type ComponentType } from "react";
import { useEditorConfig, useUi } from "./state/StoreProvider";

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
  const { orgId } = useEditorConfig();
  const setSharedData = useUi((state) => state.setSharedData);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      <Field label="Upload media">
        <input
          type="file"
          accept="image/*,video/*"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.set("file", file);
            setUploading(true);
            setUploadError(null);
            void fetch(`/api/org/${orgId}/media`, { method: "POST", body: form })
              .then(async (response) => {
                const json = (await response.json()) as {
                  media?: NonNullable<SharedBoardData["media"]>[number];
                  error?: string;
                };
                if (!response.ok || !json.media) throw new Error(json.error ?? "Upload failed");
                set("mediaIds", [...(c.mediaIds ?? []), json.media.id]);
                if (shared) setSharedData({ ...shared, media: [...shared.media, json.media] });
              })
              .catch((error: unknown) => setUploadError(error instanceof Error ? error.message : "Upload failed"))
              .finally(() => setUploading(false));
          }}
        />
      </Field>
      {uploading ? <span style={{ fontSize: 11 }}>Uploading…</span> : null}
      {uploadError ? <span style={{ color: "#fca5a5", fontSize: 11 }}>{uploadError}</span> : null}
    </div>
  );
}

export function ZmanimTableEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as {
    daysAhead?: number;
    title?: string;
    titleHebrew?: string;
    zmanim?: Record<string, boolean>;
    use24h?: boolean;
    hideAmPm?: boolean;
  };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const off = String(c.daysAhead ?? 0);
  const list = shared?.zmanimByOffset[off] ?? shared?.zmanimByOffset["0"] ?? [];
  const checked = (t: string) => (c.zmanim ? !!c.zmanim[t] : true);
  return (
    <div style={grid}>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(e) => set("titleHebrew", e.target.value)} />
      </Field>
      <Field label="Day offset">
        <input type="number" style={inputStyle} value={c.daysAhead ?? 0} onChange={(e) => set("daysAhead", Number(e.target.value) || 0)} />
      </Field>
      <Switch label="24-hour" checked={!!c.use24h} onChange={(v) => set("use24h", v)} />
      <Switch label="Hide AM/PM" checked={!!c.hideAmPm} onChange={(v) => set("hideAmPm", v)} />
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
    titleHebrew?: string;
    groupIds?: string[];
    showRoom?: boolean;
    emphasizeCurrentNext?: boolean;
    use24h?: boolean;
    hideAmPm?: boolean;
  };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const groups = (shared?.scheduleGroups ?? []).map((g) => ({ id: g.id, label: g.name }));
  return (
    <div style={grid}>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(e) => set("titleHebrew", e.target.value)} />
      </Field>
      <MultiSelect label="Groups" options={groups} selected={c.groupIds ?? []} onChange={(ids) => set("groupIds", ids)} />
      <Switch label="Show room" checked={!!c.showRoom} onChange={(v) => set("showRoom", v)} />
      <Switch label="Emphasize current/next" checked={!!c.emphasizeCurrentNext} onChange={(v) => set("emphasizeCurrentNext", v)} />
      <Switch label="24-hour" checked={!!c.use24h} onChange={(v) => set("use24h", v)} />
      <Switch label="Hide AM/PM" checked={!!c.hideAmPm} onChange={(v) => set("hideAmPm", v)} />
    </div>
  );
}

export function ScrollingTickerEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { announcementIds?: string[]; separator?: string; speed?: number };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const opts = (shared?.announcements ?? []).map((a) => ({ id: a.id, label: a.text.slice(0, 40) }));
  return (
    <div style={grid}>
      <MultiSelect label="Announcements (empty = all)" options={opts} selected={c.announcementIds ?? []} onChange={(ids) => set("announcementIds", ids)} />
      <Field label="Separator">
        <input style={inputStyle} value={c.separator ?? " • "} onChange={(e) => set("separator", e.target.value)} />
      </Field>
      <Field label="Speed (px/s)">
        <input type="number" min={5} max={200} style={inputStyle} value={c.speed ?? 60} onChange={(e) => set("speed", Number(e.target.value) || 60)} />
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
    daysAhead?: number;
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
      <Field label="Day offset">
        <input type="number" style={inputStyle} value={c.daysAhead ?? 0} onChange={(e) => set("daysAhead", Number(e.target.value) || 0)} />
      </Field>
      <Field label="Separator">
        <input style={inputStyle} value={c.horizontalSeparator ?? " | "} onChange={(e) => set("horizontalSeparator", e.target.value)} />
      </Field>
      {items.map((id) => {
        const title = c.itemTitles?.[id] ?? { mode: "default" };
        return (
          <div key={id} style={{ border: "1px solid #334155", borderRadius: 6, padding: 6, gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => {
                  const index = items.indexOf(id);
                  if (index <= 0) return;
                  const next = items.slice();
                  [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                  set("itemOrder", next);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => {
                  const index = items.indexOf(id);
                  if (index >= items.length - 1) return;
                  const next = items.slice();
                  [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
                  set("itemOrder", next);
                }}
              >
                ↓
              </button>
            </div>
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
  const c = content as {
    targetType?: "zman" | "minyan" | "time";
    zmanType?: string;
    minyanId?: string;
    fixedTime?: string;
    label?: string;
    labelHebrew?: string;
    hideWhenPassed?: boolean;
  };
  const set = (k: string, v: unknown) => onChange({ ...content, [k]: v });
  const zmanim = shared?.zmanimByOffset["0"] ?? [];
  return (
    <div style={grid}>
      <Field label="Source">
        <select style={inputStyle} value={c.targetType ?? "zman"} onChange={(e) => set("targetType", e.target.value)}>
          <option value="zman">zman</option>
          <option value="minyan">minyan</option>
          <option value="time">fixed time</option>
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
      <Field label="Minyan">
        <select style={inputStyle} value={c.minyanId ?? ""} onChange={(e) => set("minyanId", e.target.value)}>
          <option value="">—</option>
          {(shared?.minyanim ?? []).map((minyan) => (
            <option key={minyan.id} value={minyan.id}>
              {minyan.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Fixed time">
        <input type="time" style={inputStyle} value={c.fixedTime ?? ""} onChange={(e) => set("fixedTime", e.target.value)} />
      </Field>
      <Field label="Label">
        <input style={inputStyle} value={c.label ?? ""} onChange={(e) => set("label", e.target.value)} />
      </Field>
      <Field label="Hebrew label">
        <input dir="rtl" style={inputStyle} value={c.labelHebrew ?? ""} onChange={(e) => set("labelHebrew", e.target.value)} />
      </Field>
      <Switch label="Hide when passed" checked={!!c.hideWhenPassed} onChange={(v) => set("hideWhenPassed", v)} />
    </div>
  );
}

export function YahrzeitEditor({ content, onChange }: ContentEditorProps) {
  const c = content as {
    title?: string;
    titleHebrew?: string;
    upcomingDays?: number;
    showRelationship?: boolean;
    showEnglishName?: boolean;
  };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(event) => set("title", event.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(event) => set("titleHebrew", event.target.value)} />
      </Field>
      <Field label="Upcoming days">
        <input type="number" min={0} style={inputStyle} value={c.upcomingDays ?? 0} onChange={(event) => set("upcomingDays", Number(event.target.value) || 0)} />
      </Field>
      <Switch label="Show relationship" checked={c.showRelationship ?? true} onChange={(value) => set("showRelationship", value)} />
      <Switch label="Show English name" checked={c.showEnglishName ?? true} onChange={(value) => set("showEnglishName", value)} />
    </div>
  );
}

export function SponsorEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as { sponsorIds?: string[]; intervalSeconds?: number; title?: string; titleHebrew?: string };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <MultiSelect
        label="Sponsors (empty = all)"
        options={(shared?.sponsors ?? []).map((sponsor) => ({ id: sponsor.id, label: sponsor.text }))}
        selected={c.sponsorIds ?? []}
        onChange={(ids) => set("sponsorIds", ids)}
      />
      <Field label="Interval (seconds)">
        <input type="number" min={1} style={inputStyle} value={c.intervalSeconds ?? 8} onChange={(event) => set("intervalSeconds", Number(event.target.value) || 8)} />
      </Field>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(event) => set("title", event.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(event) => set("titleHebrew", event.target.value)} />
      </Field>
    </div>
  );
}

export function ShapeEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { shape?: string; orientation?: string; color?: string; thickness?: number; cornerRadius?: number };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <Field label="Shape">
        <select style={inputStyle} value={c.shape ?? "line"} onChange={(event) => set("shape", event.target.value)}>
          <option value="line">line</option>
          <option value="rectangle">rectangle</option>
        </select>
      </Field>
      <Field label="Orientation">
        <select style={inputStyle} value={c.orientation ?? "horizontal"} onChange={(event) => set("orientation", event.target.value)}>
          <option value="horizontal">horizontal</option>
          <option value="vertical">vertical</option>
        </select>
      </Field>
      <Field label="Color">
        <input type="color" style={inputStyle} value={c.color ?? "#888888"} onChange={(event) => set("color", event.target.value)} />
      </Field>
      <Field label="Thickness">
        <input type="number" min={1} style={inputStyle} value={c.thickness ?? 2} onChange={(event) => set("thickness", Number(event.target.value) || 1)} />
      </Field>
      <Field label="Corner radius">
        <input type="number" min={0} style={inputStyle} value={c.cornerRadius ?? 0} onChange={(event) => set("cornerRadius", Number(event.target.value) || 0)} />
      </Field>
    </div>
  );
}

export function TefilahNotesEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { daysAhead?: number; title?: string; titleHebrew?: string; layout?: string; separator?: string };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <Field label="Day offset">
        <input type="number" style={inputStyle} value={c.daysAhead ?? 0} onChange={(event) => set("daysAhead", Number(event.target.value) || 0)} />
      </Field>
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(event) => set("title", event.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(event) => set("titleHebrew", event.target.value)} />
      </Field>
      <Field label="Layout">
        <select style={inputStyle} value={c.layout ?? "vertical"} onChange={(event) => set("layout", event.target.value)}>
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
        </select>
      </Field>
      <Field label="Separator">
        <input style={inputStyle} value={c.separator ?? "·"} onChange={(event) => set("separator", event.target.value)} />
      </Field>
    </div>
  );
}

export function SefiraEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { daysAhead?: number; showEnglish?: boolean; lineHeight?: number };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <Field label="Day offset">
        <input type="number" style={inputStyle} value={c.daysAhead ?? 0} onChange={(event) => set("daysAhead", Number(event.target.value) || 0)} />
      </Field>
      <Switch label="Show English" checked={c.showEnglish ?? true} onChange={(value) => set("showEnglish", value)} />
      <Field label="Line height">
        <input type="number" step="0.1" style={inputStyle} value={c.lineHeight ?? 1.2} onChange={(event) => set("lineHeight", Number(event.target.value) || 1.2)} />
      </Field>
    </div>
  );
}

export function FidsEditor({ content, onChange, shared }: ContentEditorProps) {
  const c = content as {
    groupIds?: string[];
    maxRows?: number;
    showRoom?: boolean;
    use24h?: boolean;
    title?: string;
    titleHebrew?: string;
    nowWindowMinutes?: number;
  };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <MultiSelect
        label="Groups (empty = all)"
        options={(shared?.scheduleGroups ?? []).map((group) => ({ id: group.id, label: group.name }))}
        selected={c.groupIds ?? []}
        onChange={(ids) => set("groupIds", ids)}
      />
      <Field label="Maximum rows">
        <input type="number" min={1} style={inputStyle} value={c.maxRows ?? 6} onChange={(event) => set("maxRows", Number(event.target.value) || 1)} />
      </Field>
      <Field label="NOW window (minutes)">
        <input type="number" min={0} style={inputStyle} value={c.nowWindowMinutes ?? 15} onChange={(event) => set("nowWindowMinutes", Number(event.target.value) || 0)} />
      </Field>
      <Switch label="Show room" checked={c.showRoom ?? true} onChange={(value) => set("showRoom", value)} />
      <Switch label="24-hour" checked={!!c.use24h} onChange={(value) => set("use24h", value)} />
      <Field label="Title">
        <input style={inputStyle} value={c.title ?? ""} onChange={(event) => set("title", event.target.value)} />
      </Field>
      <Field label="Hebrew title">
        <input dir="rtl" style={inputStyle} value={c.titleHebrew ?? ""} onChange={(event) => set("titleHebrew", event.target.value)} />
      </Field>
    </div>
  );
}

export function DatePickerEditor({ content, onChange }: ContentEditorProps) {
  const c = content as { showShabbatButton?: boolean; showTodayButton?: boolean };
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  return (
    <div style={grid}>
      <Switch label="Show Today button" checked={c.showTodayButton ?? true} onChange={(value) => set("showTodayButton", value)} />
      <Switch label="Show Shabbos button" checked={c.showShabbatButton ?? true} onChange={(value) => set("showShabbatButton", value)} />
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
  YAHRZEIT_DISPLAY: YahrzeitEditor,
  SPONSOR_DISPLAY: SponsorEditor,
  SHAPE_DIVIDER: ShapeEditor,
  TEFILAH_NOTES: TefilahNotesEditor,
  SEFIRA_COUNTER: SefiraEditor,
  FIDS_BOARD: FidsEditor,
  DATE_PICKER: DatePickerEditor,
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
