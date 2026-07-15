"use client";

import { useCallback, useEffect, useState } from "react";
import { BoardSurface } from "@/board/Board";
import type { DisplaySnapshot } from "@/core/board/types";
import type { DisplayBreakpoint } from "@/core/style-engine";
import { publicShowUrl } from "@/admin/shell/nav";

const BPS: { id: DisplayBreakpoint; label: string }[] = [
  { id: "full", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
];

export function LivePreviewWidget({
  orgSlug,
  screens,
  defaultStyleId,
}: {
  orgSlug: string;
  screens: { id: string; name: string }[];
  defaultStyleId: string | null;
}) {
  const [screenId, setScreenId] = useState(screens[0]?.id ?? "main");
  const [breakpoint, setBreakpoint] = useState<DisplayBreakpoint>("full");
  const [snapshot, setSnapshot] = useState<(DisplaySnapshot & { style: NonNullable<DisplaySnapshot["style"]> }) | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!screenId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/display/${orgSlug}/${screenId}?bp=${breakpoint}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      const data = (await res.json()) as DisplaySnapshot;
      if (!data.style) throw new Error("No active style for this screen/breakpoint");
      setSnapshot({ ...data, style: data.style });
    } catch (err) {
      setSnapshot(null);
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  }, [orgSlug, screenId, breakpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const styleId = snapshot?.style?.id ?? defaultStyleId;
  const scale =
    snapshot?.style != null
      ? Math.min(480 / snapshot.style.canvasWidth, 270 / snapshot.style.canvasHeight, 1)
      : 0.25;

  return (
    <section className="adm-card adm-previewCard">
      <div className="adm-cardHead">
        <h2>Live preview</h2>
        <div className="adm-inlineActions">
          <select aria-label="Preview screen" value={screenId} onChange={(e) => setScreenId(e.target.value)}>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="adm-bpToggle" role="group" aria-label="Breakpoint">
            {BPS.map((bp) => (
              <button
                key={bp.id}
                type="button"
                className={breakpoint === bp.id ? "adm-chipActive" : "adm-chip"}
                onClick={() => setBreakpoint(bp.id)}
              >
                {bp.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="adm-previewFrame">
        {loading ? <p className="adm-muted">Loading preview…</p> : null}
        {error ? <p className="adm-error">{error}</p> : null}
        {snapshot?.style ? (
          <div
            style={{
              width: snapshot.style.canvasWidth * scale,
              height: snapshot.style.canvasHeight * scale,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: snapshot.style.canvasWidth,
                height: snapshot.style.canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <BoardSurface snapshot={snapshot} objectPointerEvents="none" />
            </div>
          </div>
        ) : null}
      </div>
      <div className="adm-inlineActions">
        {styleId ? (
          <a className="button button-secondary" href={`/admin/${orgSlug}/editor/${styleId}`}>
            Edit in Editor
          </a>
        ) : null}
        {screenId ? (
          <a className="button" href={publicShowUrl(orgSlug, screenId)} target="_blank" rel="noreferrer">
            Open Full Screen
          </a>
        ) : null}
        <button type="button" className="button button-secondary" onClick={() => void load()}>
          Refresh
        </button>
      </div>
    </section>
  );
}
