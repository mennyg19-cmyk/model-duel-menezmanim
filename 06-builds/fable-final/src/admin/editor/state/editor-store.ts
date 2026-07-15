// === What's in this file ===
// The editor's DOCUMENT store: the thing being edited (widgets + board style) plus
// undo/redo and the dirty flag. It's a per-editor Zustand store (made by a factory,
// not a global) so two editors never share state. Undo history lives in a closure
// here, not in the reactive state, so pushing a snapshot doesn't itself re-render.
//
// createEditorDocStore() -- builds a store seeded from the loaded objects + style.
// Actions mirror the old EditorClient: commit (history + dirty), beginGesture +
// applyLive (drag with no per-frame history), add/delete/duplicate/paste widgets,
// change layer order, align + distribute, update style, undo/redo, markSaved.

import { createStore } from "zustand/vanilla";
import { getWidget } from "@/widgets/registry";
import { defaultAppearance } from "@/core/board/appearance";
import { alignRects, type AlignOp, type IdRect } from "../geometry/align";
import { distributeRects } from "../geometry/distribute";
import { boundsOf, type Rect } from "../geometry/rect";
import type { EditorObject, EditorStyle } from "../types";

const HISTORY_LIMIT = 100;

function newId(): string {
  return crypto.randomUUID();
}

function maxLayer(objects: EditorObject[]): number {
  return objects.reduce((m, o) => Math.max(m, o.layer), -1);
}

export interface BoxPatch {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorDocState {
  objects: EditorObject[];
  style: EditorStyle;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;

  beginGesture: () => void;
  applyLive: (patches: BoxPatch[]) => void;
  updateObject: (id: string, patch: Partial<EditorObject>) => void;
  updateStyle: (patch: Partial<EditorStyle>) => void;
  addWidget: (type: string) => string | null;
  deleteObjects: (ids: string[]) => void;
  duplicateObjects: (ids: string[]) => string[];
  pasteObjects: (detached: EditorObject[]) => string[];
  changeLayer: (id: string, direction: 1 | -1) => void;
  reorderLayers: (orderedTopFirst: string[]) => void;
  nudge: (ids: string[], dx: number, dy: number) => void;
  alignObjects: (ids: string[], op: AlignOp) => void;
  distributeObjects: (ids: string[], axis: "x" | "y") => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

export type EditorDocStore = ReturnType<typeof createEditorDocStore>;

export function createEditorDocStore(initial: { objects: EditorObject[]; style: EditorStyle }) {
  const past: { objects: EditorObject[]; style: EditorStyle }[] = [];
  const future: { objects: EditorObject[]; style: EditorStyle }[] = [];

  return createStore<EditorDocState>((set, get) => {
    const snapshot = () => ({ objects: get().objects, style: get().style });
    const pushHistory = () => {
      past.push(snapshot());
      if (past.length > HISTORY_LIMIT) past.shift();
      future.length = 0;
    };
    const flags = () => ({ canUndo: past.length > 0, canRedo: future.length > 0 });

    const commit = (next: Partial<Pick<EditorDocState, "objects" | "style">>) => {
      pushHistory();
      set({ ...next, dirty: true, ...flags() });
    };

    const rectsFor = (ids: string[]): IdRect[] => {
      const sel = new Set(ids);
      return get()
        .objects.filter((o) => sel.has(o.id))
        .map((o) => ({ id: o.id, rect: { x: o.posX, y: o.posY, width: o.width, height: o.height } }));
    };

    const applyMoves = (moves: Map<string, { x: number; y: number }>) => {
      if (moves.size === 0) return;
      commit({
        objects: get().objects.map((o) => {
          const m = moves.get(o.id);
          return m ? { ...o, posX: m.x, posY: m.y } : o;
        }),
      });
    };

    return {
      objects: initial.objects,
      style: initial.style,
      dirty: false,
      canUndo: false,
      canRedo: false,

      beginGesture: () => {
        pushHistory();
        set(flags());
      },

      applyLive: (patches) => {
        const byId = new Map(patches.map((p) => [p.id, p]));
        set({
          dirty: true,
          objects: get().objects.map((o) => {
            const p = byId.get(o.id);
            return p ? { ...o, posX: p.x, posY: p.y, width: p.width, height: p.height } : o;
          }),
        });
      },

      updateObject: (id, patch) =>
        commit({ objects: get().objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) }),

      updateStyle: (patch) => commit({ style: { ...get().style, ...patch } }),

      addWidget: (type) => {
        const widget = getWidget(type);
        if (!widget) return null;
        const obj: EditorObject = {
          id: newId(),
          type,
          name: widget.label,
          posX: 60,
          posY: 60,
          width: 360,
          height: 220,
          layer: maxLayer(get().objects) + 1,
          fontFamily: "David Libre",
          fontSize: 28,
          fontBold: false,
          fontItalic: false,
          foreColor: "#ffffff",
          backColor: "transparent",
          language: "hebrew",
          appearance: defaultAppearance("transparent"),
          content: (widget.defaultContent?.() ?? {}) as Record<string, unknown>,
          visible: true,
          scheduleRules: null,
          scheduleGroupVisibility: null,
        };
        commit({ objects: [...get().objects, obj] });
        return obj.id;
      },

      deleteObjects: (ids) => {
        if (ids.length === 0) return;
        const kill = new Set(ids);
        commit({ objects: get().objects.filter((o) => !kill.has(o.id)) });
      },

      duplicateObjects: (ids) => {
        const sel = new Set(ids);
        const sources = get().objects.filter((o) => sel.has(o.id));
        if (sources.length === 0) return [];
        let layer = maxLayer(get().objects);
        const copies = sources.map((src) => ({
          ...src,
          id: newId(),
          name: `${src.name} (copy)`,
          posX: src.posX + 24,
          posY: src.posY + 24,
          layer: ++layer,
          content: { ...src.content },
        }));
        commit({ objects: [...get().objects, ...copies] });
        return copies.map((c) => c.id);
      },

      pasteObjects: (detached) => {
        if (detached.length === 0) return [];
        let layer = maxLayer(get().objects);
        const placed = detached.map((o) => ({
          ...o,
          id: newId(),
          posX: o.posX + 24,
          posY: o.posY + 24,
          layer: ++layer,
          content: { ...o.content },
        }));
        commit({ objects: [...get().objects, ...placed] });
        return placed.map((c) => c.id);
      },

      changeLayer: (id, direction) => {
        const sorted = [...get().objects].sort((a, b) => a.layer - b.layer);
        const idx = sorted.findIndex((o) => o.id === id);
        const swapIdx = idx + direction;
        if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
        const a = sorted[idx]!;
        const b = sorted[swapIdx]!;
        commit({
          objects: get().objects.map((o) =>
            o.id === a.id ? { ...o, layer: b.layer } : o.id === b.id ? { ...o, layer: a.layer } : o,
          ),
        });
      },

      reorderLayers: (orderedTopFirst) => {
        // The list shows top layer first, so the first id gets the highest layer.
        const n = orderedTopFirst.length;
        const layerById = new Map(orderedTopFirst.map((id, i) => [id, n - 1 - i]));
        commit({
          objects: get().objects.map((o) => {
            const layer = layerById.get(o.id);
            return layer === undefined ? o : { ...o, layer };
          }),
        });
      },

      nudge: (ids, dx, dy) => {
        const sel = new Set(ids);
        commit({ objects: get().objects.map((o) => (sel.has(o.id) ? { ...o, posX: o.posX + dx, posY: o.posY + dy } : o)) });
      },

      alignObjects: (ids, op) => {
        const items = rectsFor(ids);
        if (items.length === 0) return;
        const style = get().style;
        const reference: Rect =
          items.length === 1
            ? { x: 0, y: 0, width: style.canvasWidth, height: style.canvasHeight }
            : boundsOf(items.map((i) => i.rect))!;
        applyMoves(alignRects(items, op, reference));
      },

      distributeObjects: (ids, axis) => applyMoves(distributeRects(rectsFor(ids), axis)),

      undo: () => {
        const prev = past.pop();
        if (!prev) return;
        future.push(snapshot());
        set({ ...prev, dirty: true, ...flags() });
      },

      redo: () => {
        const next = future.pop();
        if (!next) return;
        past.push(snapshot());
        set({ ...next, dirty: true, ...flags() });
      },

      markSaved: () => set({ dirty: false }),
    };
  });
}
