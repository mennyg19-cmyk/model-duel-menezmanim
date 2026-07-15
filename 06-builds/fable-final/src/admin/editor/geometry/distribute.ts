// === What's in this file ===
// Spread 3+ boxes out so the gaps between them are equal, along one axis. The first
// and last boxes stay put; the ones between are re-spaced. Returns id -> {x, y}.
// Needs at least 3 boxes (with 2 there's nothing to distribute). Pure.
//
// distributeRects() -- equal-gap distribution on the "x" or "y" axis.

import type { Rect } from "./rect";
import type { IdRect } from "./align";

export function distributeRects(items: IdRect[], axis: "x" | "y"): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  if (items.length < 3) return out;

  const size = (r: Rect) => (axis === "x" ? r.width : r.height);
  const start = (r: Rect) => (axis === "x" ? r.x : r.y);

  const sorted = [...items].sort((a, b) => start(a.rect) - start(b.rect));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  const span = start(last.rect) - start(first.rect) + size(last.rect);
  const totalSize = sorted.reduce((sum, it) => sum + size(it.rect), 0);
  const gap = (span - totalSize) / (sorted.length - 1);

  let cursor = start(first.rect);
  for (const it of sorted) {
    const pos = Math.round(cursor);
    out.set(it.id, axis === "x" ? { x: pos, y: it.rect.y } : { x: it.rect.x, y: pos });
    cursor += size(it.rect) + gap;
  }
  return out;
}
