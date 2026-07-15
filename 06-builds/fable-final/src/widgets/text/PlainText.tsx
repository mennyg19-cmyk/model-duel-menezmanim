// === What's in this file ===
// W1 (plain) — a static text box. Shows content.text (or content.textHebrew in a
// Hebrew board), with vertical alignment and line height the user controls. Font,
// color and background come from the object wrapper the Board paints, so this only
// lays out the text itself.
//
// PlainTextContentSchema / plainTextDefaultContent — the widget's content shape.
// PlainText — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const PlainTextContentSchema = z.object({
  text: z.string().optional(),
  textHebrew: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  lineHeight: z.number().optional(),
});
type PlainTextContent = z.infer<typeof PlainTextContentSchema>;

export const plainTextDefaultContent = (): PlainTextContent => ({
  text: "Text",
  textAlign: "center",
  verticalAlign: "middle",
});

const VERTICAL: Record<string, string> = { top: "flex-start", middle: "center", bottom: "flex-end" };

export function PlainText({ object }: WidgetRenderProps) {
  const content = object.content as PlainTextContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const text = isHebrew ? content.textHebrew ?? content.text : content.text ?? content.textHebrew;

  return (
    <div
      dir={isHebrew ? "rtl" : "ltr"}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: VERTICAL[content.verticalAlign ?? "middle"],
        textAlign: content.textAlign ?? "center",
        lineHeight: content.lineHeight ?? undefined,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {text}
    </div>
  );
}
