"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DAY_TYPE_OPTIONS,
  resolveScreenStyleSchedules,
  resolveStyleForScreen,
  type DisplayBreakpoint,
  type ScreenScheduleBreakpoint,
  type ScreenStyleSchedule,
  type StyleScheduleRule,
} from "@/core/style-engine";
import { btn, btnAccent, btnDanger, card, field, input } from "@/admin/formStyles";

type StyleSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  sortOrder: number;
};

type ScreenRow = {
  id: string;
  name: string;
  resolution: string;
  assignedStyleId: string | null;
  styleSchedules: ScreenStyleSchedule[];
  isActive: boolean;
  lastSeenAt: string | null;
};

const PRESETS = ["1920x1080", "1280x720", "1080x1920", "3840x2160"];
const BREAKPOINTS: ScreenScheduleBreakpoint[] = ["all", "mobile", "tablet", "full"];
const PREVIEW_BPS: DisplayBreakpoint[] = ["mobile", "tablet", "full"];

function parseRes(r: string): { w: number; h: number } | null {
  const m = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(r.trim());
  if (!m) return null;
  return { w: Number(m[1]), h: Number(m[2]) };
}

function emptySchedule(styleId: string): ScreenStyleSchedule {
  return {
    id: crypto.randomUUID(),
    styleId,
    breakpoint: "all",
    priority: 0,
    rules: [{ type: "default" }],
  };
}

/** P7 Screens & Styles (+ F6 custom resolution). */
export function ScreensManager({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [screens, setScreens] = useState<ScreenRow[]>([]);
  const [styles, setStyles] = useState<StyleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScreenRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    resolution: "1920x1080",
    customW: "",
    customH: "",
    useCustom: false,
    assignedStyleId: "",
    isActive: true,
    styleSchedules: [] as ScreenStyleSchedule[],
  });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [styleNameEdit, setStyleNameEdit] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/org/${orgId}/screens`);
    if (!res.ok) {
      setError("Could not load screens.");
      return;
    }
    const json = (await res.json()) as { screens: ScreenRow[]; styles: StyleSummary[] };
    setScreens(json.screens);
    setStyles(json.styles);
    setStyleNameEdit(Object.fromEntries(json.styles.map((s) => [s.id, s.name])));
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  const styleById = useMemo(() => new Map(styles.map((s) => [s.id, s])), [styles]);

  function openCreate() {
    setEditing(null);
    const defaultStyle = styles.find((s) => s.isDefault)?.id ?? styles[0]?.id ?? "";
    setForm({
      name: "",
      resolution: "1920x1080",
      customW: "",
      customH: "",
      useCustom: false,
      assignedStyleId: defaultStyle,
      isActive: true,
      styleSchedules: defaultStyle ? [emptySchedule(defaultStyle)] : [],
    });
    setShowForm(true);
  }

  function openEdit(s: ScreenRow) {
    setEditing(s);
    const parsed = parseRes(s.resolution);
    const isPreset = PRESETS.includes(s.resolution);
    setForm({
      name: s.name,
      resolution: s.resolution,
      customW: parsed && !isPreset ? String(parsed.w) : "",
      customH: parsed && !isPreset ? String(parsed.h) : "",
      useCustom: !isPreset,
      assignedStyleId: s.assignedStyleId ?? "",
      isActive: s.isActive,
      styleSchedules: s.styleSchedules?.length
        ? s.styleSchedules
        : s.assignedStyleId
          ? [emptySchedule(s.assignedStyleId)]
          : [],
    });
    setShowForm(true);
  }

  function resolutionValue(): string {
    if (form.useCustom && form.customW && form.customH) return `${form.customW}x${form.customH}`;
    return form.resolution;
  }

  async function saveScreen() {
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      resolution: resolutionValue(),
      assignedStyleId: form.assignedStyleId || null,
      isActive: form.isActive,
      styleSchedules: form.styleSchedules,
    };
    const res = editing
      ? await fetch(`/api/org/${orgId}/screens/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/org/${orgId}/screens`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Save failed.");
      return;
    }
    setShowForm(false);
    await load();
  }

  async function removeScreen(id: string) {
    if (!confirm("Delete this screen?")) return;
    const res = await fetch(`/api/org/${orgId}/screens/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed (need admin).");
      return;
    }
    await load();
  }

  async function toggleActive(s: ScreenRow) {
    await fetch(`/api/org/${orgId}/screens/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    await load();
  }

  async function createStyle() {
    const res = await fetch(`/api/org/${orgId}/styles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New style" }),
    });
    if (!res.ok) {
      setError("Could not create style.");
      return;
    }
    await load();
  }

  async function renameStyle(id: string) {
    const name = styleNameEdit[id]?.trim();
    if (!name) return;
    await fetch(`/api/org/${orgId}/styles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await load();
  }

  async function duplicateStyle(id: string) {
    await fetch(`/api/org/${orgId}/styles/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    await load();
  }

  async function deleteStyle(id: string) {
    if (!confirm("Delete this style?")) return;
    const res = await fetch(`/api/org/${orgId}/styles/${id}`, { method: "DELETE" });
    if (!res.ok) setError("Could not delete style.");
    await load();
  }

  function updateSchedule(i: number, patch: Partial<ScreenStyleSchedule>) {
    setForm((f) => {
      const next = f.styleSchedules.slice();
      next[i] = { ...next[i]!, ...patch };
      return { ...f, styleSchedules: next };
    });
  }

  function setRuleType(i: number, type: StyleScheduleRule["type"]) {
    let rule: StyleScheduleRule;
    switch (type) {
      case "default":
        rule = { type: "default" };
        break;
      case "day_type":
        rule = { type: "day_type", dayType: "weekday" };
        break;
      case "day_of_week":
        rule = { type: "day_of_week", days: [0, 1, 2, 3, 4, 5, 6] };
        break;
      case "gregorian_date_range":
        rule = { type: "gregorian_date_range", startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 };
        break;
      case "hebrew_date_range":
        rule = { type: "hebrew_date_range", startMonth: 1, startDay: 1, endMonth: 12, endDay: 29 };
        break;
      default:
        rule = { type: "default" };
    }
    updateSchedule(i, { rules: [rule] });
  }

  function todayPreview(s: ScreenRow, bp: DisplayBreakpoint): string {
    const mapped = styles.map((st) => ({
      id: st.id,
      name: st.name,
      backgroundColor: st.backgroundColor,
      canvasWidth: st.canvasWidth,
      canvasHeight: st.canvasHeight,
      objects: [],
      activationRules: [{ type: "default" as const }],
      sortOrder: st.sortOrder,
    }));
    const schedules = resolveScreenStyleSchedules(s.styleSchedules, s.assignedStyleId, mapped);
    const active = resolveStyleForScreen(schedules, mapped, new Date(), bp);
    return active?.name ?? "(none)";
  }

  function mismatchWarning(s: ScreenRow): string | null {
    const screenRes = parseRes(s.resolution);
    if (!screenRes) return null;
    const styleIds = new Set<string>();
    if (s.assignedStyleId) styleIds.add(s.assignedStyleId);
    for (const sch of s.styleSchedules ?? []) styleIds.add(sch.styleId);
    const mismatches: string[] = [];
    for (const id of styleIds) {
      const st = styleById.get(id);
      if (!st) continue;
      if (st.canvasWidth !== screenRes.w || st.canvasHeight !== screenRes.h) {
        mismatches.push(`${st.name} (${st.canvasWidth}×${st.canvasHeight})`);
      }
    }
    if (!mismatches.length) return null;
    return `Resolution mismatch vs screen ${s.resolution}: ${mismatches.join(", ")}`;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Screens & Styles</h1>
        <button type="button" style={btnAccent} onClick={openCreate}>
          Add screen
        </button>
      </div>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      {screens.map((s) => {
        const warn = mismatchWarning(s);
        const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/show/${orgSlug}/${s.id}`;
        return (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                  {s.resolution} · {s.isActive ? "active" : "inactive"} · style{" "}
                  {styleById.get(s.assignedStyleId ?? "")?.name ?? "—"}
                  {s.lastSeenAt ? ` · last seen ${new Date(s.lastSeenAt).toLocaleString()}` : " · no heartbeat yet"}
                </div>
                {warn ? <div style={{ fontSize: 12, color: "var(--admin-danger)", marginTop: 4 }}>{warn}</div> : null}
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  Today active:{" "}
                  {PREVIEW_BPS.map((bp) => `${bp}→${todayPreview(s, bp)}`).join(" · ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" style={btn} onClick={() => openEdit(s)}>
                  Edit
                </button>
                <button type="button" style={btn} onClick={() => void toggleActive(s)}>
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  style={btn}
                  onClick={() => void navigator.clipboard.writeText(publicUrl)}
                  title={publicUrl}
                >
                  Copy URL
                </button>
                <a href={`/show/${orgSlug}/${s.id}`} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>
                  Preview
                </a>
                <button type="button" style={btnDanger} onClick={() => void removeScreen(s.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {showForm ? (
        <div style={{ ...card, borderColor: "var(--admin-accent)" }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>{editing ? "Edit screen" : "New screen"}</h2>
          <label style={field}>
            Name
            <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.useCustom} onChange={(e) => setForm({ ...form, useCustom: e.target.checked })} />
            Custom resolution (F6)
          </label>
          {form.useCustom ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={field}>
                Width
                <input style={input} value={form.customW} onChange={(e) => setForm({ ...form, customW: e.target.value })} />
              </label>
              <label style={field}>
                Height
                <input style={input} value={form.customH} onChange={(e) => setForm({ ...form, customH: e.target.value })} />
              </label>
            </div>
          ) : (
            <label style={field}>
              Resolution
              <select style={input} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                {PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label style={field}>
            Assigned style (fallback)
            <select
              style={input}
              value={form.assignedStyleId}
              onChange={(e) => setForm({ ...form, assignedStyleId: e.target.value })}
            >
              <option value="">—</option>
              {styles.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>

          <h3 style={{ fontSize: 14 }}>Style schedules (P7.3)</h3>
          {form.styleSchedules.map((sch, i) => {
            const rule = sch.rules[0] ?? { type: "default" as const };
            return (
              <div key={sch.id} style={{ ...card, background: "transparent" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <label style={field}>
                    Style
                    <select style={input} value={sch.styleId} onChange={(e) => updateSchedule(i, { styleId: e.target.value })}>
                      {styles.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={field}>
                    Breakpoint
                    <select
                      style={input}
                      value={sch.breakpoint}
                      onChange={(e) => updateSchedule(i, { breakpoint: e.target.value as ScreenStyleSchedule["breakpoint"] })}
                    >
                      {BREAKPOINTS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={field}>
                    Priority
                    <input
                      type="number"
                      style={input}
                      value={sch.priority}
                      onChange={(e) => updateSchedule(i, { priority: Number(e.target.value) || 0 })}
                    />
                  </label>
                </div>
                <label style={field}>
                  Rule
                  <select style={input} value={rule.type} onChange={(e) => setRuleType(i, e.target.value as StyleScheduleRule["type"])}>
                    <option value="default">default</option>
                    <option value="day_type">day type</option>
                    <option value="day_of_week">day of week</option>
                    <option value="gregorian_date_range">gregorian range</option>
                    <option value="hebrew_date_range">hebrew range</option>
                  </select>
                </label>
                {rule.type === "day_type" ? (
                  <label style={field}>
                    Day type
                    <select
                      style={input}
                      value={rule.dayType}
                      onChange={(e) => updateSchedule(i, { rules: [{ type: "day_type", dayType: e.target.value as typeof rule.dayType }] })}
                    >
                      {DAY_TYPE_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button
                  type="button"
                  style={btnDanger}
                  onClick={() => setForm((f) => ({ ...f, styleSchedules: f.styleSchedules.filter((_, j) => j !== i) }))}
                >
                  Remove schedule
                </button>
              </div>
            );
          })}
          <button
            type="button"
            style={btn}
            onClick={() =>
              setForm((f) => ({
                ...f,
                styleSchedules: [...f.styleSchedules, emptySchedule(f.assignedStyleId || styles[0]?.id || "")],
              }))
            }
          >
            Add schedule entry
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" style={btnAccent} disabled={busy || !form.name.trim()} onClick={() => void saveScreen()}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" style={btn} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <h2 style={{ marginTop: 28 }}>Styles (P7.7)</h2>
      <button type="button" style={{ ...btnAccent, marginBottom: 10 }} onClick={() => void createStyle()}>
        New style
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {styles.map((st) => (
          <div key={st.id} style={card}>
            <div
              style={{
                height: 72,
                borderRadius: 6,
                background: st.backgroundColor,
                marginBottom: 8,
                border: "1px solid var(--admin-border)",
              }}
              title={`${st.canvasWidth}×${st.canvasHeight}`}
            />
            <input
              style={input}
              value={styleNameEdit[st.id] ?? st.name}
              onChange={(e) => setStyleNameEdit((m) => ({ ...m, [st.id]: e.target.value }))}
              onBlur={() => void renameStyle(st.id)}
            />
            <div style={{ fontSize: 11, color: "var(--admin-muted)", margin: "6px 0" }}>
              {st.canvasWidth}×{st.canvasHeight}
              {st.isDefault ? " · default" : ""}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <Link href={`/admin/${orgSlug}/editor/${st.id}`} style={{ ...btn, textDecoration: "none" }}>
                Open in Editor
              </Link>
              <button type="button" style={btn} onClick={() => void duplicateStyle(st.id)}>
                Dup
              </button>
              <button type="button" style={btnDanger} onClick={() => void deleteStyle(st.id)}>
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
