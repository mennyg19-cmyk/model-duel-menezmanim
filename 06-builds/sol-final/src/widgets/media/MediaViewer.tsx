"use client";

// === What's in this file ===
// W12 — the image / media viewer. Shows one picture, or runs a slideshow through a
// chosen set (or all) of the org's media, with a configurable interval, fit mode
// (cover / contain) and a fade between slides. Plays videos inline when the item
// is a video.
//
// MediaViewerContentSchema / mediaViewerDefaultContent — the content shape.
// MediaViewer — the renderer.

import { useEffect, useState } from "react";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const MediaViewerContentSchema = z.object({
  mediaIds: z.array(z.string()).optional(),
  intervalSeconds: z.number().optional(),
  fit: z.enum(["cover", "contain"]).optional(),
  fade: z.boolean().optional(),
});
type MediaViewerContent = z.infer<typeof MediaViewerContentSchema>;

export const mediaViewerDefaultContent = (): MediaViewerContent => ({ intervalSeconds: 10, fit: "contain", fade: true });

export function MediaViewer({ object, data }: WidgetRenderProps) {
  const content = object.content as MediaViewerContent;
  const ids = content.mediaIds ?? [];
  const items = ids.length > 0 ? data.media.filter((m) => ids.includes(m.id)) : data.media;

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), (content.intervalSeconds ?? 10) * 1000);
    return () => clearInterval(id);
  }, [items.length, content.intervalSeconds]);

  if (items.length === 0) return null;
  const item = items[index % items.length]!;
  const fit = content.fit ?? "contain";
  const isVideo = item.kind?.startsWith("video");

  return (
    <div suppressHydrationWarning style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {isVideo ? (
        <video key={item.id} src={item.url} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: fit }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item.id}
          src={item.url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: fit, animation: content.fade !== false ? "media-fade 0.8s ease" : undefined }}
        />
      )}
      <style>{`@keyframes media-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
