"use client";

// === What's in this file ===
// W17 — the interactive date picker for a public board. Lets a viewer step the
// whole board to another day: Previous / Today / Next, a one-tap "Shabbos" jump,
// and a popup month calendar. It drives the board by putting ?date=YYYY-MM-DD in
// the URL; the /show page reads that and rebuilds the snapshot for that day, so
// every widget moves together (SH.8).
//
// DatePickerContentSchema / datePickerDefaultContent — the content shape.
// DatePicker — the renderer.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const DatePickerContentSchema = z.object({
  showShabbatButton: z.boolean().optional(),
  showTodayButton: z.boolean().optional(),
});
type DatePickerContent = z.infer<typeof DatePickerContentSchema>;

export const datePickerDefaultContent = (): DatePickerContent => ({ showShabbatButton: true, showTodayButton: true });

const ISO_DAY = "yyyy-MM-dd";

export function DatePicker({ object, data }: WidgetRenderProps) {
  const content = object.content as DatePickerContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const today = DateTime.now().setZone(data.timezone).startOf("day");
  const paramDate = params.get("date");
  const current = paramDate ? DateTime.fromISO(paramDate, { zone: data.timezone }).startOf("day") : today;

  function goto(date: DateTime) {
    const isToday = date.hasSame(today, "day");
    const url = new URL(window.location.href);
    if (isToday) url.searchParams.delete("date");
    else url.searchParams.set("date", date.toFormat(ISO_DAY));
    router.push(`${url.pathname}${url.search}`);
    setOpen(false);
  }

  function nextShabbos() {
    // Luxon weekday: 6 = Saturday. Jump to the coming Saturday (today if it is one).
    let d = current;
    for (let i = 0; i < 7; i++) {
      if (d.weekday === 6) break;
      d = d.plus({ days: 1 });
    }
    return d.hasSame(current, "day") ? current.plus({ days: 7 }) : d;
  }

  const label = current.hasSame(today, "day")
    ? isHebrew ? "היום" : "Today"
    : current.toFormat("ccc, LLL d");

  const btn: React.CSSProperties = {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid currentColor",
    borderRadius: 6,
    padding: "2px 10px",
    cursor: "pointer",
    color: "inherit",
    font: "inherit",
  };

  return (
    <div dir={isHebrew ? "rtl" : "ltr"} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", flexWrap: "wrap" }}>
      <button style={btn} onClick={() => goto(current.minus({ days: 1 }))} aria-label="previous day">‹</button>
      <button style={btn} onClick={() => setOpen((o) => !o)}>{label}</button>
      <button style={btn} onClick={() => goto(current.plus({ days: 1 }))} aria-label="next day">›</button>
      {content.showTodayButton !== false ? <button style={btn} onClick={() => goto(today)}>{isHebrew ? "היום" : "Today"}</button> : null}
      {content.showShabbatButton !== false ? <button style={btn} onClick={() => goto(nextShabbos())}>{isHebrew ? "שבת" : "Shabbos"}</button> : null}

      {open ? <MonthCalendar anchor={current} timezone={data.timezone} onPick={goto} /> : null}
    </div>
  );
}

function MonthCalendar({ anchor, timezone, onPick }: { anchor: DateTime; timezone: string; onPick: (d: DateTime) => void }) {
  const [month, setMonth] = useState(anchor.startOf("month"));
  const start = month.startOf("month");
  const firstCol = start.weekday % 7; // Sunday-first grid
  const daysInMonth = month.daysInMonth ?? 30;
  const today = DateTime.now().setZone(timezone).startOf("day");

  const cells: (DateTime | null)[] = [];
  for (let i = 0; i < firstCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(start.set({ day: d }));

  const cell: React.CSSProperties = { width: 28, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4, fontSize: 12 };

  return (
    <div style={{ position: "absolute", top: "100%", marginTop: 6, background: "#111", color: "#fff", border: "1px solid #444", borderRadius: 8, padding: 8, zIndex: 10, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
        <button style={{ cursor: "pointer", background: "none", border: "none", color: "#fff" }} onClick={() => setMonth(month.minus({ months: 1 }))}>‹</button>
        <span style={{ fontSize: 13 }}>{month.toFormat("LLLL yyyy")}</span>
        <button style={{ cursor: "pointer", background: "none", border: "none", color: "#fff" }} onClick={() => setMonth(month.plus({ months: 1 }))}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ ...cell, opacity: 0.5, cursor: "default" }}>{d}</div>
        ))}
        {cells.map((d, i) =>
          d ? (
            <div
              key={i}
              style={{ ...cell, background: d.hasSame(anchor, "day") ? "#2563eb" : d.hasSame(today, "day") ? "#333" : "transparent" }}
              onClick={() => onPick(d)}
            >
              {d.day}
            </div>
          ) : (
            <div key={i} style={cell} />
          ),
        )}
      </div>
    </div>
  );
}
