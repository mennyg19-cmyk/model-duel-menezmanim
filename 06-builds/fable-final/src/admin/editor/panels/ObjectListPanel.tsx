"use client";

import { useDoc, useUi } from "../state/StoreProvider";
import { btn, inputStyle } from "../ui";

export function ObjectListPanel() {
  const objects = useDoc((s) => s.objects);
  const updateObject = useDoc((s) => s.updateObject);
  const deleteObjects = useDoc((s) => s.deleteObjects);
  const duplicateObjects = useDoc((s) => s.duplicateObjects);
  const reorderLayers = useDoc((s) => s.reorderLayers);
  const selectedIds = useUi((s) => s.selectedIds);
  const setSelection = useUi((s) => s.setSelection);
  const setRightPanelOpen = useUi((s) => s.setRightPanelOpen);

  const sorted = [...objects].sort((a, b) => b.layer - a.layer);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8 }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Layers (top first)</div>
      {sorted.map((o, idx) => {
        const sel = selectedIds.includes(o.id);
        return (
          <div
            key={o.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 4,
              padding: 6,
              borderRadius: 6,
              background: sel ? "#334155" : "#0f172a",
              border: "1px solid #334155",
              fontSize: 12,
            }}
          >
            <button
              type="button"
              style={{ background: "none", border: "none", color: "#e2e8f0", textAlign: "left", cursor: "pointer", padding: 0 }}
              onClick={() => {
                setSelection([o.id]);
                setRightPanelOpen(true);
              }}
            >
              {o.name}
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{o.type}</div>
            </button>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button type="button" style={btn} title="Edit" onClick={() => { setSelection([o.id]); setRightPanelOpen(true); }}>
                ✎
              </button>
              <button
                type="button"
                style={btn}
                title="Visibility"
                onClick={() => updateObject(o.id, { visible: !o.visible })}
              >
                {o.visible ? "👁" : "🚫"}
              </button>
              <button type="button" style={btn} title="Duplicate" onClick={() => setSelection(duplicateObjects([o.id]))}>
                ⎘
              </button>
              <button type="button" style={btn} title="Delete" onClick={() => { deleteObjects([o.id]); setSelection([]); }}>
                ⌫
              </button>
              <button
                type="button"
                style={btn}
                title="Move up"
                disabled={idx === 0}
                onClick={() => {
                  const ids = sorted.map((x) => x.id);
                  if (idx === 0) return;
                  [ids[idx - 1], ids[idx]] = [ids[idx]!, ids[idx - 1]!];
                  reorderLayers(ids);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                style={btn}
                title="Move down"
                disabled={idx === sorted.length - 1}
                onClick={() => {
                  const ids = sorted.map((x) => x.id);
                  if (idx >= ids.length - 1) return;
                  [ids[idx + 1], ids[idx]] = [ids[idx]!, ids[idx + 1]!];
                  reorderLayers(ids);
                }}
              >
                ↓
              </button>
            </div>
            <input
              style={{ ...inputStyle, gridColumn: "1 / -1" }}
              value={o.name}
              onChange={(e) => updateObject(o.id, { name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      })}
    </div>
  );
}
