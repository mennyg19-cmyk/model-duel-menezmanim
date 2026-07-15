"use client";

import { useEffect } from "react";
import { copyObjects, pasteObjects } from "./clipboard";
import { useDocApi, useUiApi } from "../state/StoreProvider";

export function useEditorKeyboard() {
  const docApi = useDocApi();
  const uiApi = useUiApi();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      const doc = docApi.getState();
      const ui = uiApi.getState();
      const sel = ui.selectedIds;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? doc.redo() : doc.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        doc.redo();
        return;
      }
      if (typing) return;

      if (mod && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const selSet = new Set(sel);
        copyObjects(doc.objects.filter((o) => selSet.has(o.id)));
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const ids = doc.pasteObjects(pasteObjects() ?? []);
        if (ids.length) ui.setSelection(ids);
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        ui.setSelection(doc.duplicateObjects(sel));
        return;
      }
      if (e.key === "Escape") {
        ui.clearSelection();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && sel.length > 0) {
        e.preventDefault();
        doc.deleteObjects(sel);
        ui.clearSelection();
        return;
      }
      if (sel.length > 0 && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        doc.nudge(sel, dx, dy);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [docApi, uiApi]);
}
