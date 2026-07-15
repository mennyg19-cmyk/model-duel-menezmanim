"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TriState = "ignore" | "show" | "hide";

type ScheduleDetails = {
  roundMode?: "nearest" | "before" | "after";
  refreshMode?: "daily" | "weekly" | "monthly";
  refreshAnchorDay?: number;
  hideIfMinMaxReached?: boolean;
  isPlaceholder?: boolean;
  placeholderLabel?: string;
  displayOffset?: number;
  durationMinutes?: number;
  nearestEvent?: boolean;
  nearestBefore?: number;
  nearestAfter?: number;
  visibilityRules?: Array<{ condition: string; show: boolean }>;
  priority?: number;
};

type Schedule = {
  id: string;
  name: string;
  hebrewName: string;
  type: string;
  baseZman: string | null;
  fixedTime: string | null;
  offset: number;
  earliest: string | null;
  latest: string | null;
  roundTo: number;
  room: string | null;
  dayOfWeekMask: string;
  scheduleGroupIds: string[];
  isActive: boolean;
  sortOrder: number;
  details: ScheduleDetails;
  computedTime: string | null;
};

type Group = {
  id: string;
  name: string;
  hebrewName: string;
  color: string;
  active: boolean;
  sortOrder: number;
  isBuiltIn: boolean;
  scheduleCount: number;
};

const TYPES = ["shacharit", "mincha", "maariv", "other"] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const ROUND_OPTIONS = [1, 5, 10, 15];
const ZMAN_OPTIONS = [
  "ALOS",
  "MISHEYAKIR",
  "HANETZ",
  "SOF_ZMAN_SHMA",
  "SOF_ZMAN_TEFILLAH",
  "CHATZOS",
  "MINCHA_GEDOLAH",
  "MINCHA_KETANAH",
  "PLAG_HAMINCHA",
  "SHKIAH",
  "TZAIS",
  "CANDLE_LIGHTING",
  "HAVDALAH",
];
const VIS_CONDITIONS = [
  { value: "weekday", label: "Weekday" },
  { value: "shabbos", label: "Shabbos" },
  { value: "chol_hamoed", label: "Chol HaMoed" },
  { value: "yom_tov", label: "Yom Tov" },
  { value: "fast_day", label: "Fast" },
  { value: "erev_shabbos", label: "Erev Shabbos" },
  { value: "erev_chag", label: "Erev Chag" },
  { value: "erev_pesach", label: "Erev Pesach" },
  { value: "chanukah", label: "Chanukah" },
  { value: "behab", label: "BeHab" },
  { value: "rosh_chodesh", label: "Rosh Chodesh" },
  { value: "purim", label: "Purim" },
  { value: "dst_on", label: "DST on" },
  { value: "dst_off", label: "DST off" },
];

function rulesToTri(rules: ScheduleDetails["visibilityRules"] = []): Record<string, TriState> {
  const map: Record<string, TriState> = {};
  for (const rule of rules) map[rule.condition] = rule.show ? "show" : "hide";
  return map;
}

function triToRules(map: Record<string, TriState>) {
  return Object.entries(map)
    .filter(([, state]) => state !== "ignore")
    .map(([condition, state]) => ({ condition, show: state === "show" }));
}

function cycleTri(state: TriState): TriState {
  if (state === "ignore") return "show";
  if (state === "show") return "hide";
  return "ignore";
}

function triLabel(state: TriState): string {
  if (state === "show") return "✓";
  if (state === "hide") return "✗";
  return "—";
}

export function ScheduleWorkspace({
  orgId,
  orgName,
  orgSlug,
}: {
  orgId: string;
  orgName: string;
  orgSlug: string;
}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterGroupId, setFilterGroupId] = useState<string>("__all__");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"copy" | "move" | "delete" | "">("");
  const [bulkGroup, setBulkGroup] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupDraft, setGroupDraft] = useState({ name: "", hebrewName: "", color: "#3b82f6" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [sRes, gRes] = await Promise.all([
      fetch(`/api/org/${orgId}/schedules`),
      fetch(`/api/org/${orgId}/groups`),
    ]);
    if (!sRes.ok) throw new Error((await sRes.json().catch(() => null))?.error ?? "schedules failed");
    if (!gRes.ok) throw new Error((await gRes.json().catch(() => null))?.error ?? "groups failed");
    const sBody = (await sRes.json()) as { schedules: Schedule[] };
    const gBody = (await gRes.json()) as { groups: Group[] };
    setSchedules(sBody.schedules);
    setGroups(gBody.groups);
    setLoaded(true);
  }, [orgId]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Load failed");
    });
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...schedules].sort((a, b) => a.sortOrder - b.sortOrder);
    if (filterGroupId === "__none__") {
      list = list.filter((s) => s.scheduleGroupIds.length === 0);
    } else if (filterGroupId !== "__all__") {
      list = list.filter((s) => s.scheduleGroupIds.includes(filterGroupId));
    }
    return list;
  }, [schedules, filterGroupId]);

  const grouped = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const s of filtered) {
      const key = s.details.isPlaceholder ? "placeholder" : s.type || "other";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [filtered]);

  const typeOrder = ["shacharit", "mincha", "maariv", "other", "placeholder"];

  async function api(method: string, body?: unknown, query = "") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/schedules${query}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = (await res.json()) as { schedules?: Schedule[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      if (json.schedules) setSchedules(json.schedules);
      await refreshGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function refreshGroups() {
    const gRes = await fetch(`/api/org/${orgId}/groups`);
    if (gRes.ok) {
      const gBody = (await gRes.json()) as { groups: Group[] };
      setGroups(gBody.groups);
    }
  }

  async function groupApi(method: string, body?: unknown, query = "") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/groups${query}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = (await res.json()) as { groups?: Group[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      if (json.groups) setGroups(json.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Group request failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function moveRow(id: string, dir: -1 | 1) {
    const ordered = [...schedules].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = ordered.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const ids = ordered.map((s) => s.id);
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    await api("POST", { action: "reorder", ids });
  }

  async function applyBulk() {
    const ids = [...selected];
    if (!ids.length || !bulkAction) return;
    if (bulkAction === "delete") {
      await api("POST", { action: "bulk-delete", ids });
    } else {
      if (!bulkGroup) return;
      await api("POST", {
        action: bulkAction === "move" ? "bulk-move" : "bulk-copy",
        ids,
        groupId: bulkGroup === "__none__" ? null : bulkGroup,
      });
    }
    setSelected(new Set());
    setBulkAction("");
  }

  function patchLocal(id: string, patch: Partial<Schedule>) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function saveSchedule(schedule: Schedule) {
    await api("PUT", {
      id: schedule.id,
      name: schedule.name,
      hebrewName: schedule.hebrewName,
      type: schedule.type,
      baseZman: schedule.baseZman,
      fixedTime: schedule.fixedTime,
      offset: schedule.offset,
      earliest: schedule.earliest,
      latest: schedule.latest,
      roundTo: schedule.roundTo,
      room: schedule.room,
      dayOfWeekMask: schedule.dayOfWeekMask,
      scheduleGroupIds: schedule.scheduleGroupIds,
      isActive: schedule.isActive,
      sortOrder: schedule.sortOrder,
      details: schedule.details,
    });
  }

  if (!loaded && !error) {
    return <div className="sched-empty">Loading schedules…</div>;
  }

  return (
    <div className="sched-workspace">
      <header className="sched-header">
        <div>
          <p className="eyebrow">Schedules</p>
          <h1>{orgName}</h1>
          <p className="auth-copy">
            Compact group-aware workspace for {orgSlug}. One editor — no orphan form/list modules (F3).
          </p>
        </div>
        <div className="sched-headerActions">
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => void api("POST", { action: "create", type: "shacharit", fixedTime: "07:00", name: "New minyan", hebrewName: "מניין חדש" })}
          >
            Add schedule
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={busy}
            onClick={() =>
              void api("POST", {
                action: "create",
                type: "placeholder",
                name: "",
                hebrewName: "",
                fixedTime: null,
                details: { isPlaceholder: true, placeholderLabel: "---" },
              })
            }
          >
            Add spacer
          </button>
        </div>
      </header>

      {error && <div className="sched-error">{error}</div>}

      <div className="sched-layout">
        <aside className="sched-sidebar">
          <div className="sched-sideHead">
            <h2>Groups</h2>
            <button
              type="button"
              className="button button-secondary"
              disabled={busy}
              onClick={() => void groupApi("POST", { name: "Custom group", hebrewName: "קבוצה", color: "#72d8ad" })}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={filterGroupId === "__all__" ? "sched-groupActive" : "sched-groupBtn"}
            onClick={() => setFilterGroupId("__all__")}
          >
            All ({schedules.length})
          </button>
          <button
            type="button"
            className={filterGroupId === "__none__" ? "sched-groupActive" : "sched-groupBtn"}
            onClick={() => setFilterGroupId("__none__")}
          >
            Ungrouped
          </button>
          {groups.map((g) => (
            <div key={g.id} className="sched-groupRow">
              <button
                type="button"
                className={filterGroupId === g.id ? "sched-groupActive" : "sched-groupBtn"}
                onClick={() => setFilterGroupId(g.id)}
              >
                <span className="sched-dot" style={{ background: g.color }} />
                <span>
                  {g.name}
                  <small>
                    {g.hebrewName} · {g.scheduleCount}
                    {!g.active ? " · off" : ""}
                  </small>
                </span>
              </button>
              <button
                type="button"
                className="sched-iconBtn"
                onClick={() => {
                  setEditingGroupId(g.id);
                  setGroupDraft({ name: g.name, hebrewName: g.hebrewName, color: g.color });
                }}
              >
                ✎
              </button>
            </div>
          ))}

          {editingGroupId && (
            <div className="sched-groupEdit">
              <input
                value={groupDraft.name}
                onChange={(e) => setGroupDraft({ ...groupDraft, name: e.target.value })}
                placeholder="English"
              />
              <input
                value={groupDraft.hebrewName}
                onChange={(e) => setGroupDraft({ ...groupDraft, hebrewName: e.target.value })}
                placeholder="עברית"
                dir="rtl"
              />
              <input
                type="color"
                value={groupDraft.color}
                onChange={(e) => setGroupDraft({ ...groupDraft, color: e.target.value })}
              />
              <div className="sched-inlineActions">
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() =>
                    void groupApi("PUT", { id: editingGroupId, ...groupDraft }).then(() => setEditingGroupId(null))
                  }
                >
                  Save
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    const g = groups.find((x) => x.id === editingGroupId);
                    if (g) void groupApi("PUT", { id: g.id, active: !g.active });
                  }}
                >
                  Toggle active
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={busy || groups.find((g) => g.id === editingGroupId)?.isBuiltIn}
                  onClick={() =>
                    void groupApi("DELETE", undefined, `?id=${editingGroupId}`).then(() => setEditingGroupId(null))
                  }
                >
                  Delete
                </button>
                <button type="button" className="button button-secondary" onClick={() => setEditingGroupId(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </aside>

        <section className="sched-main">
          <div className="sched-bulk">
            <span>{selected.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value as typeof bulkAction)}>
              <option value="">Bulk…</option>
              <option value="move">Move to group</option>
              <option value="copy">Copy to group</option>
              <option value="delete">Delete</option>
            </select>
            {(bulkAction === "move" || bulkAction === "copy") && (
              <select value={bulkGroup} onChange={(e) => setBulkGroup(e.target.value)}>
                <option value="">Choose group</option>
                <option value="__none__">None</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="button button-secondary" disabled={busy || !bulkAction} onClick={() => void applyBulk()}>
              Apply
            </button>
          </div>

          {typeOrder
            .filter((t) => grouped[t]?.length)
            .map((type) => (
              <div key={type} className="sched-section">
                <h3>{type}</h3>
                {grouped[type].map((ev) => {
                  const open = expandedId === ev.id;
                  const isSpacer = Boolean(ev.details.isPlaceholder);
                  const tri = rulesToTri(ev.details.visibilityRules);
                  return (
                    <div key={ev.id} className={ev.isActive ? "sched-card" : "sched-card sched-cardOff"}>
                      <div className="sched-row">
                        <input type="checkbox" checked={selected.has(ev.id)} onChange={() => toggleSelect(ev.id)} />
                        <button type="button" className="sched-expand" onClick={() => setExpandedId(open ? null : ev.id)}>
                          {open ? "▾" : "▸"}
                        </button>
                        <div className="sched-rowMain" onClick={() => setExpandedId(open ? null : ev.id)}>
                          {isSpacer ? (
                            <em className="sched-spacer">{ev.details.placeholderLabel || "— spacer —"}</em>
                          ) : (
                            <>
                              <strong>{ev.name}</strong>
                              <span dir="rtl">{ev.hebrewName}</span>
                              <span className="sched-time" dir="ltr">
                                {ev.computedTime ??
                                  ev.fixedTime ??
                                  (ev.baseZman
                                    ? `${ev.baseZman}${ev.offset ? ` ${ev.offset > 0 ? "+" : ""}${ev.offset}` : ""}`
                                    : "—")}
                              </span>
                              {ev.room && <span className="sched-muted">{ev.room}</span>}
                            </>
                          )}
                          <span className="sched-days">
                            {DAYS.map((d, i) => (ev.dayOfWeekMask[i] === "1" ? d[0] : "·")).join("")}
                          </span>
                          <span className="sched-tags">
                            {ev.scheduleGroupIds.map((gid) => {
                              const g = groups.find((x) => x.id === gid);
                              return g ? (
                                <span key={gid} className="sched-tag" style={{ borderColor: g.color }}>
                                  {g.name}
                                </span>
                              ) : null;
                            })}
                          </span>
                        </div>
                        <label className="sched-active">
                          <input
                            type="checkbox"
                            checked={ev.isActive}
                            onChange={(e) => {
                              const next = { ...ev, isActive: e.target.checked };
                              patchLocal(ev.id, { isActive: e.target.checked });
                              void saveSchedule(next);
                            }}
                          />
                          on
                        </label>
                        <button type="button" className="sched-iconBtn" title="Up" onClick={() => void moveRow(ev.id, -1)}>
                          ↑
                        </button>
                        <button type="button" className="sched-iconBtn" title="Down" onClick={() => void moveRow(ev.id, 1)}>
                          ↓
                        </button>
                        <button
                          type="button"
                          className="sched-iconBtn"
                          title="Duplicate"
                          onClick={() => void api("POST", { action: "duplicate", id: ev.id })}
                        >
                          ⎘
                        </button>
                        <button
                          type="button"
                          className="sched-iconBtn"
                          title="Delete"
                          onClick={() => void api("DELETE", undefined, `?id=${ev.id}`)}
                        >
                          ⌫
                        </button>
                      </div>

                      {open && (
                        <div className="sched-editor">
                          {isSpacer ? (
                            <label>
                              Spacer label
                              <input
                                value={ev.details.placeholderLabel ?? ""}
                                onChange={(e) =>
                                  patchLocal(ev.id, {
                                    details: { ...ev.details, placeholderLabel: e.target.value },
                                  })
                                }
                              />
                            </label>
                          ) : (
                            <>
                              <div className="sched-editGrid">
                                <label>
                                  Name
                                  <input value={ev.name} onChange={(e) => patchLocal(ev.id, { name: e.target.value })} />
                                </label>
                                <label>
                                  Hebrew
                                  <input
                                    dir="rtl"
                                    value={ev.hebrewName}
                                    onChange={(e) => patchLocal(ev.id, { hebrewName: e.target.value })}
                                  />
                                </label>
                                <label>
                                  Type
                                  <select value={ev.type} onChange={(e) => patchLocal(ev.id, { type: e.target.value })}>
                                    {TYPES.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Room
                                  <input value={ev.room ?? ""} onChange={(e) => patchLocal(ev.id, { room: e.target.value || null })} />
                                </label>
                                <label>
                                  Groups
                                  <select
                                    multiple
                                    value={ev.scheduleGroupIds}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        scheduleGroupIds: [...e.target.selectedOptions].map((o) => o.value),
                                      })
                                    }
                                  >
                                    {groups.map((g) => (
                                      <option key={g.id} value={g.id}>
                                        {g.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Priority
                                  <input
                                    type="number"
                                    value={ev.details.priority ?? 0}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: { ...ev.details, priority: Number(e.target.value) || 0 },
                                      })
                                    }
                                  />
                                </label>
                              </div>

                              <div className="sched-editGrid">
                                <label>
                                  Time mode
                                  <select
                                    value={ev.baseZman ? "dynamic" : "fixed"}
                                    onChange={(e) => {
                                      if (e.target.value === "fixed") {
                                        patchLocal(ev.id, { fixedTime: ev.fixedTime || "07:00", baseZman: null });
                                      } else {
                                        patchLocal(ev.id, {
                                          fixedTime: null,
                                          baseZman: ev.baseZman || "MINCHA_GEDOLAH",
                                        });
                                      }
                                    }}
                                  >
                                    <option value="fixed">Fixed</option>
                                    <option value="dynamic">Computed</option>
                                  </select>
                                </label>
                                {!ev.baseZman ? (
                                  <label>
                                    Fixed time
                                    <input
                                      type="time"
                                      value={ev.fixedTime ?? ""}
                                      onChange={(e) =>
                                        patchLocal(ev.id, { fixedTime: e.target.value, baseZman: null })
                                      }
                                    />
                                  </label>
                                ) : (
                                  <>
                                    <label>
                                      Base zman
                                      <select
                                        value={ev.baseZman ?? ""}
                                        onChange={(e) => patchLocal(ev.id, { baseZman: e.target.value, fixedTime: null })}
                                      >
                                        {ZMAN_OPTIONS.map((z) => (
                                          <option key={z} value={z}>
                                            {z}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label>
                                      Offset (min)
                                      <input
                                        type="number"
                                        value={ev.offset}
                                        onChange={(e) => patchLocal(ev.id, { offset: Number(e.target.value) || 0 })}
                                      />
                                    </label>
                                  </>
                                )}
                                <label>
                                  Round to
                                  <select
                                    value={ev.roundTo}
                                    onChange={(e) => patchLocal(ev.id, { roundTo: Number(e.target.value) })}
                                  >
                                    {ROUND_OPTIONS.map((r) => (
                                      <option key={r} value={r}>
                                        {r}m
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Round mode
                                  <select
                                    value={ev.details.roundMode ?? "nearest"}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: {
                                          ...ev.details,
                                          roundMode: e.target.value as ScheduleDetails["roundMode"],
                                        },
                                      })
                                    }
                                  >
                                    <option value="nearest">Nearest</option>
                                    <option value="before">Before</option>
                                    <option value="after">After</option>
                                  </select>
                                </label>
                                <label>
                                  Earliest
                                  <input
                                    type="time"
                                    value={ev.earliest ?? ""}
                                    onChange={(e) => patchLocal(ev.id, { earliest: e.target.value || null })}
                                  />
                                </label>
                                <label>
                                  Latest
                                  <input
                                    type="time"
                                    value={ev.latest ?? ""}
                                    onChange={(e) => patchLocal(ev.id, { latest: e.target.value || null })}
                                  />
                                </label>
                              </div>

                              <div className="sched-editGrid">
                                <label>
                                  Refresh
                                  <select
                                    value={ev.details.refreshMode ?? "daily"}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: {
                                          ...ev.details,
                                          refreshMode: e.target.value as ScheduleDetails["refreshMode"],
                                        },
                                      })
                                    }
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                </label>
                                <label>
                                  Anchor day
                                  <input
                                    type="number"
                                    min={0}
                                    max={6}
                                    value={ev.details.refreshAnchorDay ?? 0}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: {
                                          ...ev.details,
                                          refreshAnchorDay: Number(e.target.value) || 0,
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label>
                                  Duration (min)
                                  <input
                                    type="number"
                                    value={ev.details.durationMinutes ?? ""}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: {
                                          ...ev.details,
                                          durationMinutes: e.target.value ? Number(e.target.value) : undefined,
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label>
                                  Display offset
                                  <input
                                    type="number"
                                    value={ev.details.displayOffset ?? 0}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: {
                                          ...ev.details,
                                          displayOffset: Number(e.target.value) || 0,
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label className="sched-check">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(ev.details.hideIfMinMaxReached)}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: { ...ev.details, hideIfMinMaxReached: e.target.checked },
                                      })
                                    }
                                  />
                                  Hide if min/max reached
                                </label>
                                <label className="sched-check">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(ev.details.nearestEvent)}
                                    onChange={(e) =>
                                      patchLocal(ev.id, {
                                        details: { ...ev.details, nearestEvent: e.target.checked },
                                      })
                                    }
                                  />
                                  Nearest-event window
                                </label>
                                {ev.details.nearestEvent && (
                                  <>
                                    <label>
                                      Before
                                      <input
                                        type="number"
                                        value={ev.details.nearestBefore ?? 10}
                                        onChange={(e) =>
                                          patchLocal(ev.id, {
                                            details: {
                                              ...ev.details,
                                              nearestBefore: Number(e.target.value) || 0,
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                    <label>
                                      After
                                      <input
                                        type="number"
                                        value={ev.details.nearestAfter ?? 5}
                                        onChange={(e) =>
                                          patchLocal(ev.id, {
                                            details: {
                                              ...ev.details,
                                              nearestAfter: Number(e.target.value) || 0,
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                  </>
                                )}
                              </div>

                              <div className="sched-daysEdit">
                                <span>Days</span>
                                {DAYS.map((d, i) => (
                                  <label key={d} className="sched-check">
                                    <input
                                      type="checkbox"
                                      checked={ev.dayOfWeekMask[i] === "1"}
                                      onChange={(e) => {
                                        const chars = ev.dayOfWeekMask.split("");
                                        chars[i] = e.target.checked ? "1" : "0";
                                        patchLocal(ev.id, { dayOfWeekMask: chars.join("") });
                                      }}
                                    />
                                    {d}
                                  </label>
                                ))}
                              </div>

                              <div className="sched-vis">
                                <span>Visibility (— / ✓ / ✗)</span>
                                <div className="sched-visGrid">
                                  {VIS_CONDITIONS.map((vc) => {
                                    const state = tri[vc.value] ?? "ignore";
                                    return (
                                      <button
                                        key={vc.value}
                                        type="button"
                                        className={`sched-tri sched-tri-${state}`}
                                        title={vc.label}
                                        onClick={() => {
                                          const next = { ...tri, [vc.value]: cycleTri(state) };
                                          patchLocal(ev.id, {
                                            details: {
                                              ...ev.details,
                                              visibilityRules: triToRules(next),
                                            },
                                          });
                                        }}
                                      >
                                        <small>{vc.label}</small>
                                        <strong>{triLabel(state)}</strong>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="sched-inlineActions">
                            <button type="button" className="button" disabled={busy} onClick={() => void saveSchedule(ev)}>
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

          {filtered.length === 0 && <div className="sched-empty">No schedules in this filter.</div>}
        </section>
      </div>
    </div>
  );
}
