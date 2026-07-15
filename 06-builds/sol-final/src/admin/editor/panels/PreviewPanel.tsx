"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const HEBREW_MONTHS = [
  [1, "Nisan"],
  [2, "Iyar"],
  [3, "Sivan"],
  [4, "Tamuz"],
  [5, "Av"],
  [6, "Elul"],
  [7, "Tishri"],
  [8, "Heshvan"],
  [9, "Kislev"],
  [10, "Tevet"],
  [11, "Shevat"],
  [12, "Adar / Adar I"],
  [13, "Adar II"],
] as const;

function hebrewParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-u-ca-hebrew", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  const monthName = parts.find((part) => part.type === "month")?.value ?? "";
  const month = monthName === "Adar II" ? 13 : monthName === "Adar" || monthName === "Adar I" ? 12 : HEBREW_MONTHS.find((entry) => entry[1] === monthName)?.[0] ?? 7;
  return { year, month, day };
}

function gregorianForHebrew(year: number, month: number, day: number): Date | null {
  const candidate = new Date(Date.UTC(year - 3761, 0, 1, 12));
  for (let offset = 0; offset < 460; offset++) {
    const current = new Date(candidate);
    current.setUTCDate(candidate.getUTCDate() + offset);
    const hebrew = hebrewParts(current);
    if (hebrew.year === year && hebrew.month === month && hebrew.day === day) return current;
  }
  return null;
}

export function PreviewPanel() {
  const { orgSlug, styleId, screens } = useEditorConfig();
  const router = useRouter();
  const previewAtIso = useUi((s) => s.previewAtIso);
  const setPreviewAt = useUi((s) => s.setPreviewAt);
  const previewScreenId = useUi((s) => s.previewScreenId);
  const setPreviewScreen = useUi((s) => s.setPreviewScreen);
  const sharedData = useUi((s) => s.sharedData);
  const currentHebrew = useMemo(() => hebrewParts(new Date()), []);
  const [hebrewYear, setHebrewYear] = useState(currentHebrew.year);
  const [hebrewMonth, setHebrewMonth] = useState(currentHebrew.month);
  const [hebrewDay, setHebrewDay] = useState(currentHebrew.day);
  const [hebrewError, setHebrewError] = useState<string | null>(null);

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
            if (screen?.assignedStyleId && screen.assignedStyleId !== styleId) {
              router.push(`/admin/${orgSlug}/editor/${screen.assignedStyleId}`);
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
      <strong>Hebrew date</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 6 }}>
        <input type="number" aria-label="Hebrew year" style={inputStyle} value={hebrewYear} onChange={(event) => setHebrewYear(Number(event.target.value) || currentHebrew.year)} />
        <select aria-label="Hebrew month" style={inputStyle} value={hebrewMonth} onChange={(event) => setHebrewMonth(Number(event.target.value))}>
          {HEBREW_MONTHS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input type="number" min={1} max={30} aria-label="Hebrew day" style={inputStyle} value={hebrewDay} onChange={(event) => setHebrewDay(Number(event.target.value) || 1)} />
      </div>
      <button
        type="button"
        style={btn}
        onClick={() => {
          const date = gregorianForHebrew(hebrewYear, hebrewMonth, hebrewDay);
          if (!date) {
            setHebrewError("That Hebrew date does not exist.");
            return;
          }
          setHebrewError(null);
          applyDate(date.toISOString().slice(0, 10));
        }}
      >
        Apply Hebrew date
      </button>
      {hebrewError ? <span style={{ color: "#fca5a5" }}>{hebrewError}</span> : null}

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

      <a
        href={previewScreenId ? `/show/${orgSlug}/${previewScreenId}` : undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!previewScreenId}
        style={{ color: "#38bdf8", opacity: previewScreenId ? 1 : 0.45 }}
      >
        Open live board ↗
      </a>

      <ZmanLimitEditor zmanTimes={zmanTimes} />
    </div>
  );
}
