// === What's in this file ===
// Plain rectangle math for the editor canvas. A Rect is board coordinates (the
// authored 1920x1080 space), never screen pixels -- the canvas converts pointer
// movement to board space before any of this runs. Pure functions, no React.
//
// Rect -- {x, y, width, height} in board coordinates.
// normalizeRect() -- flip a rect with negative width/height so it's top-left based
//   (used while dragging a selection box that can go up/left).
// boundsOf() -- the smallest rect covering a group of rects.
// rectsIntersect() -- do two rects overlap at all (marquee hit-testing).
// pointInRect() -- is a point inside a rect.
// rectEdges() -- the six snap lines of a rect: left/centerX/right, top/centerY/bottom.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function normalizeRect(r: Rect): Rect {
  return {
    x: r.width < 0 ? r.x + r.width : r.x,
    y: r.height < 0 ? r.y + r.height : r.y,
    width: Math.abs(r.width),
    height: Math.abs(r.height),
  };
}

export function boundsOf(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

export interface RectEdges {
  left: number;
  centerX: number;
  right: number;
  top: number;
  centerY: number;
  bottom: number;
}

export function rectEdges(r: Rect): RectEdges {
  return {
    left: r.x,
    centerX: r.x + r.width / 2,
    right: r.x + r.width,
    top: r.y,
    centerY: r.y + r.height / 2,
    bottom: r.y + r.height,
  };
}
