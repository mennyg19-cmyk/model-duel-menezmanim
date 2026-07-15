"use client";

import { ObjectListPanel } from "../panels/ObjectListPanel";
import { PreviewPanel } from "../panels/PreviewPanel";
import { SettingsPanel } from "../panels/SettingsPanel";
import { StyleManagerPanel } from "../panels/StyleManagerPanel";
import { useUi } from "../state/StoreProvider";
import type { LeftPanel } from "../state/ui-store";
import { panelCard, btn } from "../ui";
import type { StyleActivationRule } from "@/core/style-engine";

const RAIL: { id: LeftPanel; label: string }[] = [
  { id: "objects", label: "Layers" },
  { id: "add", label: "Add" },
  { id: "settings", label: "Board" },
  { id: "styles", label: "Styles" },
  { id: "preview", label: "Preview" },
];

export function EditorLeftPanel({
  activationRules,
  onActivationChange,
}: {
  activationRules: StyleActivationRule[];
  onActivationChange: (r: StyleActivationRule[]) => void;
}) {
  const leftPanel = useUi((s) => s.leftPanel);
  const setLeftPanel = useUi((s) => s.setLeftPanel);
  const setAddOverlay = useUi((s) => s.setAddOverlay);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {RAIL.map((item) => (
          <button
            key={item.id}
            type="button"
            style={{
              ...btn,
              width: 52,
              height: 44,
              background: leftPanel === item.id ? "#2563eb" : "#1e293b",
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            }}
            onClick={() => {
              if (item.id === "add") {
                setAddOverlay(true);
                return;
              }
              setLeftPanel(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {leftPanel && leftPanel !== "add" ? (
        <div
          style={{
            ...panelCard,
            position: "absolute",
            left: 72,
            top: 12,
            bottom: 12,
            width: 300,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid #334155" }}>
            <strong style={{ fontSize: 13 }}>{RAIL.find((r) => r.id === leftPanel)?.label}</strong>
            <button type="button" style={btn} onClick={() => setLeftPanel(leftPanel)}>
              Collapse
            </button>
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            {leftPanel === "objects" && <ObjectListPanel />}
            {leftPanel === "settings" && <SettingsPanel />}
            {leftPanel === "styles" && (
              <StyleManagerPanel activationRules={activationRules} onActivationChange={onActivationChange} />
            )}
            {leftPanel === "preview" && <PreviewPanel />}
          </div>
        </div>
      ) : null}
    </>
  );
}
