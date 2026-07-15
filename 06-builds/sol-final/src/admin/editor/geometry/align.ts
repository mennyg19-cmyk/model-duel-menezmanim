// === What's in this file ===
// Align a set of boxes to a reference rectangle. For a single selected box the
// reference is the canvas; for several it's their shared bounding box. Returns just
// the new top-left for each box (id -> {x, y}); callers apply it. Pure.
//
// AlignOp -- which edge/center to line up on.
// alignRects() -- compute the aligned positions.

import type { Rect } from "./rect";

export type AlignOp = "left" | "centerX" | "right" | "top" | "middleY" | "bottom";

export interface IdRect {
  id: string;
  rect: Rect;
}

export function alignRects(items: IdRect[], op: AlignOp, reference: Rect): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  for (const { id, rect } of items) {
    let { x, y } = rect;
    switch (op) {
      case "left":
        x = reference.x;
        break;
      case "centerX":
        x = reference.x + (reference.width - rect.width) / 2;
        break;
      case "right":
        x = reference.x + reference.width - rect.width;
        break;
      case "top":
        y = reference.y;
        break;
      case "middleY":
        y = reference.y + (reference.height - rect.height) / 2;
        break;
      case "bottom":
        y = reference.y + reference.height - rect.height;
        break;
    }
    out.set(id, { x: Math.round(x), y: Math.round(y) });
  }
  return out;
}
