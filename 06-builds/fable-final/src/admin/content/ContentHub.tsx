"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { ScheduleRule } from "@/core/scheduler";
import { ScheduleRuleEditor } from "@/admin/schedules/ScheduleRuleEditor";

type Tab = "announcements" | "memorials" | "sponsors" | "media";

const RELATIONSHIPS = [
  "father",
  "mother",
  "grandfather",
  "grandmother",
  "son",
  "daughter",
  "brother",
  "sister",
  "spouse",
  "other",
];

/** P5 Content Hub — announcements / yahrzeits (F5 relationship) / sponsors / media. */
export function ContentHub({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [tab, setTab] = useState<Tab>("announcements");
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Record<string, unknown>[]>([]);
  const [memorials, setMemorials] = useState<Record<string, unknown>[]>([]);
  const [sponsors, setSponsors] = useState<Record<string, unknown>[]>([]);
  const [mediaRows, setMediaRows] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [showForm, setShowForm] = useState(false);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [combineMode, setCombineMode] = useState<"all" | "any">("any");

  const load = useCallback(async () => {
    setError(null);
    const [a, m, s, med] = await Promise.all([
      fetch(`/api/org/${orgId}/announcements`),
      fetch(`/api/org/${orgId}/memorials`),
      fetch(`/api/org/${orgId}/sponsors`),
      fetch(`/api/org/${orgId}/media`),
    ]);
    if (!a.ok || !m.ok || !s.ok || !med.ok) {
      setError("Could not load content.");
      return;
    }
    setAnnouncements(((await a.json()) as { announcements: Record<string, unknown>[] }).announcements);
    setMemorials(((await m.json()) as { memorials: Record<string, unknown>[] }).memorials);
    setSponsors(((await s.json()) as { sponsors: Record<string, unknown>[] }).sponsors);
    setMediaRows(((await med.json()) as { media: Record<string, unknown>[] }).media);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMemorials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return memorials;
    return memorials.filter((row) =>
      [row.hebrewName, row.englishName, row.relationship, row.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [memorials, search]);

  function openCreate() {
    setEditing(null);
    setRules([]);
    setCombineMode("any");
    if (tab === "announcements") {
      setForm({ title: "", titleHebrew: "", content: "", contentHebrew: "", priority: 0, isActive: true, startDate: "", endDate: "" });
    } else if (tab === "memorials") {
      setForm({
        hebrewName: "",
        englishName: "",
        hebrewFamilyName: "",
        hebrewBenBat: "",
        relationship: "father",
        donorInfo: "",
        hebrewMonth: 1,
        hebrewDay: 1,
        hebrewAdar: 0,
        hebrewYear: "",
        isYahrzeit: true,
        notes: "",
        isActive: true,
      });
    } else if (tab === "sponsors") {
      setForm({
        type: "kiddush",
        sponsorName: "",
        englishText: "",
        hebrewText: "",
        hebrewDate: "",
        civilDate: "",
        isRecurring: false,
        isActive: true,
      });
    } else {
      setForm({ originalName: "", filePath: "", mimeType: "image/svg+xml", isActive: true });
    }
    setShowForm(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    setForm({ ...row });
    const sr = (row.scheduleRules as ScheduleRule[] | null) ?? [];
    setRules(sr);
    setCombineMode("any");
    setShowForm(true);
  }

  async function save() {
    const payload = { ...form, scheduleRules: rules.length ? rules : null };
    if (tab === "announcements") {
      const url = editing
        ? `/api/org/${orgId}/announcements/${editing.id}`
        : `/api/org/${orgId}/announcements`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          priority: Number(form.priority) || 0,
        }),
      });
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? "Save failed");
        return;
      }
    } else if (tab === "memorials") {
      const url = editing
        ? `/api/org/${orgId}/memorials/${editing.id}`
        : `/api/org/${orgId}/memorials`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          hebrewMonth: Number(form.hebrewMonth),
          hebrewDay: Number(form.hebrewDay),
          hebrewAdar: Number(form.hebrewAdar) || 0,
          hebrewYear: form.hebrewYear === "" || form.hebrewYear == null ? null : Number(form.hebrewYear),
          relationship: form.relationship || null,
        }),
      });
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? "Save failed");
        return;
      }
    } else if (tab === "sponsors") {
      const url = editing ? `/api/org/${orgId}/sponsors/${editing.id}` : `/api/org/${orgId}/sponsors`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          civilDate: form.civilDate || null,
          hebrewDate: form.hebrewDate || null,
        }),
      });
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? "Save failed");
        return;
      }
    } else if (tab === "media") {
      if (editing) {
        const res = await fetch(`/api/org/${orgId}/media/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            originalName: form.originalName,
            isActive: form.isActive,
            scheduleRules: rules.length ? rules : null,
          }),
        });
        if (!res.ok) {
          setError(((await res.json()) as { error?: string }).error ?? "Save failed");
          return;
        }
      } else {
        const name = String(form.originalName || "upload.svg");
        const path =
          String(form.filePath || "") ||
          "data:image/svg+xml;utf8," +
            encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'><rect width='100%' height='100%' fill='#1e3a8a'/><text x='50%' y='50%' fill='white' font-size='28' text-anchor='middle' dominant-baseline='middle'>${name}</text></svg>`,
            );
        const res = await fetch(`/api/org/${orgId}/media`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            originalName: name,
            filename: name,
            mimeType: form.mimeType || "image/svg+xml",
            filePath: path,
            scheduleRules: rules.length ? rules : null,
            isActive: form.isActive ?? true,
          }),
        });
        if (!res.ok) {
          setError(((await res.json()) as { error?: string }).error ?? "Save failed");
          return;
        }
      }
    }
    setShowForm(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const path =
      tab === "announcements"
        ? `/api/org/${orgId}/announcements/${id}`
        : tab === "memorials"
          ? `/api/org/${orgId}/memorials/${id}`
          : tab === "sponsors"
            ? `/api/org/${orgId}/sponsors/${id}`
            : `/api/org/${orgId}/media/${id}`;
    await fetch(path, { method: "DELETE" });
    await load();
  }

  async function moveMedia(id: string, dir: -1 | 1) {
    const ids = mediaRows.map((r) => String(r.id));
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = ids.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    await fetch(`/api/org/${orgId}/media/ordering`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderedIds: next }),
    });
    await load();
  }

  async function reorderAnnouncements(id: string, dir: -1 | 1) {
    const ids = announcements.map((r) => String(r.id));
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = ids.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    await fetch(`/api/org/${orgId}/announcements`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderedIds: next }),
    });
    await load();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "announcements", label: "Announcements" },
    { id: "memorials", label: "Yahrzeits" },
    { id: "sponsors", label: "Sponsors" },
    { id: "media", label: "Media" },
  ];

  return (
    <div>
      <header style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <h1 style={{ margin: 0, flex: 1 }}>Content</h1>
        <Link href={`/admin/${orgSlug}/content/notes`} style={linkBtn}>
          Daily notes
        </Link>
        <button type="button" style={btnPrimary} onClick={openCreate}>
          Add
        </button>
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setShowForm(false);
            }}
            style={{
              ...btn,
              background: tab === t.id ? "var(--admin-accent)" : "var(--admin-surface)",
              color: tab === t.id ? "var(--admin-accent-text)" : "var(--admin-text)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      {tab === "memorials" ? (
        <input
          placeholder="Search yahrzeits…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...input, marginBottom: 12, maxWidth: 320 }}
        />
      ) : null}

      <section style={card}>
        {tab === "announcements" &&
          announcements.map((row) => (
            <Row
              key={String(row.id)}
              title={String(row.title)}
              meta={`priority ${row.priority}${row.isActive ? "" : " · inactive"}`}
              onEdit={() => openEdit(row)}
              onDelete={() => void remove(String(row.id))}
              extra={
                <>
                  <button type="button" style={tiny} onClick={() => void reorderAnnouncements(String(row.id), -1)}>
                    ↑
                  </button>
                  <button type="button" style={tiny} onClick={() => void reorderAnnouncements(String(row.id), 1)}>
                    ↓
                  </button>
                </>
              }
            />
          ))}

        {tab === "memorials" &&
          filteredMemorials.map((row) => (
            <Row
              key={String(row.id)}
              title={`${row.hebrewName}${row.englishName ? ` / ${row.englishName}` : ""}`}
              meta={`${row.relationship ?? "—"} · ${row.hebrewMonth}-${row.hebrewDay}${row.isActive ? "" : " · inactive"}`}
              onEdit={() => openEdit(row)}
              onDelete={() => void remove(String(row.id))}
            />
          ))}

        {tab === "sponsors" &&
          sponsors.map((row) => (
            <Row
              key={String(row.id)}
              title={String(row.sponsorName)}
              meta={`${row.type}${row.isRecurring ? " · recurring" : ""}${row.isActive ? "" : " · inactive"}`}
              onEdit={() => openEdit(row)}
              onDelete={() => void remove(String(row.id))}
            />
          ))}

        {tab === "media" &&
          mediaRows.map((row) => (
            <Row
              key={String(row.id)}
              title={String(row.originalName)}
              meta={`${row.mimeType}${row.isActive ? "" : " · inactive"}`}
              onEdit={() => openEdit(row)}
              onDelete={() => void remove(String(row.id))}
              extra={
                <>
                  <button type="button" style={tiny} onClick={() => void moveMedia(String(row.id), -1)}>
                    ↑
                  </button>
                  <button type="button" style={tiny} onClick={() => void moveMedia(String(row.id), 1)}>
                    ↓
                  </button>
                  {String(row.filePath).startsWith("data:image") ? (
                    // Thumbnail preview for data-URL media
                    // eslint-disable-next-line @next/next/no-img-element -- data URL thumbnails
                    <img src={String(row.filePath)} alt="" width={48} height={32} style={{ objectFit: "cover", borderRadius: 4 }} />
                  ) : null}
                </>
              }
            />
          ))}

        {tab === "announcements" && !announcements.length ? <Empty /> : null}
        {tab === "memorials" && !filteredMemorials.length ? <Empty /> : null}
        {tab === "sponsors" && !sponsors.length ? <Empty /> : null}
        {tab === "media" && !mediaRows.length ? <Empty /> : null}
      </section>

      {showForm ? (
        <div style={{ ...card, marginTop: 16, maxWidth: 640 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <strong>{editing ? "Edit" : "New"} {tab}</strong>
            <button type="button" style={btn} onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>

          {tab === "announcements" ? (
            <Grid>
              <Field label="Title" value={String(form.title ?? "")} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Title HE" value={String(form.titleHebrew ?? "")} onChange={(v) => setForm({ ...form, titleHebrew: v })} />
              <Field label="Content" value={String(form.content ?? "")} onChange={(v) => setForm({ ...form, content: v })} wide />
              <Field label="Content HE" value={String(form.contentHebrew ?? "")} onChange={(v) => setForm({ ...form, contentHebrew: v })} wide />
              <Field label="Priority" value={String(form.priority ?? 0)} onChange={(v) => setForm({ ...form, priority: Number(v) || 0 })} />
              <Field label="Start date" value={String(form.startDate ?? "")} onChange={(v) => setForm({ ...form, startDate: v })} />
              <Field label="End date" value={String(form.endDate ?? "")} onChange={(v) => setForm({ ...form, endDate: v })} />
              <Check label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
            </Grid>
          ) : null}

          {tab === "memorials" ? (
            <Grid>
              <Field label="Hebrew name" value={String(form.hebrewName ?? "")} onChange={(v) => setForm({ ...form, hebrewName: v })} />
              <Field label="English name" value={String(form.englishName ?? "")} onChange={(v) => setForm({ ...form, englishName: v })} />
              <Field label="Family name HE" value={String(form.hebrewFamilyName ?? "")} onChange={(v) => setForm({ ...form, hebrewFamilyName: v })} />
              <Field label="Ben/Bat" value={String(form.hebrewBenBat ?? "")} onChange={(v) => setForm({ ...form, hebrewBenBat: v })} />
              <label style={lab}>
                Relationship (F5)
                <select
                  value={String(form.relationship ?? "")}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  style={input}
                  data-testid="relationship"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Donor info" value={String(form.donorInfo ?? "")} onChange={(v) => setForm({ ...form, donorInfo: v })} />
              <Field label="Hebrew month" value={String(form.hebrewMonth ?? 1)} onChange={(v) => setForm({ ...form, hebrewMonth: Number(v) })} />
              <Field label="Hebrew day" value={String(form.hebrewDay ?? 1)} onChange={(v) => setForm({ ...form, hebrewDay: Number(v) })} />
              <Field label="Hebrew year" value={String(form.hebrewYear ?? "")} onChange={(v) => setForm({ ...form, hebrewYear: v })} />
              <Field label="Adar (0/1/2)" value={String(form.hebrewAdar ?? 0)} onChange={(v) => setForm({ ...form, hebrewAdar: Number(v) })} />
              <Field label="Notes" value={String(form.notes ?? "")} onChange={(v) => setForm({ ...form, notes: v })} wide />
              <Check label="Yahrzeit" checked={Boolean(form.isYahrzeit)} onChange={(v) => setForm({ ...form, isYahrzeit: v })} />
              <Check label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
            </Grid>
          ) : null}

          {tab === "sponsors" ? (
            <Grid>
              <label style={lab}>
                Type
                <select value={String(form.type ?? "kiddush")} onChange={(e) => setForm({ ...form, type: e.target.value })} style={input}>
                  <option value="kiddush">kiddush</option>
                  <option value="seuda">seuda</option>
                  <option value="torah">torah</option>
                  <option value="general">general</option>
                </select>
              </label>
              <Field label="Sponsor name" value={String(form.sponsorName ?? "")} onChange={(v) => setForm({ ...form, sponsorName: v })} />
              <Field label="English text" value={String(form.englishText ?? "")} onChange={(v) => setForm({ ...form, englishText: v })} wide />
              <Field label="Hebrew text" value={String(form.hebrewText ?? "")} onChange={(v) => setForm({ ...form, hebrewText: v })} wide />
              <Field label="Hebrew date (M-D)" value={String(form.hebrewDate ?? "")} onChange={(v) => setForm({ ...form, hebrewDate: v })} />
              <Field label="Civil date (ISO)" value={String(form.civilDate ?? "")} onChange={(v) => setForm({ ...form, civilDate: v })} />
              <Check label="Recurring" checked={Boolean(form.isRecurring)} onChange={(v) => setForm({ ...form, isRecurring: v })} />
              <Check label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
            </Grid>
          ) : null}

          {tab === "media" ? (
            <Grid>
              <Field label="Original name" value={String(form.originalName ?? "")} onChange={(v) => setForm({ ...form, originalName: v })} />
              <Field
                label="File path / data URL (optional — blank = generated SVG)"
                value={String(form.filePath ?? "")}
                onChange={(v) => setForm({ ...form, filePath: v })}
                wide
              />
              <Check label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
            </Grid>
          ) : null}

          {/* P5.5 visibility/scheduling — shared ScheduleRuleEditor (F4) */}
          {(tab === "announcements" || tab === "media") && (
            <div style={{ marginTop: 12 }}>
              <ScheduleRuleEditor
                rules={rules}
                combineMode={combineMode}
                onChange={({ rules: r, combineMode: c }) => {
                  setRules(r);
                  setCombineMode(c);
                }}
              />
            </div>
          )}

          <button type="button" style={{ ...btnPrimary, marginTop: 14 }} onClick={() => void save()}>
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  title,
  meta,
  onEdit,
  onDelete,
  extra,
}: {
  title: string;
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
  extra?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        padding: "10px 0",
        borderBottom: "1px solid var(--admin-border)",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>{meta}</div>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {extra}
        <button type="button" style={tiny} onClick={onEdit}>
          Edit
        </button>
        <button type="button" style={tiny} onClick={onDelete}>
          Del
        </button>
      </div>
    </div>
  );
}

function Empty() {
  return <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: 13 }}>No items yet.</p>;
}

function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <label style={{ ...lab, gridColumn: wide ? "1 / -1" : undefined }}>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} style={input} />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ ...lab, display: "flex", gap: 8, alignItems: "center" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
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
const btnPrimary: CSSProperties = { ...btn, background: "var(--admin-accent)", color: "var(--admin-accent-text)", fontWeight: 700 };
const tiny: CSSProperties = { ...btn, padding: "4px 7px", fontSize: 11 };
const linkBtn: CSSProperties = { ...btn, textDecoration: "none", display: "inline-block" };
