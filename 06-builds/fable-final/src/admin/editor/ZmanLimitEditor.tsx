"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ZmanType } from "@/core/zman-types";

const ZMAN_OPTIONS = Object.values(ZmanType);

/** P6.16 — preview earliest/latest/round/offset for a zman against shared preview data. */
export function ZmanLimitEditor({
  zmanTimes,
}: {
  /** ISO times keyed by zman type from shared board data (offset 0). */
  zmanTimes: Record<string, string | null>;
}) {
  const [zman, setZman] = useState<string>("SHKIAH");
  const [earliest, setEarliest] = useState("06:00");
  const [latest, setLatest] = useState("22:00");
  const [roundTo, setRoundTo] = useState(5);
  const [offsetMin, setOffsetMin] = useState(0);

  const result = useMemo(() => {
    const iso = zmanTimes[zman];
    if (!iso) return { label: "No time for this zman on preview date.", value: null as string | null };
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + offsetMin);
    const hh = d.getHours();
    const mm = d.getMinutes();
    const rounded = Math.round(mm / roundTo) * roundTo;
    d.setMinutes(rounded, 0, 0);
    const asMin = d.getHours() * 60 + d.getMinutes();
    const [eh, em] = earliest.split(":").map(Number);
    const [lh, lm] = latest.split(":").map(Number);
    const lo = (eh ?? 0) * 60 + (em ?? 0);
    const hi = (lh ?? 23) * 60 + (lm ?? 59);
    const clamped = Math.min(hi, Math.max(lo, asMin));
    const outH = Math.floor(clamped / 60);
    const outM = clamped % 60;
    return {
      label: "Clamped preview",
      value: `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`,
    };
  }, [zman, zmanTimes, earliest, latest, roundTo, offsetMin]);

  const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12 };
  const input: CSSProperties = {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
  };

  return (
    <div style={{ display: "grid", gap: 8, padding: 8, border: "1px solid #334155", borderRadius: 8 }}>
      <strong style={{ fontSize: 12 }}>Zman limit preview (P6.16)</strong>
      <label style={field}>
        Zman
        <select value={zman} onChange={(e) => setZman(e.target.value)} style={input}>
          {ZMAN_OPTIONS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label style={field}>
          Earliest
          <input type="time" value={earliest} onChange={(e) => setEarliest(e.target.value)} style={input} />
        </label>
        <label style={field}>
          Latest
          <input type="time" value={latest} onChange={(e) => setLatest(e.target.value)} style={input} />
        </label>
        <label style={field}>
          Round (min)
          <input type="number" min={1} value={roundTo} onChange={(e) => setRoundTo(Number(e.target.value) || 1)} style={input} />
        </label>
        <label style={field}>
          Offset (min)
          <input type="number" value={offsetMin} onChange={(e) => setOffsetMin(Number(e.target.value) || 0)} style={input} />
        </label>
      </div>
      <div style={{ fontSize: 13, color: "#94a3b8" }}>
        {result.label}: <strong style={{ color: "#f8fafc" }}>{result.value ?? "—"}</strong>
      </div>
    </div>
  );
}
