"use client";

import { useMemo, useState } from "react";
import { useEditorConfig, useUi } from "../state/StoreProvider";
import { ZmanLimitEditor } from "../ZmanLimitEditor";
import { Field, btn, inputStyle } from "../ui";

/** Next 12 Saturdays from today (local). */
function nextShabbosim(count = 12): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) out.push(new Date(d));
  }
  return out;
}

export function PreviewPanel() {
  const { orgSlug, screens } = useEditorConfig();
  const previewAtIso = useUi((s) => s.previewAtIso);
  const setPreviewAt = useUi((s) => s.setPreviewAt);
  const previewScreenId = useUi((s) => s.previewScreenId);
  const setPreviewScreen = useUi((s) => s.setPreviewScreen);
  const sharedData = useUi((s) => s.sharedData);
  const [hebrewHint, setHebrewHint] = useState("");

  const shabbosim = useMemo(() => nextShabbosim(), []);
  const zmanTimes: Record<string, string | null> = {};
  for (const z of sharedData?.zmanimByOffset["0"] ?? []) {
    zmanTimes[z.type] = z.time;
  }

  const dateValue = previewAtIso ? previewAtIso.slice(0, 10) : "";
  const timeValue = previewAtIso ? previewAtIso.slice(11, 16) : "12:00";

  function applyDate(date: string, time = timeValue || "12:00") {
    if (!date) {
      setPreviewAt(null);
      return;
    }
    setPreviewAt(`${date}T${time}:00`);
  }

  return (
    <div style={{ padding: 10, gap: 10, fontSize: 12 }}>
      <Field label="Preview screen">
        <select
          style={inputStyle}
          value={previewScreenId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            setPreviewScreen(id);
            const screen = screens.find((s) => s.id === id);
            if (screen?.assignedStyleId) {
              // screen select for preview only — style open stays as editor document (E6.3)
            }
          }}
        >
          {screens.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.assignedStyleId ? "" : " (no style)"}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Gregorian date">
        <input type="date" style={inputStyle} value={dateValue} onChange={(e) => applyDate(e.target.value)} />
      </Field>
      <Field label="Time">
        <input type="time" style={inputStyle} value={timeValue} onChange={(e) => applyDate(dateValue || new Date().toISOString().slice(0, 10), e.target.value)} />
      </Field>
      <Field label="Hebrew date hint (free text)">
        <input style={inputStyle} value={hebrewHint} onChange={(e) => setHebrewHint(e.target.value)} placeholder="e.g. 15 Nissan — set Gregorian above" />
      </Field>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={btn} onClick={() => setPreviewAt(null)}>
          Reset to now
        </button>
        {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
          <button
            key={dow}
            type="button"
            style={btn}
            onClick={() => {
              const d = new Date();
              d.setHours(12, 0, 0, 0);
              while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
              applyDate(d.toISOString().slice(0, 10));
            }}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dow]}
          </button>
        ))}
      </div>

      <strong>Next Shabbosim</strong>
      <div style={{ display: "grid", gap: 4, maxHeight: 140, overflow: "auto" }}>
        {shabbosim.map((d) => (
          <button key={d.toISOString()} type="button" style={btn} onClick={() => applyDate(d.toISOString().slice(0, 10))}>
            {d.toLocaleDateString()}
          </button>
        ))}
      </div>

      <a href={`/show/${orgSlug}`} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>
        Open live board ↗
      </a>

      <ZmanLimitEditor zmanTimes={zmanTimes} />
    </div>
  );
}
