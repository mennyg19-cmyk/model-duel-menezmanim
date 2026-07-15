// === What's in this file ===
// Turns a drag on one of the 8 resize handles into a new rectangle. The handle
// names are compass points: nw n ne / w e / sw s se. dx/dy are the pointer's
// movement in board coordinates. A minimum size keeps a box from collapsing or
// flipping inside-out.
//
// ResizeHandle -- the 8 handle positions.
// HANDLES -- the list, for rendering them.
// resizeRect() -- apply a handle drag to a rect, clamped to a minimum size.

import type { Rect } from "./rect";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const HANDLES: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const MOVES_LEFT = new Set<ResizeHandle>(["nw", "w", "sw"]);
const MOVES_RIGHT = new Set<ResizeHandle>(["ne", "e", "se"]);
const MOVES_TOP = new Set<ResizeHandle>(["nw", "n", "ne"]);
const MOVES_BOTTOM = new Set<ResizeHandle>(["sw", "s", "se"]);

export function resizeRect(orig: Rect, handle: ResizeHandle, dx: number, dy: number, minSize: number): Rect {
  let { x, y, width, height } = orig;
  const right = x + width;
  const bottom = y + height;

  if (MOVES_LEFT.has(handle)) {
    x = Math.min(orig.x + dx, right - minSize);
    width = right - x;
  } else if (MOVES_RIGHT.has(handle)) {
    width = Math.max(minSize, orig.width + dx);
  }

  if (MOVES_TOP.has(handle)) {
    y = Math.min(orig.y + dy, bottom - minSize);
    height = bottom - y;
  } else if (MOVES_BOTTOM.has(handle)) {
    height = Math.max(minSize, orig.height + dy);
  }

  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

const CURSORS: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

export function handleCursor(handle: ResizeHandle): string {
  return CURSORS[handle];
}

/** The handle's anchor position inside a unit box, as fractions (0,0)=top-left … (1,1)=bottom-right. */
export function handleAnchor(handle: ResizeHandle): { fx: number; fy: number } {
  const fx = MOVES_LEFT.has(handle) ? 0 : MOVES_RIGHT.has(handle) ? 1 : 0.5;
  const fy = MOVES_TOP.has(handle) ? 0 : MOVES_BOTTOM.has(handle) ? 1 : 0.5;
  return { fx, fy };
}
