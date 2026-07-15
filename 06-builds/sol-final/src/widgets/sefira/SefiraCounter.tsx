// === What's in this file ===
// W15 — the standalone Sefiras HaOmer counter. The snapshot's calendar bundle
// already says whether today is in the Omer and how it's worded (Hebrew +
// English), so this just shows it, and renders nothing on days outside the Omer.
//
// SefiraContentSchema / sefiraDefaultContent — the content shape.
// SefiraCounter — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const SefiraContentSchema = z.object({
  daysAhead: z.number().int().optional(),
  showEnglish: z.boolean().optional(),
  lineHeight: z.number().optional(),
});
type SefiraContent = z.infer<typeof SefiraContentSchema>;

export const sefiraDefaultContent = (): SefiraContent => ({ showEnglish: true });

export function SefiraCounter({ object, data }: WidgetRenderProps) {
  const content = object.content as SefiraContent;
  const bundle = data.calendarByOffset[String(content.daysAhead ?? 0)] ?? data.calendarByOffset["0"];
  const omer = bundle?.omer;
  if (!omer) return null;

  const isHebrew = object.language === "hebrew" || object.language === "both";
  const showEnglish = content.showEnglish ?? true;

  return (
    <div
      dir={isHebrew ? "rtl" : "ltr"}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        lineHeight: content.lineHeight ?? undefined,
        textAlign: "center",
      }}
    >
      <div>{omer.formattedHebrew}</div>
      {showEnglish ? <div style={{ opacity: 0.8 }}>{omer.formattedEnglish}</div> : null}
    </div>
  );
}
