"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { DisplayBreakpoint } from "@/core/style-engine";
import type { DisplaySnapshot } from "@/core/board/types";
import { BoardSurface } from "@/board/Board";
import { ScaleToFit } from "@/board/ScaleToFit";

/** P3.7 — embedded live preview using the same BoardSurface as /show (F-NAV2). */
export function DashboardBoardPreview({
  orgSlug,
  screens,
}: {
  orgSlug: string;
  screens: { id: string; name: string }[];
}) {
  const [screenId, setScreenId] = useState(screens[0]?.id ?? "");
  const [bp, setBp] = useState<DisplayBreakpoint>("full");
  const [snapshot, setSnapshot] = useState<DisplaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!screenId) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/display/${encodeURIComponent(orgSlug)}/${encodeURIComponent(screenId)}?bp=${bp}`,
      );
      if (!res.ok) {
        setError("Could not load board snapshot.");
        return;
      }
      setSnapshot((await res.json()) as DisplaySnapshot);
    } catch {
      setError("Could not load board snapshot.");
    }
  }, [orgSlug, screenId, bp]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15_000);
    return () => clearInterval(id);
  }, [load]);

  const style = snapshot?.style;
  const showUrl = screenId ? `/show/${orgSlug}/${screenId}` : `/show/${orgSlug}`;
  const editorUrl = `/admin/${orgSlug}/editor`;

  return (
    <section
      style={{
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, flex: 1 }}>Live preview</h2>
        <label style={{ fontSize: 13 }}>
          Screen{" "}
          <select
            value={screenId}
            onChange={(e) => setScreenId(e.target.value)}
            style={selectStyle}
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Breakpoint{" "}
          <select
            value={bp}
            onChange={(e) => setBp(e.target.value as DisplayBreakpoint)}
            style={selectStyle}
          >
            <option value="full">desktop</option>
            <option value="tablet">tablet</option>
            <option value="mobile">mobile</option>
          </select>
        </label>
        <Link href={editorUrl} style={linkBtn}>
          Edit in Editor
        </Link>
        <a href={showUrl} target="_blank" rel="noreferrer" style={linkBtn}>
          Open Full Screen
        </a>
      </div>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}
      <div
        style={{
          height: 280,
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--admin-border)",
        }}
      >
        {style && snapshot ? (
          <ScaleToFit width={style.canvasWidth} height={style.canvasHeight} fitMode="contain">
            <BoardSurface snapshot={{ ...snapshot, style }} objectPointerEvents="none" />
          </ScaleToFit>
        ) : (
          <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#94a3b8" }}>
            {screens.length === 0 ? "No screens yet" : "Loading…"}
          </div>
        )}
      </div>
    </section>
  );
}

const selectStyle: CSSProperties = {
  marginLeft: 4,
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-text)",
};

const linkBtn: CSSProperties = {
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  textDecoration: "none",
  color: "var(--admin-text)",
  background: "var(--admin-bg)",
};
