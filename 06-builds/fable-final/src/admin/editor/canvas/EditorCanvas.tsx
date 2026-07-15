"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BoardSurface } from "@/board/Board";
import { buildEditorSnapshot, emptySharedData, requestedOffsetsFor } from "../editor-snapshot";
import { EditorErrorBoundary } from "../EditorErrorBoundary";
import { copyObjects, hasClipboard, pasteObjects } from "../interaction/clipboard";
import { useDoc, useDocApi, useEditorConfig, useUi, useUiApi } from "../state/StoreProvider";
import { SelectionLayer } from "./SelectionLayer";
import { btn, panelCard } from "../ui";

export function EditorCanvas() {
  const { orgId } = useEditorConfig();
  const docApi = useDocApi();
  const uiApi = useUiApi();

  const objects = useDoc((s) => s.objects);
  const style = useDoc((s) => s.style);
  const beginGesture = useDoc((s) => s.beginGesture);
  const applyLive = useDoc((s) => s.applyLive);
  const duplicateObjects = useDoc((s) => s.duplicateObjects);
  const deleteObjects = useDoc((s) => s.deleteObjects);
  const changeLayer = useDoc((s) => s.changeLayer);
  const pasteIntoDoc = useDoc((s) => s.pasteObjects);

  const selectedIds = useUi((s) => s.selectedIds);
  const setSelection = useUi((s) => s.setSelection);
  const preview = useUi((s) => s.preview);
  const snapEnabled = useUi((s) => s.snapEnabled);
  const gridSize = useUi((s) => s.gridSize);
  const zoomMode = useUi((s) => s.zoomMode);
  const previewAtIso = useUi((s) => s.previewAtIso);
  const previewScreenId = useUi((s) => s.previewScreenId);
  const sharedData = useUi((s) => s.sharedData);
  const setSharedData = useUi((s) => s.setSharedData);
  const setRightPanelOpen = useUi((s) => s.setRightPanelOpen);

  const [menu, setMenu] = useState<{ x: number; y: number; boardX: number; boardY: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.4);

  useEffect(() => {
    if (!previewScreenId) {
      setSharedData(emptySharedData());
      return;
    }
    let alive = true;
    const offsets = requestedOffsetsFor(objects).join(",");
    const date = previewAtIso ? previewAtIso.slice(0, 10) : "";
    const q = new URLSearchParams({ screenId: previewScreenId, offsets });
    if (date) q.set("date", date);
    void fetch(`/api/org/${orgId}/editor/shared-data?${q}`)
      .then((r) => r.json())
      .then((json: { data?: typeof sharedData; error?: string }) => {
        if (!alive) return;
        if (json.data) setSharedData(json.data);
        else setSharedData(emptySharedData());
      })
      .catch(() => {
        if (alive) setSharedData(emptySharedData());
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on date/screen, not every object edit
  }, [orgId, previewScreenId, previewAtIso, setSharedData]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const recompute = () => {
      const pad = 48;
      const w = Math.max(100, el.clientWidth - pad);
      const h = Math.max(100, el.clientHeight - pad);
      const sx = w / style.canvasWidth;
      const sy = h / style.canvasHeight;
      setFitScale(Math.min(sx, sy));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [style.canvasWidth, style.canvasHeight]);

  const scale =
    zoomMode === "fit"
      ? fitScale
      : zoomMode === "fill"
        ? Math.max(
            (wrapRef.current?.clientWidth ?? style.canvasWidth) / style.canvasWidth,
            (wrapRef.current?.clientHeight ?? style.canvasHeight) / style.canvasHeight,
          )
        : zoomMode / 100;

  const data = sharedData ?? emptySharedData();
  const snapshot = useMemo(
    () => buildEditorSnapshot(style, objects.filter((o) => o.visible || !preview), data, "preview"),
    [style, objects, data, preview],
  );

  // Show all objects while editing (including currently-hidden) so they stay selectable.
  const editSnapshot = useMemo(
    () => buildEditorSnapshot(style, objects, data, "preview"),
    [style, objects, data],
  );
  const liveSnapshot = preview ? snapshot : editSnapshot;

  const boxes = objects.map((o) => ({
    id: o.id,
    rect: { x: o.posX, y: o.posY, width: o.width, height: o.height },
    layer: o.layer,
    visible: o.visible,
  }));

  return (
    <div
      ref={wrapRef}
      style={{ position: "absolute", inset: 0, background: "#020617", overflow: "hidden" }}
      onClick={() => setMenu(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        const box = wrapRef.current?.getBoundingClientRect();
        if (!box) return;
        // Approximate board coords from center-scaled canvas — refined below via overlay
        setMenu({ x: e.clientX, y: e.clientY, boardX: 0, boardY: 0 });
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: style.canvasWidth * scale,
          height: style.canvasHeight * scale,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div style={{ width: style.canvasWidth, height: style.canvasHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <EditorErrorBoundary>
            <BoardSurface snapshot={liveSnapshot} objectPointerEvents="none" />
          </EditorErrorBoundary>
          {!preview && (
            <SelectionLayer
              objects={boxes}
              canvas={{ width: style.canvasWidth, height: style.canvasHeight }}
              scale={1}
              selectedIds={selectedIds}
              snapEnabled={snapEnabled}
              gridSize={gridSize}
              onSelect={(ids) => {
                setSelection(ids);
                if (ids.length) setRightPanelOpen(true);
              }}
              onBeginGesture={beginGesture}
              onLiveChange={applyLive}
            />
          )}
        </div>
      </div>

      {menu && (
        <div
          style={{
            ...panelCard,
            position: "fixed",
            left: menu.x,
            top: menu.y,
            zIndex: 60,
            padding: 6,
            display: "grid",
            gap: 2,
            minWidth: 140,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            style={btn}
            onClick={() => {
              if (selectedIds[0]) setRightPanelOpen(true);
              setMenu(null);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => {
              const sel = new Set(selectedIds);
              copyObjects(docApi.getState().objects.filter((o) => sel.has(o.id)));
              setMenu(null);
            }}
          >
            Copy
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => {
              setSelection(duplicateObjects(selectedIds));
              setMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            style={btn}
            disabled={!hasClipboard()}
            onClick={() => {
              const ids = pasteIntoDoc(pasteObjects() ?? []);
              if (ids.length) setSelection(ids);
              setMenu(null);
            }}
          >
            Paste
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => {
              if (selectedIds[0]) changeLayer(selectedIds[0], 1);
              setMenu(null);
            }}
          >
            Bring forward
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => {
              if (selectedIds[0]) changeLayer(selectedIds[0], -1);
              setMenu(null);
            }}
          >
            Send back
          </button>
          <button
            type="button"
            style={{ ...btn, color: "#fca5a5" }}
            onClick={() => {
              deleteObjects(selectedIds);
              setSelection([]);
              setMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
