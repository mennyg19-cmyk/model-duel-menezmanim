"use client";

import { PropertyPanel } from "../panels/PropertyPanel";
import { useUi } from "../state/StoreProvider";
import { panelCard, btn } from "../ui";

export function EditorRightPanel() {
  const open = useUi((s) => s.rightPanelOpen);
  const setOpen = useUi((s) => s.setRightPanelOpen);
  const selectedIds = useUi((s) => s.selectedIds);

  if (!open) {
    return (
      <button
        type="button"
        style={{
          ...btn,
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 20,
          writingMode: "vertical-rl",
          padding: "12px 8px",
          background: "#1e293b",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        }}
        onClick={() => setOpen(true)}
      >
        Properties
      </button>
    );
  }

  return (
    <div
      style={{
        ...panelCard,
        position: "absolute",
        right: 12,
        top: 12,
        bottom: 12,
        width: 320,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid #334155" }}>
        <strong style={{ fontSize: 13 }}>{selectedIds.length ? "Properties" : "Properties"}</strong>
        <button type="button" style={btn} onClick={() => setOpen(false)}>
          Collapse
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <PropertyPanel />
      </div>
    </div>
  );
}
