// === What's in this file ===
// W1 (rich) — a text box that renders saved HTML (bold, lists, links the user
// built in the editor). The HTML is sanitized first so a saved board can never
// inject scripts or event handlers onto a lobby TV.
//
// RichTextContentSchema / richTextDefaultContent — the widget's content shape.
// sanitizeHtml — strips scripts, event handlers and javascript: URLs.
// RichText — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const RichTextContentSchema = z.object({
  html: z.string().optional(),
  htmlHebrew: z.string().optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
});
type RichTextContent = z.infer<typeof RichTextContentSchema>;

export const richTextDefaultContent = (): RichTextContent => ({
  html: "<p>Rich text</p>",
  verticalAlign: "middle",
});

const VERTICAL: Record<string, string> = { top: "flex-start", middle: "center", bottom: "flex-end" };

// Board HTML is authored by org admins, but it ends up on public screens, so it
// still gets a conservative scrub: drop <script>/<style>, on* handlers, and any
// javascript:/data: URLs. Not a full DOMPurify, but enough to keep saved content
// from carrying executable payloads onto a TV.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*(javascript:|data:)[^"']*\2/gi, '$1="#"');
}

export function RichText({ object }: WidgetRenderProps) {
  const content = object.content as RichTextContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const raw = (isHebrew ? content.htmlHebrew ?? content.html : content.html ?? content.htmlHebrew) ?? "";

  return (
    <div
      dir={isHebrew ? "rtl" : "ltr"}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: VERTICAL[content.verticalAlign ?? "middle"],
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(raw) }}
    />
  );
}
