"use client";

// === What's in this file ===
// W6 — the digital wall clock. Ticks every second in the board's timezone. All
// other widgets are static snapshots; this one keeps its own time so the board
// stays live without re-fetching.
//
// content options: format24h, showSeconds, showAmPm, textAlign.

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import type { WidgetRenderProps } from "@/widgets/types";
import { formatClockTime } from "@/widgets/format";

export function DigitalClock({ object, data }: WidgetRenderProps) {
  const content = object.content as {
    format24h?: boolean;
    showSeconds?: boolean;
    showAmPm?: boolean;
    textAlign?: "left" | "center" | "right";
  };

  const [now, setNow] = useState<DateTime>(() => DateTime.now().setZone(data.timezone));

  useEffect(() => {
    const tick = () => setNow(DateTime.now().setZone(data.timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.timezone]);

  const text = formatClockTime(now, {
    use24h: content.format24h ?? false,
    showSeconds: content.showSeconds ?? true,
    hideAmPm: content.showAmPm === false,
  });

  return (
    <div
      suppressHydrationWarning
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          content.textAlign === "left" ? "flex-start" : content.textAlign === "right" ? "flex-end" : "center",
        width: "100%",
        height: "100%",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {text}
    </div>
  );
}
