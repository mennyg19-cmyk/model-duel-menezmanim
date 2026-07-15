// === What's in this file ===
// Tests the pure canvas math: rect bounds/overlap, 8-way resize with a minimum
// size, smart-guide + grid snapping, alignment, and equal-gap distribution. These
// run with no DOM, so a break in the editor's geometry shows up here first.

import { describe, expect, it } from "vitest";
import { boundsOf, normalizeRect, rectsIntersect, rectEdges, type Rect } from "./rect";
import { resizeRect } from "./resize";
import { computeSnap, snapToGrid } from "./snap";
import { alignRects } from "./align";
import { distributeRects } from "./distribute";

describe("rect", () => {
  it("normalizes negative width/height to a top-left rect", () => {
    expect(normalizeRect({ x: 100, y: 100, width: -40, height: -20 })).toEqual({ x: 60, y: 80, width: 40, height: 20 });
  });

  it("computes the bounds of a group", () => {
    const rects: Rect[] = [
      { x: 10, y: 10, width: 20, height: 20 },
      { x: 50, y: 40, width: 30, height: 10 },
    ];
    expect(boundsOf(rects)).toEqual({ x: 10, y: 10, width: 70, height: 40 });
  });

  it("detects overlap for marquee hit-testing", () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    expect(rectsIntersect(a, { x: 50, y: 50, width: 100, height: 100 })).toBe(true);
    expect(rectsIntersect(a, { x: 200, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it("exposes the six snap edges", () => {
    expect(rectEdges({ x: 0, y: 0, width: 100, height: 40 })).toEqual({
      left: 0,
      centerX: 50,
      right: 100,
      top: 0,
      centerY: 20,
      bottom: 40,
    });
  });
});

describe("resizeRect", () => {
  const orig: Rect = { x: 100, y: 100, width: 200, height: 100 };

  it("grows from the south-east handle", () => {
    expect(resizeRect(orig, "se", 50, 30, 20)).toEqual({ x: 100, y: 100, width: 250, height: 130 });
  });

  it("moves the top-left corner from the north-west handle", () => {
    expect(resizeRect(orig, "nw", 20, 10, 20)).toEqual({ x: 120, y: 110, width: 180, height: 90 });
  });

  it("respects the minimum size instead of flipping inside-out", () => {
    const r = resizeRect(orig, "nw", 500, 500, 20);
    expect(r.width).toBe(20);
    expect(r.height).toBe(20);
    expect(r.x).toBe(280);
    expect(r.y).toBe(180);
  });

  it("only changes one axis for an edge handle", () => {
    expect(resizeRect(orig, "e", 40, 999, 20)).toEqual({ x: 100, y: 100, width: 240, height: 100 });
  });
});

describe("snap", () => {
  it("snaps to a 10px grid", () => {
    expect(snapToGrid(47, 10)).toBe(50);
    expect(snapToGrid(42, 10)).toBe(40);
  });

  it("snaps a moving box's left edge to another box's left edge", () => {
    const moving: Rect = { x: 104, y: 300, width: 50, height: 50 };
    const other: Rect = { x: 100, y: 0, width: 50, height: 50 };
    const result = computeSnap(moving, [other], { width: 1920, height: 1080 }, 6);
    expect(result.x).toBe(100);
    expect(result.guides).toContainEqual({ axis: "x", pos: 100 });
  });

  it("snaps a box's center to the canvas center", () => {
    const moving: Rect = { x: 913, y: 500, width: 100, height: 100 }; // center 963; edges 913/1013 are far from 960
    const result = computeSnap(moving, [], { width: 1920, height: 1080 }, 8);
    expect(result.x).toBe(910); // center pulled to 960 -> x = 960 - 50
    expect(result.guides).toContainEqual({ axis: "x", pos: 960 });
  });

  it("leaves a far box untouched", () => {
    const moving: Rect = { x: 500, y: 500, width: 50, height: 50 };
    const result = computeSnap(moving, [{ x: 0, y: 0, width: 10, height: 10 }], { width: 1920, height: 1080 }, 6);
    expect(result.x).toBe(500);
    expect(result.guides).toHaveLength(0);
  });
});

describe("alignRects", () => {
  const items = [
    { id: "a", rect: { x: 10, y: 10, width: 100, height: 40 } },
    { id: "b", rect: { x: 200, y: 200, width: 50, height: 80 } },
  ];

  it("aligns left edges to a reference", () => {
    const out = alignRects(items, "left", { x: 0, y: 0, width: 1920, height: 1080 });
    expect(out.get("a")!.x).toBe(0);
    expect(out.get("b")!.x).toBe(0);
  });

  it("centers horizontally in the canvas", () => {
    const out = alignRects([items[0]!], "centerX", { x: 0, y: 0, width: 1920, height: 1080 });
    expect(out.get("a")!.x).toBe(910); // (1920 - 100) / 2
  });

  it("aligns bottoms to a group bound", () => {
    const out = alignRects(items, "bottom", { x: 10, y: 10, width: 240, height: 270 });
    expect(out.get("a")!.y).toBe(240); // 10 + 270 - 40
    expect(out.get("b")!.y).toBe(200); // 10 + 270 - 80
  });
});

describe("distributeRects", () => {
  it("makes equal gaps between 3 boxes on the x axis", () => {
    const items = [
      { id: "a", rect: { x: 0, y: 0, width: 100, height: 10 } },
      { id: "b", rect: { x: 120, y: 0, width: 100, height: 10 } },
      { id: "c", rect: { x: 600, y: 0, width: 100, height: 10 } },
    ];
    const out = distributeRects(items, "x");
    // span = 700, total width = 300, gap = (700-300)/2 = 200. b sits at 0+100+200 = 300.
    expect(out.get("a")!.x).toBe(0);
    expect(out.get("b")!.x).toBe(300);
    expect(out.get("c")!.x).toBe(600);
  });

  it("does nothing with fewer than 3 boxes", () => {
    const out = distributeRects([{ id: "a", rect: { x: 0, y: 0, width: 10, height: 10 } }], "x");
    expect(out.size).toBe(0);
  });
});
