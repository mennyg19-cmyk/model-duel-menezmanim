"use client";

// === What's in this file ===
// W5 — the analog wall clock. Draws an SVG face with hour/minute/second hands and
// ticks every second in the board's timezone. Face, hand and tick colors are
// content options so it can match any board theme.
//
// AnalogClockContentSchema / analogClockDefaultContent — the content shape.
// AnalogClock — the renderer.

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const AnalogClockContentSchema = z.object({
  faceColor: z.string().optional(),
  borderColor: z.string().optional(),
  tickColor: z.string().optional(),
  hourHandColor: z.string().optional(),
  minuteHandColor: z.string().optional(),
  secondHandColor: z.string().optional(),
  showSeconds: z.boolean().optional(),
});
type AnalogClockContent = z.infer<typeof AnalogClockContentSchema>;

export const analogClockDefaultContent = (): AnalogClockContent => ({
  faceColor: "#ffffff",
  borderColor: "#222222",
  tickColor: "#222222",
  hourHandColor: "#222222",
  minuteHandColor: "#222222",
  secondHandColor: "#cc0000",
  showSeconds: true,
});

function Hand({ angle, length, width, color }: { angle: number; length: number; width: number; color: string }) {
  return (
    <line
      x1="50"
      y1="50"
      x2={50 + length * Math.sin((angle * Math.PI) / 180)}
      y2={50 - length * Math.cos((angle * Math.PI) / 180)}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

export function AnalogClock({ object, data }: WidgetRenderProps) {
  const content = object.content as AnalogClockContent;
  const [now, setNow] = useState<DateTime>(() => DateTime.now().setZone(data.timezone));

  useEffect(() => {
    const tick = () => setNow(DateTime.now().setZone(data.timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.timezone]);

  const seconds = now.second;
  const minutes = now.minute + seconds / 60;
  const hours = (now.hour % 12) + minutes / 60;

  return (
    <div suppressHydrationWarning style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }}>
        <circle cx="50" cy="50" r="48" fill={content.faceColor ?? "#ffffff"} stroke={content.borderColor ?? "#222"} strokeWidth="2" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + 42 * Math.sin(a)}
              y1={50 - 42 * Math.cos(a)}
              x2={50 + 46 * Math.sin(a)}
              y2={50 - 46 * Math.cos(a)}
              stroke={content.tickColor ?? "#222"}
              strokeWidth="2"
            />
          );
        })}
        <Hand angle={hours * 30} length={26} width={3.5} color={content.hourHandColor ?? "#222"} />
        <Hand angle={minutes * 6} length={38} width={2.5} color={content.minuteHandColor ?? "#222"} />
        {content.showSeconds !== false ? (
          <Hand angle={seconds * 6} length={42} width={1} color={content.secondHandColor ?? "#cc0000"} />
        ) : null}
        <circle cx="50" cy="50" r="2.5" fill={content.hourHandColor ?? "#222"} />
      </svg>
    </div>
  );
}
