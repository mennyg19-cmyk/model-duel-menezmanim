"use client";

// === What's in this file ===
// W11 — the sponsor box. Rotates through the org's active sponsor messages one at
// a time (a gentle fade between them), in the board language. A first-class widget
// so v1 sponsor layouts round-trip rather than being faked with a text box.
//
// SponsorContentSchema / sponsorDefaultContent — the content shape.
// SponsorDisplay — the renderer.

import { useEffect, useState } from "react";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const SponsorContentSchema = z.object({
  sponsorIds: z.array(z.string()).optional(),
  intervalSeconds: z.number().optional(),
  title: z.string().optional(),
  titleHebrew: z.string().optional(),
});
type SponsorContent = z.infer<typeof SponsorContentSchema>;

export const sponsorDefaultContent = (): SponsorContent => ({ intervalSeconds: 8 });

export function SponsorDisplay({ object, data }: WidgetRenderProps) {
  const content = object.content as SponsorContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";

  const ids = content.sponsorIds ?? [];
  const list = ids.length > 0 ? data.sponsors.filter((s) => ids.includes(s.id)) : data.sponsors;
  const texts = list.map((s) => (isHebrew ? s.hebrewText ?? s.text : s.text)).filter(Boolean);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (texts.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % texts.length), (content.intervalSeconds ?? 8) * 1000);
    return () => clearInterval(id);
  }, [texts.length, content.intervalSeconds]);

  if (texts.length === 0) return null;
  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;
  const current = texts[index % texts.length];

  return (
    <div
      suppressHydrationWarning
      dir={isHebrew ? "rtl" : "ltr"}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center" }}
    >
      {title ? <div style={{ opacity: 0.7, fontSize: "0.8em" }}>{title}</div> : null}
      <div key={index} style={{ animation: "sponsor-fade 0.6s ease" }}>{current}</div>
      <style>{`@keyframes sponsor-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
