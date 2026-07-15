// === What's in this file ===
// Smart-guide snapping for dragging a box on the canvas. As a box moves, its
// left/center/right edges snap to other boxes' edges and to the canvas edges and
// center, within a small pull distance -- the same pink alignment guides Wix shows.
// Also plain grid snapping. All in board coordinates, pure.
//
// SnapGuide -- one alignment line to draw (vertical at an x, or horizontal at a y).
// snapToGrid() -- round a value to the nearest grid step.
// computeSnap() -- given a moving rect + the other rects + the canvas size, return
//   the nudged top-left position and the guide lines that matched.

import { rectEdges, type Rect } from "./rect";

export interface SnapGuide {
  axis: "x" | "y";
  pos: number;
}

export function snapToGrid(value: number, grid: number): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

function bestDelta(movingLines: number[], targetLines: number[], threshold: number): { delta: number; line: number } | null {
  let best: { delta: number; line: number } | null = null;
  for (const m of movingLines) {
    for (const t of targetLines) {
      const delta = t - m;
      if (Math.abs(delta) <= threshold && (best === null || Math.abs(delta) < Math.abs(best.delta))) {
        best = { delta, line: t };
      }
    }
  }
  return best;
}

export function computeSnap(
  moving: Rect,
  others: Rect[],
  canvas: { width: number; height: number },
  threshold: number,
): { x: number; y: number; guides: SnapGuide[] } {
  const me = rectEdges(moving);

  const targetX: number[] = [0, canvas.width / 2, canvas.width];
  const targetY: number[] = [0, canvas.height / 2, canvas.height];
  for (const o of others) {
    const e = rectEdges(o);
    targetX.push(e.left, e.centerX, e.right);
    targetY.push(e.top, e.centerY, e.bottom);
  }

  const guides: SnapGuide[] = [];
  let x = moving.x;
  let y = moving.y;

  const sx = bestDelta([me.left, me.centerX, me.right], targetX, threshold);
  if (sx) {
    x = moving.x + sx.delta;
    guides.push({ axis: "x", pos: sx.line });
  }
  const sy = bestDelta([me.top, me.centerY, me.bottom], targetY, threshold);
  if (sy) {
    y = moving.y + sy.delta;
    guides.push({ axis: "y", pos: sy.line });
  }

  return { x: Math.round(x), y: Math.round(y), guides };
}
