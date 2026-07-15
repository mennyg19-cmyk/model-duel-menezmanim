// === What's in this file ===
// W13 — a plain visual shape: a filled rectangle, or a divider line (horizontal
// or vertical). Used to box, separate or underline other widgets. Pure: no data.
//
// ShapeDividerContentSchema / shapeDividerDefaultContent — the content shape.
// ShapeDivider — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";

export const ShapeDividerContentSchema = z.object({
  shape: z.enum(["rectangle", "line"]).optional(),
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  color: z.string().optional(),
  thickness: z.number().optional(),
  cornerRadius: z.number().optional(),
});
type ShapeDividerContent = z.infer<typeof ShapeDividerContentSchema>;

export const shapeDividerDefaultContent = (): ShapeDividerContent => ({
  shape: "line",
  orientation: "horizontal",
  color: "#888888",
  thickness: 2,
});

export function ShapeDivider({ object }: WidgetRenderProps) {
  const content = object.content as ShapeDividerContent;
  const color = content.color ?? "#888888";

  if ((content.shape ?? "line") === "rectangle") {
    return (
      <div style={{ width: "100%", height: "100%", background: color, borderRadius: content.cornerRadius ?? 0 }} />
    );
  }

  const thickness = content.thickness ?? 2;
  const vertical = content.orientation === "vertical";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          background: color,
          width: vertical ? thickness : "100%",
          height: vertical ? "100%" : thickness,
          borderRadius: thickness,
        }}
      />
    </div>
  );
}
