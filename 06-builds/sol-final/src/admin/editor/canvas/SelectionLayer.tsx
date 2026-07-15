"use client";

// === What's in this file ===
// The transparent overlay that sits on top of the live board in edit mode and owns
// every pointer gesture: click-to-select, shift-to-add, marquee box-select,
// drag-to-move (with pink smart guides + optional grid), and 8-handle resize on a
// single selection. It draws nothing of the board itself -- it only paints the
// selection outlines, handles, guides, grid, and the marquee. All math is in board
// coordinates via the geometry/ helpers; the parent scales this layer.
//
// ObjectBox / BoxPatch -- the small shapes the parent passes in / gets back, so this
//   layer never needs to know about EditorObject.
// SelectionLayer -- the overlay component.

import { useCallback, useEffect, useRef, useState } from "react";
import { boundsOf, normalizeRect, pointInRect, rectsIntersect, type Rect } from "../geometry/rect";
import { HANDLES, handleAnchor, handleCursor, resizeRect, type ResizeHandle } from "../geometry/resize";
import { computeSnap, snapToGrid, type SnapGuide } from "../geometry/snap";

const MIN_SIZE = 20;
const SNAP_THRESHOLD = 6;

export interface ObjectBox {
  id: string;
  rect: Rect;
  layer: number;
  visible: boolean;
}

export interface BoxPatch {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Gesture =
  | { kind: "move"; startClientX: number; startClientY: number; origins: Map<string, Rect> }
  | { kind: "resize"; id: string; handle: ResizeHandle; orig: Rect; startClientX: number; startClientY: number }
  | { kind: "marquee"; startBoardX: number; startBoardY: number; additive: boolean }
  | null;

export function SelectionLayer({
  objects,
  canvas,
  scale,
  selectedIds,
  snapEnabled,
  gridSize,
  onSelect,
  onBeginGesture,
  onLiveChange,
}: {
  objects: ObjectBox[];
  canvas: { width: number; height: number };
  scale: number;
  selectedIds: string[];
  snapEnabled: boolean;
  gridSize: number;
  onSelect: (ids: string[]) => void;
  onBeginGesture: () => void;
  onLiveChange: (patches: BoxPatch[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture>(null);
  const marqueeRef = useRef<Rect | null>(null);
  const [active, setActive] = useState(false);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [guides, setGuides] = useState<SnapGuide[]>([]);

  const selectedSet = new Set(selectedIds);
  const primary = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) ?? null : null;

  const clientToBoard = useCallback(
    (clientX: number, clientY: number) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return { x: 0, y: 0 };
      return { x: (clientX - box.left) / scale, y: (clientY - box.top) / scale };
    },
    [scale],
  );

  const startMove = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    // Right-click: just make sure this object is selected so the context menu acts
    // on it, then let the native event bubble to the Radix context-menu trigger.
    if (e.button !== 0) {
      if (!selectedSet.has(id)) onSelect([id]);
      return;
    }
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    let ids = selectedIds;
    if (additive) {
      ids = selectedSet.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
      onSelect(ids);
    } else if (!selectedSet.has(id)) {
      ids = [id];
      onSelect(ids);
    }
    onBeginGesture();
    const origins = new Map<string, Rect>();
    for (const o of objects) if (ids.includes(o.id)) origins.set(o.id, o.rect);
    gestureRef.current = { kind: "move", startClientX: e.clientX, startClientY: e.clientY, origins };
    setActive(true);
  };

  const startResize = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (!primary) return;
    onBeginGesture();
    gestureRef.current = { kind: "resize", id: primary.id, handle, orig: primary.rect, startClientX: e.clientX, startClientY: e.clientY };
    setActive(true);
  };

  const startMarquee = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    if (!additive) onSelect([]);
    const start = clientToBoard(e.clientX, e.clientY);
    gestureRef.current = { kind: "marquee", startBoardX: start.x, startBoardY: start.y, additive };
    const box = { x: start.x, y: start.y, width: 0, height: 0 };
    marqueeRef.current = box;
    setMarquee(box);
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;

    const onMove = (e: PointerEvent) => {
      const g = gestureRef.current;
      if (!g) return;

      if (g.kind === "move") {
        let dx = (e.clientX - g.startClientX) / scale;
        let dy = (e.clientY - g.startClientY) / scale;
        let movingRects = [...g.origins.values()].map((r) => ({ ...r, x: r.x + dx, y: r.y + dy }));
        let groupBounds = boundsOf(movingRects)!;

        if (gridSize > 0) {
          dx += snapToGrid(groupBounds.x, gridSize) - groupBounds.x;
          dy += snapToGrid(groupBounds.y, gridSize) - groupBounds.y;
          movingRects = [...g.origins.values()].map((r) => ({ ...r, x: r.x + dx, y: r.y + dy }));
          groupBounds = boundsOf(movingRects)!;
        }

        let nextGuides: SnapGuide[] = [];
        if (snapEnabled) {
          const others = objects.filter((o) => !g.origins.has(o.id)).map((o) => o.rect);
          const snapped = computeSnap(groupBounds, others, canvas, SNAP_THRESHOLD);
          dx += snapped.x - groupBounds.x;
          dy += snapped.y - groupBounds.y;
          nextGuides = snapped.guides;
        }
        setGuides(nextGuides);

        const patches: BoxPatch[] = [];
        for (const [id, r] of g.origins) {
          patches.push({ id, x: Math.round(r.x + dx), y: Math.round(r.y + dy), width: r.width, height: r.height });
        }
        onLiveChange(patches);
        return;
      }

      if (g.kind === "resize") {
        const dx = (e.clientX - g.startClientX) / scale;
        const dy = (e.clientY - g.startClientY) / scale;
        let r = resizeRect(g.orig, g.handle, dx, dy, MIN_SIZE);
        if (gridSize > 0) {
          r = { x: snapToGrid(r.x, gridSize), y: snapToGrid(r.y, gridSize), width: snapToGrid(r.width, gridSize), height: snapToGrid(r.height, gridSize) };
        }
        onLiveChange([{ id: g.id, ...r }]);
        return;
      }

      if (g.kind === "marquee") {
        const cur = clientToBoard(e.clientX, e.clientY);
        const box = normalizeRect({ x: g.startBoardX, y: g.startBoardY, width: cur.x - g.startBoardX, height: cur.y - g.startBoardY });
        marqueeRef.current = box;
        setMarquee(box);
      }
    };

    const onUp = () => {
      const g = gestureRef.current;
      if (g?.kind === "marquee") {
        const box = marqueeRef.current;
        if (box && (box.width > 2 || box.height > 2)) {
          const hits = objects.filter((o) => rectsIntersect(o.rect, box)).map((o) => o.id);
          onSelect(g.additive ? [...new Set([...selectedIds, ...hits])] : hits);
        }
      }
      gestureRef.current = null;
      marqueeRef.current = null;
      setMarquee(null);
      setGuides([]);
      setActive(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [active, scale, snapEnabled, gridSize, objects, canvas, onLiveChange, onSelect, selectedIds, clientToBoard]);

  const handlePx = 10 / scale;
  const groupBounds = selectedIds.length > 1 ? boundsOf(objects.filter((o) => selectedSet.has(o.id)).map((o) => o.rect)) : null;

  return (
    <div
      ref={rootRef}
      style={{ position: "absolute", inset: 0, width: canvas.width, height: canvas.height }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) startMarquee(e);
      }}
    >
      {gridSize > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {[...objects]
        .sort((a, b) => a.layer - b.layer)
        .map((o) => {
          const isSelected = selectedSet.has(o.id);
          return (
            <div
              key={o.id}
              onPointerDown={(e) => startMove(e, o.id)}
              style={{
                position: "absolute",
                left: o.rect.x,
                top: o.rect.y,
                width: o.rect.width,
                height: o.rect.height,
                cursor: "move",
                boxSizing: "border-box",
                outline: isSelected ? `${2 / scale}px solid #3b82f6` : `${1 / scale}px dashed rgba(255,255,255,0.35)`,
                background: o.visible ? "transparent" : "rgba(0,0,0,0.35)",
              }}
            />
          );
        })}

      {groupBounds && (
        <div
          style={{
            position: "absolute",
            left: groupBounds.x,
            top: groupBounds.y,
            width: groupBounds.width,
            height: groupBounds.height,
            pointerEvents: "none",
            outline: `${1 / scale}px solid rgba(59,130,246,0.6)`,
          }}
        />
      )}

      {primary &&
        HANDLES.map((h) => {
          const { fx, fy } = handleAnchor(h);
          return (
            <div
              key={h}
              onPointerDown={(e) => startResize(e, h)}
              style={{
                position: "absolute",
                left: primary.rect.x + primary.rect.width * fx,
                top: primary.rect.y + primary.rect.height * fy,
                width: handlePx,
                height: handlePx,
                transform: "translate(-50%, -50%)",
                background: "#fff",
                border: `${1 / scale}px solid #3b82f6`,
                borderRadius: 2 / scale,
                cursor: handleCursor(h),
              }}
            />
          );
        })}

      {guides.map((g, i) =>
        g.axis === "x" ? (
          <div key={`gx${i}`} style={{ position: "absolute", left: g.pos, top: 0, width: 1 / scale, height: canvas.height, background: "#ec4899", pointerEvents: "none" }} />
        ) : (
          <div key={`gy${i}`} style={{ position: "absolute", left: 0, top: g.pos, width: canvas.width, height: 1 / scale, background: "#ec4899", pointerEvents: "none" }} />
        ),
      )}

      {marquee && (
        <div
          style={{
            position: "absolute",
            left: marquee.x,
            top: marquee.y,
            width: marquee.width,
            height: marquee.height,
            background: "rgba(59,130,246,0.12)",
            border: `${1 / scale}px solid #3b82f6`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
