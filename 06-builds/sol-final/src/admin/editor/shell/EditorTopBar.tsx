"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlignmentToolbar } from "../canvas/AlignmentToolbar";
import { useDoc, useDocApi, useEditorConfig, useUi } from "../state/StoreProvider";
import { btn, btnAccent, inputStyle } from "../ui";
import type { StyleActivationRule } from "@/core/style-engine";

export function EditorTopBar({
  activationRules,
  activationRulesDirty,
  onActivationRulesSaved,
  lockLabel,
}: {
  activationRules: StyleActivationRule[];
  activationRulesDirty: boolean;
  onActivationRulesSaved: () => void;
  lockLabel: string;
}) {
  const { orgId, orgSlug, styleId } = useEditorConfig();
  const docApi = useDocApi();
  const styleName = useDoc((s) => s.style.name);
  const canvasWidth = useDoc((s) => s.style.canvasWidth);
  const canvasHeight = useDoc((s) => s.style.canvasHeight);
  const dirty = useDoc((s) => s.dirty);
  const canUndo = useDoc((s) => s.canUndo);
  const canRedo = useDoc((s) => s.canRedo);
  const undo = useDoc((s) => s.undo);
  const redo = useDoc((s) => s.redo);
  const updateStyle = useDoc((s) => s.updateStyle);
  const markSaved = useDoc((s) => s.markSaved);
  const alignObjects = useDoc((s) => s.alignObjects);
  const distributeObjects = useDoc((s) => s.distributeObjects);

  const selectedIds = useUi((s) => s.selectedIds);
  const preview = useUi((s) => s.preview);
  const setPreview = useUi((s) => s.setPreview);
  const snapEnabled = useUi((s) => s.snapEnabled);
  const toggleSnap = useUi((s) => s.toggleSnap);
  const gridSize = useUi((s) => s.gridSize);
  const toggleGrid = useUi((s) => s.toggleGrid);
  const zoomMode = useUi((s) => s.zoomMode);
  const previewScreenId = useUi((s) => s.previewScreenId);
  const setZoom = useUi((s) => s.setZoom);
  const zoomBy = useUi((s) => s.zoomBy);
  const setAddOverlay = useUi((s) => s.setAddOverlay);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const zoomPercent = zoomMode === "fit" ? "Fit" : zoomMode === "fill" ? "Fill" : `${zoomMode}%`;

  // Heartbeat refresh lock every 2 min while editor open
  useEffect(() => {
    const tick = () => void fetch(`/api/org/${orgId}/lock`, { method: "POST" });
    tick();
    const id = setInterval(tick, 120_000);
    return () => {
      clearInterval(id);
      void fetch(`/api/org/${orgId}/lock`, { method: "DELETE" });
    };
  }, [orgId]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { objects, style } = docApi.getState();
      const res = await fetch(`/api/org/${orgId}/styles/${styleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: style.name,
          canvasWidth: style.canvasWidth,
          canvasHeight: style.canvasHeight,
          backgroundColor: style.backgroundColor,
          backgroundMode: style.backgroundMode,
          backgroundImage: style.backgroundImage,
          backgroundGradient: style.backgroundGradient,
          backgroundTexture: style.backgroundTexture,
          backgroundFrameId: style.backgroundFrameId,
          backgroundFrameThickness: style.backgroundFrameThickness,
          activationRules,
          objects,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) setSaveMsg(json.error ?? "Save failed");
      else {
        markSaved();
        onActivationRulesSaved();
        setSaveMsg("Saved");
      }
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [orgId, styleId, docApi, markSaved, activationRules, onActivationRulesSaved]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderBottom: "1px solid #334155",
        background: "#0f172a",
        flexWrap: "nowrap",
        overflowX: "auto",
        flexShrink: 0,
        minHeight: 48,
      }}
    >
      <Link href={`/admin/${orgSlug}/screens`} style={{ ...btn, textDecoration: "none" }} title="Back to admin">
        ← Admin
      </Link>
      <input
        style={{ ...inputStyle, width: 140 }}
        value={styleName}
        onChange={(e) => updateStyle({ name: e.target.value })}
        aria-label="Style name"
      />
      <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
        {canvasWidth}×{canvasHeight}
      </span>
      <span style={{ fontSize: 11, color: lockLabel.includes("held") ? "#fca5a5" : "#86efac", whiteSpace: "nowrap" }}>{lockLabel}</span>

      <button type="button" style={{ ...btn, background: snapEnabled ? "#2563eb" : undefined }} onClick={toggleSnap} title="Snap">
        Snap
      </button>
      <button type="button" style={{ ...btn, background: gridSize > 0 ? "#2563eb" : undefined }} onClick={toggleGrid} title="Grid">
        Grid
      </button>
      <button type="button" style={btn} onClick={() => setAddOverlay(true)}>
        + Widget
      </button>

      <AlignmentToolbar
        selectedCount={selectedIds.length}
        onAlign={(op) => alignObjects(selectedIds, op)}
        onDistribute={(axis) => distributeObjects(selectedIds, axis)}
      />

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" style={btn} onClick={() => zoomBy(-10, 100)}>
          −
        </button>
        <button type="button" style={btn} onClick={() => setZoom("fit")} title="Fit">
          {zoomPercent}
        </button>
        <button type="button" style={btn} onClick={() => zoomBy(10, 100)}>
          +
        </button>
        <button type="button" style={btn} onClick={() => setZoom("fit")}>
          Fit
        </button>
        <button type="button" style={btn} onClick={() => setZoom("fill")}>
          Fill
        </button>
        <button type="button" style={btn} disabled={!canUndo} onClick={undo}>
          Undo
        </button>
        <button type="button" style={btn} disabled={!canRedo} onClick={redo}>
          Redo
        </button>
        <button type="button" style={btn} onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </button>
        <a
          href={previewScreenId ? `/show/${orgSlug}/${previewScreenId}` : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!previewScreenId}
          style={{ ...btn, textDecoration: "none", opacity: previewScreenId ? 1 : 0.45 }}
        >
          Live
        </a>
        <button type="button" style={btnAccent} disabled={saving || (!dirty && !activationRulesDirty)} onClick={() => void save()}>
          {saving ? "Saving…" : dirty || activationRulesDirty ? "Save" : "Saved"}
        </button>
        {saveMsg ? <span style={{ fontSize: 11, color: "#94a3b8" }}>{saveMsg}</span> : null}
      </div>
    </div>
  );
}
