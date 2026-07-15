"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoardSurface } from "@/board/Board";
import type { DisplaySnapshot } from "@/core/board/types";
import {
  orderedScreenSchedulesForBreakpoint,
  resolveStyleForScreen,
  type DisplayBreakpoint,
  type ScreenScheduleBreakpoint,
  type ScreenStyleSchedule,
  type StyleScheduleRule,
} from "@/core/style-engine";
import { formatResolution, parseResolution, publicShowUrl } from "@/admin/shell/nav";
import type { StyleSummary } from "@/admin/shell/types";

type ScreenRow = {
  id: string;
  name: string;
  resolution: string;
  isActive: boolean;
  assignedStyleId: string | null;
  styleSchedules: ScreenStyleSchedule[] | null;
  lastSeenAt: string | null;
  publicUrl?: string;
};

const PRESETS = ["1920x1080", "1280x720", "1080x1920", "800x480"];
const BREAKPOINTS: ScreenScheduleBreakpoint[] = ["all", "full", "tablet", "mobile"];
const PREVIEW_BPS: DisplayBreakpoint[] = ["full", "tablet", "mobile"];

function newId() {
  return `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function asSchedules(raw: unknown): ScreenStyleSchedule[] {
  return Array.isArray(raw) ? (raw as ScreenStyleSchedule[]) : [];
}

function styleMini(style: StyleSummary) {
  return (
    <div
      className="adm-thumb"
      style={{
        background:
          style.backgroundMode === "gradient" && style.backgroundGradient
            ? style.backgroundGradient
            : style.backgroundColor,
      }}
      title={`${style.canvasWidth}×${style.canvasHeight}`}
    >
      <span>{style.name}</span>
      <small>
        {style.canvasWidth}×{style.canvasHeight} · {style.objectCount} objects
      </small>
    </div>
  );
}

export function ScreenManager({
  orgId,
  orgSlug,
  initialScreens,
  initialStyles,
}: {
  orgId: string;
  orgSlug: string;
  initialScreens: ScreenRow[];
  initialStyles: StyleSummary[];
}) {
  const [screens, setScreens] = useState(initialScreens);
  const [styles, setStyles] = useState(initialStyles);
  const [selectedId, setSelectedId] = useState<string | null>(initialScreens[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [bpPreviews, setBpPreviews] = useState<
    Partial<Record<DisplayBreakpoint, DisplaySnapshot & { style: NonNullable<DisplaySnapshot["style"]> }>>
  >({});

  const selected = screens.find((s) => s.id === selectedId) ?? null;
  const schedules = asSchedules(selected?.styleSchedules);

  const refresh = useCallback(async () => {
    const [screenRes, styleRes] = await Promise.all([
      fetch(`/api/org/${orgId}/screens`, { cache: "no-store" }),
      fetch(`/api/org/${orgId}/styles`, { cache: "no-store" }),
    ]);
    if (screenRes.ok) {
      const body = (await screenRes.json()) as { screens: ScreenRow[] };
      setScreens(body.screens);
    }
    if (styleRes.ok) {
      const body = (await styleRes.json()) as {
        styles: Array<StyleSummary & { objects?: unknown[]; canvasWidth: number; canvasHeight: number }>;
      };
      setStyles(
        body.styles.map((s) => ({
          id: s.id,
          name: s.name,
          isDefault: s.isDefault,
          canvasWidth: s.canvasWidth,
          canvasHeight: s.canvasHeight,
          backgroundColor: s.backgroundColor,
          backgroundMode: s.backgroundMode ?? null,
          backgroundGradient: s.backgroundGradient ?? null,
          backgroundImage: s.backgroundImage ?? null,
          objectCount: Array.isArray(s.objects) ? s.objects.length : s.objectCount ?? 0,
        })),
      );
    }
  }, [orgId]);

  useEffect(() => {
    if (!selected) return;
    const parsed = parseResolution(selected.resolution);
    if (parsed) {
      setCustomW(parsed.width);
      setCustomH(parsed.height);
    }
  }, [selected?.id, selected?.resolution]);

  useEffect(() => {
    if (!selected) {
      setBpPreviews({});
      return;
    }
    let cancelled = false;
    void (async () => {
      const next: typeof bpPreviews = {};
      for (const bp of PREVIEW_BPS) {
        const res = await fetch(`/api/display/${orgSlug}/${selected.id}?bp=${bp}`, { cache: "no-store" });
        if (!res.ok) continue;
        const data = (await res.json()) as DisplaySnapshot;
        if (data.style) next[bp] = { ...data, style: data.style };
      }
      if (!cancelled) setBpPreviews(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, selected?.id, selected?.styleSchedules, selected?.assignedStyleId]);

  const mismatchWarnings = useMemo(() => {
    if (!selected) return [] as string[];
    const screenRes = parseResolution(selected.resolution);
    if (!screenRes) return [`Resolution "${selected.resolution}" is not a valid WxH value.`];
    const warnings: string[] = [];
    const styleIds = new Set<string>();
    if (selected.assignedStyleId) styleIds.add(selected.assignedStyleId);
    for (const entry of schedules) styleIds.add(entry.styleId);
    for (const styleId of styleIds) {
      const style = styles.find((s) => s.id === styleId);
      if (!style) continue;
      if (style.canvasWidth !== screenRes.width || style.canvasHeight !== screenRes.height) {
        warnings.push(
          `Style "${style.name}" is ${style.canvasWidth}×${style.canvasHeight} but screen is ${screenRes.width}×${screenRes.height}.`,
        );
      }
    }
    return warnings;
  }, [selected, schedules, styles]);

  const todayByBreakpoint = useMemo(() => {
    const now = new Date();
    const displayStyles = styles.map((s) => ({
      id: s.id,
      name: s.name,
      backgroundColor: s.backgroundColor,
      canvasWidth: s.canvasWidth,
      canvasHeight: s.canvasHeight,
      objects: [],
      activationRules: [{ type: "default" as const }],
      sortOrder: 0,
    }));
    return PREVIEW_BPS.map((bp) => {
      const chosen = resolveStyleForScreen(schedules, displayStyles, now, bp);
      const ordered = orderedScreenSchedulesForBreakpoint(schedules, bp);
      return {
        bp,
        styleName: chosen?.name ?? styles.find((s) => s.id === selected?.assignedStyleId)?.name ?? "None",
        styleId: chosen?.id ?? selected?.assignedStyleId ?? null,
        entryCount: ordered.length,
      };
    });
  }, [schedules, styles, selected?.assignedStyleId]);

  async function saveScreen(patch: Partial<ScreenRow> & { id: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/screens`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }
      const body = (await res.json()) as { screen: ScreenRow };
      setScreens((prev) => prev.map((s) => (s.id === body.screen.id ? { ...s, ...body.screen } : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function createScreen() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/screens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Screen ${screens.length + 1}`,
          resolution: formatResolution(customW, customH),
          assignedStyleId: styles.find((s) => s.isDefault)?.id ?? styles[0]?.id ?? null,
          styleSchedules: styles[0]
            ? [
                {
                  id: newId(),
                  styleId: styles.find((s) => s.isDefault)?.id ?? styles[0].id,
                  breakpoint: "all",
                  rules: [{ type: "default" }],
                  priority: 0,
                },
              ]
            : [],
        }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const body = (await res.json()) as { screen: ScreenRow };
      setScreens((prev) => [...prev, body.screen]);
      setSelectedId(body.screen.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteScreen(id: string) {
    if (!confirm("Delete this screen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/screens?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setScreens((prev) => prev.filter((s) => s.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function createStyle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Style ${styles.length + 1}` }),
      });
      if (!res.ok) throw new Error(`Create style failed (${res.status})`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create style failed");
    } finally {
      setBusy(false);
    }
  }

  async function withStyleLock<T>(run: () => Promise<T>): Promise<T> {
    const lockRes = await fetch(`/api/org/${orgId}/lock`, { method: "POST" });
    if (!lockRes.ok) {
      const body = (await lockRes.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `Could not acquire edit lock (${lockRes.status})`);
    }
    try {
      return await run();
    } finally {
      await fetch(`/api/org/${orgId}/lock`, { method: "DELETE" }).catch(() => undefined);
    }
  }

  async function styleAction(styleId: string, action: "duplicate" | "setDefault" | "delete" | "rename", name?: string) {
    setBusy(true);
    setError(null);
    try {
      if (action === "delete") {
        if (!confirm("Delete this style?")) return;
        await withStyleLock(async () => {
          const res = await fetch(`/api/org/${orgId}/styles/${styleId}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Delete failed (${res.status})`);
        });
      } else if (action === "rename" && name) {
        const res = await fetch(`/api/org/${orgId}/styles`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: styleId, name }),
        });
        if (!res.ok) throw new Error(`Rename failed (${res.status})`);
      } else {
        await withStyleLock(async () => {
          const res = await fetch(`/api/org/${orgId}/styles/${styleId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          });
          if (!res.ok) throw new Error(`${action} failed (${res.status})`);
        });
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Style action failed");
    } finally {
      setBusy(false);
    }
  }

  function updateSchedules(next: ScreenStyleSchedule[]) {
    if (!selected) return;
    void saveScreen({ id: selected.id, styleSchedules: next });
  }

  function addScheduleEntry() {
    const styleId = styles.find((s) => s.isDefault)?.id ?? styles[0]?.id;
    if (!styleId || !selected) return;
    updateSchedules([
      ...schedules,
      {
        id: newId(),
        styleId,
        breakpoint: "all",
        rules: [{ type: "default" }],
        priority: schedules.length,
      },
    ]);
  }

  async function copyUrl(screenId: string) {
    const url = `${window.location.origin}${publicShowUrl(orgSlug, screenId)}`;
    await navigator.clipboard.writeText(url);
    setCopied(screenId);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="adm-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Screens & Styles</p>
          <h1>Display targets</h1>
        </div>
        <div className="adm-inlineActions">
          <button type="button" className="button" disabled={busy} onClick={() => void createScreen()}>
            Add screen
          </button>
          <button type="button" className="button button-secondary" disabled={busy} onClick={() => void createStyle()}>
            Add style
          </button>
        </div>
      </header>

      {error ? <p className="adm-error">{error}</p> : null}

      <div className="adm-split">
        <section className="adm-card">
          <div className="adm-cardHead">
            <h2>Screens</h2>
          </div>
          <ul className="adm-list">
            {screens.map((screen) => (
              <li key={screen.id}>
                <button
                  type="button"
                  className={selectedId === screen.id ? "adm-listItem adm-listActive" : "adm-listItem"}
                  onClick={() => setSelectedId(screen.id)}
                >
                  <strong>{screen.name}</strong>
                  <small>
                    {screen.resolution} · {screen.isActive ? "active" : "off"}
                    {screen.lastSeenAt
                      ? ` · seen ${new Date(screen.lastSeenAt).toLocaleString()}`
                      : " · no heartbeat"}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-card">
          {selected ? (
            <>
              <div className="adm-cardHead">
                <h2>{selected.name}</h2>
                <div className="adm-inlineActions">
                  <button type="button" className="button button-secondary" onClick={() => void copyUrl(selected.id)}>
                    {copied === selected.id ? "Copied" : "Copy URL"}
                  </button>
                  <a className="button" href={publicShowUrl(orgSlug, selected.id)} target="_blank" rel="noreferrer">
                    Open / Preview
                  </a>
                </div>
              </div>

              <div className="adm-formGrid">
                <label>
                  Name
                  <input
                    value={selected.name}
                    onChange={(e) =>
                      setScreens((prev) =>
                        prev.map((s) => (s.id === selected.id ? { ...s, name: e.target.value } : s)),
                      )
                    }
                    onBlur={(e) => void saveScreen({ id: selected.id, name: e.target.value })}
                  />
                </label>
                <label>
                  Assigned style (fallback)
                  <select
                    value={selected.assignedStyleId ?? ""}
                    onChange={(e) =>
                      void saveScreen({
                        id: selected.id,
                        assignedStyleId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">None</option>
                    {styles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                        {style.isDefault ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-check">
                  <input
                    type="checkbox"
                    checked={selected.isActive}
                    onChange={(e) => void saveScreen({ id: selected.id, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <h3>Resolution</h3>
              <div className="adm-inlineActions">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={selected.resolution === preset ? "adm-chipActive" : "adm-chip"}
                    onClick={() => void saveScreen({ id: selected.id, resolution: preset })}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className="adm-grid2">
                <label>
                  Custom width
                  <input
                    type="number"
                    min={1}
                    value={customW}
                    onChange={(e) => setCustomW(Number(e.target.value) || 1)}
                  />
                </label>
                <label>
                  Custom height
                  <input
                    type="number"
                    min={1}
                    value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value) || 1)}
                  />
                </label>
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => void saveScreen({ id: selected.id, resolution: formatResolution(customW, customH) })}
              >
                Apply custom {formatResolution(customW, customH)}
              </button>

              {mismatchWarnings.length > 0 ? (
                <div className="adm-warn">
                  <strong>Resolution mismatch</strong>
                  <ul>
                    {mismatchWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="adm-ok">Canvas sizes match this screen resolution.</p>
              )}

              <h3>Style schedule (breakpoint-aware)</h3>
              <p className="adm-muted">
                Breakpoint-specific entries override `all`. This is the canonical style schedule for the screen.
              </p>
              <div className="adm-scheduleList">
                {schedules.map((entry, index) => (
                  <div key={entry.id} className="adm-scheduleRow">
                    <label>
                      Style
                      <select
                        value={entry.styleId}
                        onChange={(e) => {
                          const next = schedules.map((row) =>
                            row.id === entry.id ? { ...row, styleId: e.target.value } : row,
                          );
                          updateSchedules(next);
                        }}
                      >
                        {styles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Breakpoint
                      <select
                        value={entry.breakpoint}
                        onChange={(e) => {
                          const next = schedules.map((row) =>
                            row.id === entry.id
                              ? { ...row, breakpoint: e.target.value as ScreenScheduleBreakpoint }
                              : row,
                          );
                          updateSchedules(next);
                        }}
                      >
                        {BREAKPOINTS.map((bp) => (
                          <option key={bp} value={bp}>
                            {bp}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Priority
                      <input
                        type="number"
                        value={entry.priority}
                        onChange={(e) => {
                          const next = schedules.map((row) =>
                            row.id === entry.id ? { ...row, priority: Number(e.target.value) || 0 } : row,
                          );
                          updateSchedules(next);
                        }}
                      />
                    </label>
                    <label>
                      Rule
                      <select
                        value={
                          entry.rules[0]?.type === "day_type"
                            ? `day_type:${(entry.rules[0] as Extract<StyleScheduleRule, { type: "day_type" }>).dayType}`
                            : entry.rules[0]?.type === "day_of_week"
                              ? "day_of_week"
                              : "default"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          let rule: StyleScheduleRule = { type: "default" };
                          if (value === "day_of_week") rule = { type: "day_of_week", days: [5, 6] };
                          if (value === "day_type:shabbos") rule = { type: "day_type", dayType: "shabbos" };
                          if (value === "day_type:weekday") rule = { type: "day_type", dayType: "weekday" };
                          const next = schedules.map((row) =>
                            row.id === entry.id ? { ...row, rules: [rule] } : row,
                          );
                          updateSchedules(next);
                        }}
                      >
                        <option value="default">Default / always</option>
                        <option value="day_type:shabbos">Shabbos</option>
                        <option value="day_type:weekday">Weekday</option>
                        <option value="day_of_week">Fri–Sat</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => updateSchedules(schedules.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="button button-secondary" onClick={addScheduleEntry}>
                Add schedule entry
              </button>

              <h3>Today&apos;s active style by breakpoint</h3>
              <div className="adm-bpPreviewGrid">
                {todayByBreakpoint.map((row) => {
                  const snap = bpPreviews[row.bp];
                  const scale = snap ? Math.min(220 / snap.style.canvasWidth, 124 / snap.style.canvasHeight, 1) : 0.2;
                  return (
                    <div key={row.bp} className="adm-bpPreview">
                      <strong>{row.bp}</strong>
                      <span>{row.styleName}</span>
                      {snap ? (
                        <div style={{ width: snap.style.canvasWidth * scale, height: snap.style.canvasHeight * scale, overflow: "hidden" }}>
                          <div
                            style={{
                              width: snap.style.canvasWidth,
                              height: snap.style.canvasHeight,
                              transform: `scale(${scale})`,
                              transformOrigin: "top left",
                            }}
                          >
                            <BoardSurface snapshot={snap} objectPointerEvents="none" />
                          </div>
                        </div>
                      ) : (
                        <p className="adm-muted">No preview</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="adm-inlineActions" style={{ marginTop: 16 }}>
                <button type="button" className="button button-secondary" disabled={busy} onClick={() => void deleteScreen(selected.id)}>
                  Delete screen
                </button>
              </div>
            </>
          ) : (
            <p className="adm-muted">Select a screen.</p>
          )}
        </section>
      </div>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Styles</h2>
        </div>
        <div className="adm-styleGrid">
          {styles.map((style) => (
            <div key={style.id} className="adm-styleCard">
              {styleMini(style)}
              <div className="adm-inlineActions">
                <Link className="button" href={`/admin/${orgSlug}/editor/${style.id}`}>
                  Open in Editor
                </Link>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    const name = prompt("Rename style", style.name);
                    if (name) void styleAction(style.id, "rename", name);
                  }}
                >
                  Rename
                </button>
                <button type="button" className="button button-secondary" onClick={() => void styleAction(style.id, "duplicate")}>
                  Duplicate
                </button>
                <button type="button" className="button button-secondary" onClick={() => void styleAction(style.id, "setDefault")}>
                  {style.isDefault ? "Default" : "Set default"}
                </button>
                <button type="button" className="button button-secondary" onClick={() => void styleAction(style.id, "delete")}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
