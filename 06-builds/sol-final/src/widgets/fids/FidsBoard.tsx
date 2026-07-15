"use client";

// === What's in this file ===
// W16 — the FIDS board: an airport "flight information display" styled minyan
// board. Each upcoming minyan is a row (like a departure): name, room (the "gate"),
// time, and a live status (UPCOMING / NOW / DEPARTED). Times render as split-flap
// characters that physically flip when they change — the promoted first-class
// widget the user asked for (replaces the old "coming soon" placeholder).
//
// SplitFlapChar / SplitFlapText — the flip-board character animation.
// statusFor — turns a minyan time + now into a status label.
// FidsBoardContentSchema / fidsBoardDefaultContent — the content shape.
// FidsBoard — the renderer.

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";
import { formatZmanTime } from "@/widgets/format";

export const FidsBoardContentSchema = z.object({
  groupIds: z.array(z.string()).optional(),
  maxRows: z.number().int().min(1).optional(),
  showRoom: z.boolean().optional(),
  use24h: z.boolean().optional(),
  title: z.string().optional(),
  titleHebrew: z.string().optional(),
  nowWindowMinutes: z.number().int().optional(),
});
type FidsBoardContent = z.infer<typeof FidsBoardContentSchema>;

export const fidsBoardDefaultContent = (): FidsBoardContent => ({
  maxRows: 6,
  showRoom: true,
  use24h: false,
  nowWindowMinutes: 15,
});

function SplitFlapChar({ char }: { char: string }) {
  return (
    <span
      key={char}
      style={{
        display: "inline-block",
        minWidth: char === ":" || char === " " ? "0.4em" : "0.62em",
        textAlign: "center",
        background: char === ":" || char === " " ? "transparent" : "rgba(0,0,0,0.55)",
        borderRadius: 2,
        margin: "0 1px",
        padding: char === ":" || char === " " ? 0 : "0 1px",
        animation: "flap 0.45s ease",
        transformOrigin: "center",
      }}
    >
      {char}
    </span>
  );
}

function SplitFlapText({ text }: { text: string }) {
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
      {text.split("").map((c, i) => (
        <SplitFlapChar key={`${i}-${c}`} char={c} />
      ))}
    </span>
  );
}

function statusFor(timeIso: string | null, nowMs: number, windowMin: number, isHebrew: boolean): { label: string; color: string } {
  if (!timeIso) return { label: "", color: "#aaa" };
  const t = DateTime.fromISO(timeIso).toMillis();
  const diffMin = (t - nowMs) / 60_000;
  if (diffMin < -1) return { label: isHebrew ? "עבר" : "DEPARTED", color: "#888" };
  if (diffMin <= windowMin) return { label: isHebrew ? "עכשיו" : "NOW", color: "#37d67a" };
  return { label: isHebrew ? "בקרוב" : "UPCOMING", color: "#f5c518" };
}

export function FidsBoard({ object, data }: WidgetRenderProps) {
  const content = object.content as FidsBoardContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const groupFilter = content.groupIds ?? [];
  const rows = data.minyanim
    .filter((m) => (groupFilter.length > 0 ? m.groupIds.some((g) => groupFilter.includes(g)) : true))
    .filter((m) => m.time)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
    .slice(0, content.maxRows ?? 6);

  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;

  return (
    <div
      suppressHydrationWarning
      dir={isHebrew ? "rtl" : "ltr"}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: "monospace" }}
    >
      <style>{`@keyframes flap { 0% { transform: rotateX(-90deg); opacity: 0.3; } 100% { transform: rotateX(0); opacity: 1; } }`}</style>
      {title ? <div style={{ fontWeight: 700, marginBottom: 6, textAlign: "center", letterSpacing: "0.1em" }}>{title}</div> : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((m) => {
          const status = statusFor(m.time, nowMs, content.nowWindowMinutes ?? 15, isHebrew);
          const name = isHebrew ? m.hebrewName : m.name;
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              {content.showRoom ? <span style={{ opacity: 0.7, minWidth: "3em", textAlign: "center" }}>{m.room ?? ""}</span> : null}
              <SplitFlapText text={formatZmanTime(m.time, data.timezone, { use24h: content.use24h ?? false, hideAmPm: true })} />
              <span style={{ color: status.color, minWidth: "6em", textAlign: isHebrew ? "left" : "right", fontSize: "0.8em" }}>{status.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
