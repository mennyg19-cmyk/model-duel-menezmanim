"use client";

// === What's in this file ===
// W9 — the scrolling announcement ticker. Takes the org's announcements (all by
// priority, or a chosen subset) and scrolls them across the widget like a news
// crawl. Direction follows the board language (Hebrew scrolls the other way).
//
// ScrollingTickerContentSchema / scrollingTickerDefaultContent — the content shape.
// ScrollingTicker — the renderer.

import { useEffect, useRef, useState } from "react";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const ScrollingTickerContentSchema = z.object({
  announcementIds: z.array(z.string()).optional(),
  separator: z.string().optional(),
  speed: z.number().optional(),
});
type ScrollingTickerContent = z.infer<typeof ScrollingTickerContentSchema>;

export const scrollingTickerDefaultContent = (): ScrollingTickerContent => ({ separator: "•", speed: 60 });

export function ScrollingTicker({ object, data }: WidgetRenderProps) {
  const content = object.content as ScrollingTickerContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";

  const ids = content.announcementIds ?? [];
  const list = ids.length > 0 ? data.announcements.filter((a) => ids.includes(a.id)) : data.announcements;
  const texts = list.map((a) => (isHebrew ? a.hebrewText ?? a.text : a.text)).filter(Boolean);

  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);
  const joined = texts.join("|");

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const pxPerSec = content.speed ?? 60;
    setDuration(Math.max(8, el.scrollWidth / pxPerSec));
  }, [joined, content.speed]);

  if (texts.length === 0) return null;

  const sep = content.separator ?? "•";
  const line = texts.join(`   ${sep}   `);
  const animName = `ticker-${object.id.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap" }} dir={isHebrew ? "rtl" : "ltr"}>
      <style>{`@keyframes ${animName} { from { transform: translateX(0); } to { transform: translateX(${isHebrew ? "100%" : "-100%"}); } }`}</style>
      <div ref={trackRef} style={{ display: "inline-flex", gap: "3rem", animation: `${animName} ${duration}s linear infinite`, willChange: "transform" }}>
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
