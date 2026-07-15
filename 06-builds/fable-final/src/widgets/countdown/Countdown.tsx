"use client";

// === What's in this file ===
// W7 — a live countdown to a target time: a zman (e.g. candle lighting), a minyan,
// or a fixed clock time. Ticks every second in the board's timezone and shows the
// time remaining as H:MM:SS (or MM:SS under an hour), with an optional label.
//
// CountdownContentSchema / countdownDefaultContent — the content shape.
// Countdown — the renderer.

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const CountdownContentSchema = z.object({
  targetType: z.enum(["zman", "minyan", "time"]).optional(),
  zmanType: z.string().optional(),
  minyanId: z.string().optional(),
  fixedTime: z.string().optional(),
  label: z.string().optional(),
  labelHebrew: z.string().optional(),
  hideWhenPassed: z.boolean().optional(),
});
type CountdownContent = z.infer<typeof CountdownContentSchema>;

export const countdownDefaultContent = (): CountdownContent => ({
  targetType: "zman",
  zmanType: "SHKIAH",
  label: "Until Shkiah",
});

function targetMillis(content: CountdownContent, data: WidgetRenderProps["data"]): number | null {
  const type = content.targetType ?? "zman";
  if (type === "zman") {
    const z = (data.zmanimByOffset["0"] ?? []).find((x) => x.type === content.zmanType);
    return z?.time ? DateTime.fromISO(z.time, { zone: data.timezone }).toMillis() : null;
  }
  if (type === "minyan") {
    const m = data.minyanim.find((x) => x.id === content.minyanId);
    return m?.time ? DateTime.fromISO(m.time, { zone: data.timezone }).toMillis() : null;
  }
  if (type === "time" && content.fixedTime) {
    const [h, mi] = content.fixedTime.split(":").map(Number);
    const dt = DateTime.now().setZone(data.timezone).set({ hour: h ?? 0, minute: mi ?? 0, second: 0, millisecond: 0 });
    return dt.toMillis();
  }
  return null;
}

function format(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function Countdown({ object, data }: WidgetRenderProps) {
  const content = object.content as CountdownContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = targetMillis(content, data);
  if (target === null) return null;
  const remaining = target - nowMs;
  if (remaining <= 0 && (content.hideWhenPassed ?? false)) return null;

  const label = isHebrew ? content.labelHebrew ?? content.label : content.label ?? content.labelHebrew;

  return (
    <div
      suppressHydrationWarning
      dir={isHebrew ? "rtl" : "ltr"}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}
    >
      {label ? <div style={{ opacity: 0.85 }}>{label}</div> : null}
      <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{remaining <= 0 ? format(0) : format(remaining)}</div>
    </div>
  );
}
