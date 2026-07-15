"use client";

import { useEffect } from "react";
import { AddWidgetOverlay } from "../canvas/AddWidgetOverlay";
import { EditorCanvas } from "../canvas/EditorCanvas";
import { useEditorKeyboard } from "../interaction/useEditorKeyboard";
import { useUiApi } from "../state/StoreProvider";
import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorRightPanel } from "./EditorRightPanel";
import { EditorTopBar } from "./EditorTopBar";
import type { StyleActivationRule } from "@/core/style-engine";

export function EditorShell({
  activationRules,
  onActivationChange,
  activationRulesDirty,
  onActivationRulesSaved,
  lockLabel,
}: {
  activationRules: StyleActivationRule[];
  onActivationChange: (r: StyleActivationRule[]) => void;
  activationRulesDirty: boolean;
  onActivationRulesSaved: () => void;
  lockLabel: string;
}) {
  useEditorKeyboard();
  const uiApi = useUiApi();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const ui = uiApi.getState();
      if (ui.leftPanel) ui.setLeftPanel(ui.leftPanel);
      if (ui.rightPanelOpen) ui.setRightPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uiApi]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "#020617",
      }}
    >
      <EditorTopBar
        activationRules={activationRules}
        activationRulesDirty={activationRulesDirty}
        onActivationRulesSaved={onActivationRulesSaved}
        lockLabel={lockLabel}
      />
      <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <EditorCanvas />
        <EditorLeftPanel activationRules={activationRules} onActivationChange={onActivationChange} />
        <EditorRightPanel />
      </div>
      <AddWidgetOverlay />
    </div>
  );
}
