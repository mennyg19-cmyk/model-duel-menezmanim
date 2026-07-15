"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { ZmanType } from "@/core/zman-types";
import type { MinyanDetails, ScheduleRule } from "@/db/json";
import { ScheduleRuleEditor } from "./ScheduleRuleEditor";
import {
  DAY_LABELS,
  SCHEDULE_TYPES,
  formatTimeLabel,
  isPlaceholder,
  maskLabel,
  rowVisibility,
  type GroupRow,
  type RowVisibility,
  type ScheduleRow,
  type ScheduleWriteBody,
} from "./types";

const emptyForm = (): ScheduleWriteBody & { visibilityCombineMode: "all" | "any" } => ({
  name: "",
  hebrewName: "",
  type: "shacharit",
  baseZman: "HANETZ",
  fixedTime: null,
  offset: 0,
  earliest: null,
  latest: null,
  roundTo: 5,
  roundDirection: "nearest",
  room: "",
  dayOfWeekMask: "1111111",
  scheduleGroupIds: [],
  details: {
    durationMinutes: undefined,
    nearestEventWindowMinutes: undefined,
    refreshMode: "auto",
    hideIfMinMaxReached: false,
    displayOffset: 0,
    visibilityRules: [],
    visibilityCombineMode: "any",
    rowVisibility: "inherit",
  },
  isActive: true,
  visibilityCombineMode: "any",
});

/** P4 schedules admin — single module (F3: no ScheduleForm / ScheduleListTable forks). */
export function ScheduleEditor({ orgId }: { orgId: string }) {
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterGroupId, setFilterGroupId] = useState<string | "all">("all");
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>({
    shacharit: true,
    mincha: true,
    maariv: true,
    other: true,
    placeholder: true,
  });
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", hebrewName: "", color: "#2563eb" });
  const [bulkGroupId, setBulkGroupId] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [sRes, gRes] = await Promise.all([
      fetch(`/api/org/${orgId}/schedules`),
      fetch(`/api/org/${orgId}/groups`),
    ]);
    if (!sRes.ok || !gRes.ok) {
      setError("Could not load schedules.");
      return;
    }
    const sData = (await sRes.json()) as { schedules: ScheduleRow[] };
    const gData = (await gRes.json()) as { groups: GroupRow[] };
    setSchedules(sData.schedules);
    setGroups(gData.groups);
    if (!bulkGroupId && gData.groups[0]) setBulkGroupId(gData.groups[0].id);
  }, [orgId, bulkGroupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filterGroupId === "all") return schedules;
    return schedules.filter((s) => (s.scheduleGroupIds ?? []).includes(filterGroupId));
  }, [schedules, filterGroupId]);

  const byType = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>();
    for (const t of SCHEDULE_TYPES) map.set(t.id, []);
    for (const row of filtered) {
      const key = isPlaceholder(row)
        ? "placeholder"
        : SCHEDULE_TYPES.some((t) => t.id === row.type)
          ? row.type
          : "other";
      const list = map.get(key) ?? map.get("other")!;
      list.push(row);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [filtered]);

  function openCreate(type = "shacharit") {
    setEditing(null);
    setForm({ ...emptyForm(), type, ...(type === "placeholder" ? { baseZman: null, fixedTime: null } : {}) });
    setShowForm(true);
  }

  function openEdit(row: ScheduleRow) {
    setEditing(row);
    const details = row.details ?? {};
    setForm({
      name: row.name,
      hebrewName: row.hebrewName,
      type: row.type,
      baseZman: row.baseZman,
      fixedTime: row.fixedTime,
      offset: row.offset,
      earliest: row.earliest,
      latest: row.latest,
      roundTo: row.roundTo,
      roundDirection: row.roundDirection,
      room: row.room ?? "",
      dayOfWeekMask: row.dayOfWeekMask,
      scheduleGroupIds: row.scheduleGroupIds ?? [],
      details,
      isActive: row.isActive,
      visibilityCombineMode: details.visibilityCombineMode ?? "any",
    });
    setShowForm(true);
  }

  async function saveForm() {
    const details: MinyanDetails = {
      ...(form.details ?? {}),
      visibilityCombineMode: form.visibilityCombineMode,
      isPlaceholder: form.type === "placeholder" ? true : form.details?.isPlaceholder,
    };
    const payload: ScheduleWriteBody = {
      ...form,
      room: form.room || null,
      details,
    };
    const res = editing
      ? await fetch(`/api/org/${orgId}/schedules/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/org/${orgId}/schedules`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Save failed.");
      return;
    }
    setShowForm(false);
    await load();
  }

  async function duplicate(row: ScheduleRow) {
    await fetch(`/api/org/${orgId}/schedules`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: `${row.name} (copy)`,
        hebrewName: row.hebrewName,
        type: row.type,
        baseZman: row.baseZman,
        fixedTime: row.fixedTime,
        offset: row.offset,
        earliest: row.earliest,
        latest: row.latest,
        roundTo: row.roundTo,
        roundDirection: row.roundDirection,
        room: row.room,
        dayOfWeekMask: row.dayOfWeekMask,
        scheduleGroupIds: row.scheduleGroupIds,
        details: row.details,
        isActive: row.isActive,
      }),
    });
    await load();
  }

  async function toggleActive(row: ScheduleRow) {
    await fetch(`/api/org/${orgId}/schedules/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    await load();
  }

  async function remove(row: ScheduleRow) {
    if (!confirm(`Delete “${row.name}”?`)) return;
    await fetch(`/api/org/${orgId}/schedules/${row.id}`, { method: "DELETE" });
    await load();
  }

  async function setVisibility(row: ScheduleRow, next: RowVisibility) {
    await fetch(`/api/org/${orgId}/schedules/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ details: { ...(row.details ?? {}), rowVisibility: next } }),
    });
    await load();
  }

  async function bulk(action: "bulk_delete" | "bulk_move" | "bulk_copy") {
    const ids = [...selected];
    if (!ids.length) return;
    if (action === "bulk_delete" && !confirm(`Delete ${ids.length} schedules?`)) return;
    await fetch(`/api/org/${orgId}/schedules/bulk`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ids, groupId: bulkGroupId }),
    });
    setSelected(new Set());
    await load();
  }

  async function onDropReorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = filtered.map((s) => s.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    // Keep non-filtered ids at end with their relative order
    const rest = schedules.map((s) => s.id).filter((id) => !ids.includes(id));
    await fetch(`/api/org/${orgId}/schedules/bulk`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reorder", orderedIds: [...ids, ...rest] }),
    });
    setDragId(null);
    await load();
  }

  async function createGroup() {
    if (!groupForm.name.trim()) return;
    await fetch(`/api/org/${orgId}/groups`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(groupForm),
    });
    setGroupForm({ name: "", hebrewName: "", color: "#2563eb" });
    await load();
  }

  async function toggleGroupActive(g: GroupRow) {
    await fetch(`/api/org/${orgId}/groups/${g.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !g.active }),
    });
    await load();
  }

  function toggleDay(i: number) {
    const mask = (form.dayOfWeekMask || "1111111").padEnd(7, "0").slice(0, 7).split("");
    mask[i] = mask[i] === "1" ? "0" : "1";
    setForm({ ...form, dayOfWeekMask: mask.join("") });
  }

  const zmanOptions = Object.values(ZmanType);
  const visibilityRules = (form.details?.visibilityRules ?? []) as ScheduleRule[];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
      {/* P4.8 / P4.5 groups sidebar */}
      <aside style={{ ...card, position: "sticky", top: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 15 }}>Groups</h2>
        <button
          type="button"
          style={{ ...btn, width: "100%", marginBottom: 8 }}
          onClick={() => setFilterGroupId("all")}
          data-active={filterGroupId === "all"}
        >
          All schedules ({schedules.length})
        </button>
        {groups.map((g) => (
          <div key={g.id} style={{ marginBottom: 6 }}>
            <button
              type="button"
              style={{
                ...btn,
                width: "100%",
                textAlign: "left",
                borderLeft: `4px solid ${g.color}`,
                opacity: g.active ? 1 : 0.55,
                background: filterGroupId === g.id ? "var(--admin-accent)" : "var(--admin-bg)",
                color: filterGroupId === g.id ? "var(--admin-accent-text)" : "var(--admin-text)",
              }}
              onClick={() => setFilterGroupId(g.id)}
            >
              {g.name} <span style={{ opacity: 0.7 }}>({g.scheduleCount})</span>
            </button>
            <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
              <button type="button" style={tinyBtn} onClick={() => void toggleGroupActive(g)}>
                {g.active ? "On" : "Off"}
              </button>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, borderTop: "1px solid var(--admin-border)", paddingTop: 10 }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>New group</div>
          <input
            placeholder="Name"
            value={groupForm.name}
            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
            style={input}
          />
          <input
            placeholder="Hebrew"
            value={groupForm.hebrewName}
            onChange={(e) => setGroupForm({ ...groupForm, hebrewName: e.target.value })}
            style={{ ...input, marginTop: 6 }}
          />
          <input
            type="color"
            value={groupForm.color}
            onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
            style={{ ...input, marginTop: 6, height: 32 }}
          />
          <button type="button" style={{ ...btn, width: "100%", marginTop: 8 }} onClick={() => void createGroup()}>
            Add group
          </button>
        </div>
      </aside>

      <div>
        <header style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ margin: 0, flex: 1 }}>Schedules</h1>
          <button type="button" style={btn} onClick={() => openCreate("shacharit")}>
            Add event
          </button>
          <button type="button" style={btn} onClick={() => openCreate("placeholder")}>
            Add spacer
          </button>
        </header>

        {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

        {/* P4.6 bulk */}
        <div style={{ ...card, marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>{selected.size} selected</span>
          <select value={bulkGroupId} onChange={(e) => setBulkGroupId(e.target.value)} style={inputNarrow}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button type="button" style={btn} disabled={!selected.size} onClick={() => void bulk("bulk_copy")}>
            Copy → group
          </button>
          <button type="button" style={btn} disabled={!selected.size} onClick={() => void bulk("bulk_move")}>
            Move → group
          </button>
          <button type="button" style={btn} disabled={!selected.size} onClick={() => void bulk("bulk_delete")}>
            Delete
          </button>
        </div>

        {/* P4.1 / P4.8 accordion by type */}
        {SCHEDULE_TYPES.map((t) => {
          const rows = byType.get(t.id) ?? [];
          const open = openTypes[t.id] !== false;
          return (
            <section key={t.id} style={{ ...card, marginBottom: 10 }}>
              <button
                type="button"
                style={{
                  ...btn,
                  width: "100%",
                  textAlign: "left",
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
                onClick={() => setOpenTypes({ ...openTypes, [t.id]: !open })}
              >
                {open ? "▾" : "▸"} {t.label} ({rows.length})
              </button>
              {open ? (
                <div style={{ marginTop: 10 }}>
                  {rows.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: "var(--admin-muted)" }}>No rows</p>
                  ) : null}
                  {rows.map((row) => {
                    const vis = rowVisibility(row.details);
                    return (
                      <div
                        key={row.id}
                        draggable
                        onDragStart={() => setDragId(row.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => void onDropReorder(row.id)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr auto",
                          gap: 8,
                          alignItems: "center",
                          padding: "8px 0",
                          borderTop: "1px solid var(--admin-border)",
                          opacity: row.isActive ? 1 : 0.5,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            setSelected(next);
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {row.name}{" "}
                            <span style={{ color: "var(--admin-muted)", fontWeight: 400 }}>{row.hebrewName}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                            {formatTimeLabel(row)}
                            {row.room ? ` · ${row.room}` : ""}
                            {" · "}
                            {maskLabel(row.dayOfWeekMask)}
                            {(row.scheduleGroupIds ?? []).length
                              ? ` · groups: ${(row.scheduleGroupIds ?? [])
                                  .map((id) => groups.find((g) => g.id === id)?.name ?? id.slice(0, 6))
                                  .join(", ")}`
                              : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {/* P4.8 tri-state */}
                          {(["inherit", "show", "hide"] as RowVisibility[]).map((v) => (
                            <button
                              key={v}
                              type="button"
                              title={v}
                              style={{
                                ...tinyBtn,
                                fontWeight: vis === v ? 700 : 400,
                                borderColor: vis === v ? "var(--admin-accent)" : "var(--admin-border)",
                              }}
                              onClick={() => void setVisibility(row, v)}
                            >
                              {v === "inherit" ? "—" : v === "show" ? "✓" : "✗"}
                            </button>
                          ))}
                          <button type="button" style={tinyBtn} onClick={() => openEdit(row)}>
                            Edit
                          </button>
                          <button type="button" style={tinyBtn} onClick={() => void duplicate(row)}>
                            Dup
                          </button>
                          <button type="button" style={tinyBtn} onClick={() => void toggleActive(row)}>
                            {row.isActive ? "Active" : "Off"}
                          </button>
                          <button type="button" style={tinyBtn} onClick={() => void remove(row)}>
                            Del
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}

        {showForm ? (
          <div
            role="dialog"
            style={{
              ...card,
              marginTop: 16,
              position: "relative",
              maxWidth: 720,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{editing ? "Edit schedule" : "New schedule"}</h2>
              <button type="button" style={btn} onClick={() => setShowForm(false)}>
                Close
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={lab}>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={input}
                  required
                />
              </label>
              <label style={lab}>
                Hebrew name
                <input
                  value={form.hebrewName ?? ""}
                  onChange={(e) => setForm({ ...form, hebrewName: e.target.value })}
                  style={input}
                />
              </label>
              <label style={lab}>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={input}
                >
                  {SCHEDULE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={lab}>
                Room
                <input
                  value={form.room ?? ""}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  style={input}
                />
              </label>
              <label style={lab}>
                Base zman
                <select
                  value={form.baseZman ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      baseZman: e.target.value || null,
                      fixedTime: e.target.value ? null : form.fixedTime,
                    })
                  }
                  style={input}
                >
                  <option value="">(fixed time)</option>
                  {zmanOptions.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </label>
              <label style={lab}>
                Fixed time (HH:MM)
                <input
                  value={form.fixedTime ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fixedTime: e.target.value || null,
                      baseZman: e.target.value ? null : form.baseZman,
                    })
                  }
                  style={input}
                  placeholder="13:30"
                />
              </label>
              <label style={lab}>
                Offset (min)
                <input
                  type="number"
                  value={form.offset ?? 0}
                  onChange={(e) => setForm({ ...form, offset: Number(e.target.value) })}
                  style={input}
                />
              </label>
              <label style={lab}>
                Round to (min)
                <input
                  type="number"
                  value={form.roundTo ?? 5}
                  onChange={(e) => setForm({ ...form, roundTo: Number(e.target.value) })}
                  style={input}
                />
              </label>
              <label style={lab}>
                Round direction
                <select
                  value={form.roundDirection ?? "nearest"}
                  onChange={(e) => setForm({ ...form, roundDirection: e.target.value })}
                  style={input}
                >
                  <option value="nearest">nearest</option>
                  <option value="up">up</option>
                  <option value="down">down</option>
                  <option value="none">none</option>
                </select>
              </label>
              <label style={lab}>
                Earliest (HH:MM)
                <input
                  value={form.earliest ?? ""}
                  onChange={(e) => setForm({ ...form, earliest: e.target.value || null })}
                  style={input}
                />
              </label>
              <label style={lab}>
                Latest (HH:MM)
                <input
                  value={form.latest ?? ""}
                  onChange={(e) => setForm({ ...form, latest: e.target.value || null })}
                  style={input}
                />
              </label>
            </div>

            <fieldset style={{ marginTop: 12, border: "1px solid var(--admin-border)", borderRadius: 8, padding: 10 }}>
              <legend style={{ fontSize: 12 }}>Days</legend>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAY_LABELS.map((d, i) => {
                  const on = (form.dayOfWeekMask || "1111111")[i] === "1";
                  return (
                    <button
                      key={d}
                      type="button"
                      style={{
                        ...tinyBtn,
                        background: on ? "var(--admin-accent)" : "var(--admin-bg)",
                        color: on ? "var(--admin-accent-text)" : "var(--admin-text)",
                      }}
                      onClick={() => toggleDay(i)}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset style={{ marginTop: 12, border: "1px solid var(--admin-border)", borderRadius: 8, padding: 10 }}>
              <legend style={{ fontSize: 12 }}>Groups</legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {groups.map((g) => {
                  const on = (form.scheduleGroupIds ?? []).includes(g.id);
                  return (
                    <label key={g.id} style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => {
                          const set = new Set(form.scheduleGroupIds ?? []);
                          if (e.target.checked) set.add(g.id);
                          else set.delete(g.id);
                          setForm({ ...form, scheduleGroupIds: [...set] });
                        }}
                      />
                      <span style={{ borderLeft: `3px solid ${g.color}`, paddingLeft: 4 }}>{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset style={{ marginTop: 12, border: "1px solid var(--admin-border)", borderRadius: 8, padding: 10 }}>
              <legend style={{ fontSize: 12 }}>Advanced details</legend>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label style={lab}>
                  Duration (min)
                  <input
                    type="number"
                    value={form.details?.durationMinutes ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        details: {
                          ...(form.details ?? {}),
                          durationMinutes: e.target.value === "" ? undefined : Number(e.target.value),
                        },
                      })
                    }
                    style={input}
                  />
                </label>
                <label style={lab}>
                  Nearest-event window (min)
                  <input
                    type="number"
                    value={form.details?.nearestEventWindowMinutes ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        details: {
                          ...(form.details ?? {}),
                          nearestEventWindowMinutes: e.target.value === "" ? undefined : Number(e.target.value),
                        },
                      })
                    }
                    style={input}
                  />
                </label>
                <label style={lab}>
                  Refresh mode
                  <input
                    value={form.details?.refreshMode ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, details: { ...(form.details ?? {}), refreshMode: e.target.value } })
                    }
                    style={input}
                  />
                </label>
                <label style={lab}>
                  Display offset (min)
                  <input
                    type="number"
                    value={form.details?.displayOffset ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        details: { ...(form.details ?? {}), displayOffset: Number(e.target.value) },
                      })
                    }
                    style={input}
                  />
                </label>
                <label style={{ ...lab, gridColumn: "1 / -1" }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(form.details?.hideIfMinMaxReached)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          details: { ...(form.details ?? {}), hideIfMinMaxReached: e.target.checked },
                        })
                      }
                    />
                    Hide if min/max reached
                  </span>
                </label>
                <label style={{ ...lab, gridColumn: "1 / -1" }}>
                  Placeholder label
                  <input
                    value={form.details?.placeholder ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, details: { ...(form.details ?? {}), placeholder: e.target.value } })
                    }
                    style={input}
                  />
                </label>
              </div>
              <div style={{ marginTop: 10 }}>
                <ScheduleRuleEditor
                  rules={visibilityRules}
                  combineMode={form.visibilityCombineMode}
                  groupOptions={groups.map((g) => ({ id: g.id, name: g.name }))}
                  onChange={({ rules, combineMode }) =>
                    setForm({
                      ...form,
                      visibilityCombineMode: combineMode,
                      details: {
                        ...(form.details ?? {}),
                        visibilityRules: rules,
                        visibilityCombineMode: combineMode,
                      },
                    })
                  }
                />
              </div>
            </fieldset>

            <label style={{ ...lab, marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>

            <button type="button" style={{ ...btnPrimary, marginTop: 14 }} onClick={() => void saveForm()}>
              Save
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const card: CSSProperties = {
  background: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  borderRadius: 10,
  padding: 14,
};

const input: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-text)",
  boxSizing: "border-box",
};

const inputNarrow: CSSProperties = { ...input, width: "auto", display: "inline-block", marginTop: 0 };

const lab: CSSProperties = { fontSize: 12 };

const btn: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-text)",
  cursor: "pointer",
  fontSize: 13,
};

const btnPrimary: CSSProperties = {
  ...btn,
  background: "var(--admin-accent)",
  color: "var(--admin-accent-text)",
  fontWeight: 700,
};

const tinyBtn: CSSProperties = {
  ...btn,
  padding: "4px 7px",
  fontSize: 11,
};
