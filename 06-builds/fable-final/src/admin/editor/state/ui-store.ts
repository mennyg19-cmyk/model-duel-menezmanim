// === What's in this file ===
// The editor's UI store: everything about what you're looking at, not what you're
// editing. Selection, zoom, snap/grid toggles, the preview switch, which left panel
// is open, the add-widget overlay, and the property panel's active tab + which
// collapsible sections are open. The tab and open-sections are remembered as you
// click between widgets (that "memory" the old editor had). Per-editor, like the
// document store.
//
// createEditorUiStore() -- builds the store with sensible defaults.

import { createStore } from "zustand/vanilla";
import type { SharedBoardData } from "@/core/board/types";

export type LeftPanel = "settings" | "objects" | "add" | "styles" | "preview" | null;
export type PropertyTab = "general" | "appearance" | "content";
export type ZoomMode = "fit" | "fill" | number;

export interface EditorUiState {
  selectedIds: string[];
  preview: boolean;
  snapEnabled: boolean;
  gridSize: number;
  zoomMode: ZoomMode;
  leftPanel: LeftPanel;
  /** Whether the floating Properties panel is open. Auto-opens when a widget is selected. */
  rightPanelOpen: boolean;
  addOverlayOpen: boolean;
  activeTab: PropertyTab;
  openSections: Record<string, boolean>;
  previewAtIso: string | null;
  /** Which screen's real data feeds the preview; the screen selector changes it. */
  previewScreenId: string | null;
  /** Live board data for the preview (zmanim/minyanim/groups/...); content editors read their option lists from it. */
  sharedData: SharedBoardData | null;

  setSelection: (ids: string[]) => void;
  toggleInSelection: (id: string) => void;
  clearSelection: () => void;
  setPreview: (on: boolean) => void;
  toggleSnap: () => void;
  toggleGrid: () => void;
  setZoom: (mode: ZoomMode) => void;
  zoomBy: (delta: number, fitPercent: number) => void;
  setLeftPanel: (panel: LeftPanel) => void;
  setRightPanelOpen: (open: boolean) => void;
  setAddOverlay: (open: boolean) => void;
  setActiveTab: (tab: PropertyTab) => void;
  toggleSection: (id: string, defaultOpen: boolean) => void;
  setPreviewAt: (iso: string | null) => void;
  setPreviewScreen: (id: string | null) => void;
  setSharedData: (data: SharedBoardData | null) => void;
}

export type EditorUiStore = ReturnType<typeof createEditorUiStore>;

export function createEditorUiStore(initialSelection: string[], initialPreviewScreenId: string | null) {
  return createStore<EditorUiState>((set) => ({
    selectedIds: initialSelection,
    preview: false,
    snapEnabled: true,
    gridSize: 0,
    zoomMode: "fit",
    leftPanel: "objects",
    rightPanelOpen: true,
    addOverlayOpen: false,
    activeTab: "general",
    openSections: {},
    previewAtIso: null,
    previewScreenId: initialPreviewScreenId,
    sharedData: null,

    setSelection: (ids) => set({ selectedIds: ids }),
    toggleInSelection: (id) =>
      set((s) => ({
        selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id],
      })),
    clearSelection: () => set({ selectedIds: [] }),
    setPreview: (on) => set({ preview: on }),
    toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
    toggleGrid: () => set((s) => ({ gridSize: s.gridSize > 0 ? 0 : 10 })),
    setZoom: (mode) => set({ zoomMode: mode }),
    zoomBy: (delta, fitPercent) =>
      set((s) => {
        const current = typeof s.zoomMode === "number" ? s.zoomMode : fitPercent;
        return { zoomMode: Math.min(400, Math.max(10, Math.round((current + delta) / 10) * 10)) };
      }),
    setLeftPanel: (panel) => set((s) => ({ leftPanel: s.leftPanel === panel ? null : panel })),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setAddOverlay: (open) => set({ addOverlayOpen: open }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    toggleSection: (id, defaultOpen) =>
      set((s) => ({ openSections: { ...s.openSections, [id]: !(s.openSections[id] ?? defaultOpen) } })),
    setPreviewAt: (iso) => set({ previewAtIso: iso }),
    setPreviewScreen: (id) => set({ previewScreenId: id }),
    setSharedData: (data) => set({ sharedData: data }),
  }));
}
