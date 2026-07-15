"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";

type NoteRow = {
  id: string;
  hebrewMonth: number;
  hebrewDay: number;
  noteHebrew: string;
  noteEnglish: string | null;
  category: string;
  isBaseline?: boolean;
  isHidden?: boolean;
  baselineId?: string | null;
  _source?: string;
};

/** P5.6 / F-DB3 — hybrid daily notes: baseline (C6) + org add/override/hide. */
export function NotesPanel({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [merged, setMerged] = useState<NoteRow[]>([]);
  const [baseline, setBaseline] = useState<NoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ hebrewMonth: 7, hebrewDay: 1, noteHebrew: "", noteEnglish: "", category: "minhag" });

  const load = useCallback(async () => {
    const res = await fetch(`/api/org/${orgId}/notes`);
    if (!res.ok) {
      setError("Could not load notes.");
      return;
    }
    const data = (await res.json()) as { merged: NoteRow[]; baseline: NoteRow[] };
    setMerged(data.merged);
    setBaseline(data.baseline);
    setError(null);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addOrgNote() {
    const res = await fetch(`/api/org/${orgId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "add", ...form }),
    });
    if (!res.ok) {
      setError(((await res.json()) as { error?: string }).error ?? "Failed");
      return;
    }
    setForm({ ...form, noteHebrew: "", noteEnglish: "" });
    await load();
  }

  async function hideBaseline(b: NoteRow) {
    await fetch(`/api/org/${orgId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "hide",
        baselineId: b.id,
        hebrewMonth: b.hebrewMonth,
        hebrewDay: b.hebrewDay,
      }),
    });
    await load();
  }

  async function overrideBaseline(b: NoteRow) {
    const text = prompt("Override English text", b.noteEnglish ?? "");
    if (text == null) return;
    await fetch(`/api/org/${orgId}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "override",
        baselineId: b.id,
        hebrewMonth: b.hebrewMonth,
        hebrewDay: b.hebrewDay,
        noteHebrew: b.noteHebrew,
        noteEnglish: text,
        category: b.category,
      }),
    });
    await load();
  }

  return (
    <div>
      <header style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <Link href={`/admin/${orgSlug}/content`} style={{ color: "var(--admin-muted)" }}>
          ← Content
        </Link>
        <h1 style={{ margin: 0, flex: 1 }}>Daily notes</h1>
      </header>
      <p style={{ color: "var(--admin-muted)", maxWidth: 640 }}>
        Global baseline is seeded from Tukachinsky Luach (C6). This shul can add notes, override a baseline entry, or hide one.
        Baseline count: {baseline.length}.
      </p>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <section style={{ ...card, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 15 }}>Add shul note</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={lab}>
            Month
            <input
              type="number"
              value={form.hebrewMonth}
              onChange={(e) => setForm({ ...form, hebrewMonth: Number(e.target.value) })}
              style={input}
            />
          </label>
          <label style={lab}>
            Day
            <input
              type="number"
              value={form.hebrewDay}
              onChange={(e) => setForm({ ...form, hebrewDay: Number(e.target.value) })}
              style={input}
            />
          </label>
          <label style={{ ...lab, gridColumn: "1 / -1" }}>
            Hebrew
            <input value={form.noteHebrew} onChange={(e) => setForm({ ...form, noteHebrew: e.target.value })} style={input} />
          </label>
          <label style={{ ...lab, gridColumn: "1 / -1" }}>
            English
            <input value={form.noteEnglish} onChange={(e) => setForm({ ...form, noteEnglish: e.target.value })} style={input} />
          </label>
        </div>
        <button type="button" style={{ ...btn, marginTop: 10 }} onClick={() => void addOrgNote()}>
          Add
        </button>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, fontSize: 15 }}>Merged view ({merged.length})</h2>
        {merged.slice(0, 80).map((n) => (
          <div
            key={`${n.id}-${n._source}`}
            style={{ padding: "8px 0", borderBottom: "1px solid var(--admin-border)", fontSize: 13 }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <strong>
                {n.hebrewMonth}-{n.hebrewDay}
              </strong>
              <span style={{ color: "var(--admin-muted)" }}>{n._source}</span>
              <span style={{ color: "var(--admin-muted)" }}>{n.category}</span>
              {n._source === "baseline" ? (
                <>
                  <button type="button" style={tiny} onClick={() => void overrideBaseline(n)}>
                    Override
                  </button>
                  <button type="button" style={tiny} onClick={() => void hideBaseline(n)}>
                    Hide
                  </button>
                </>
              ) : null}
            </div>
            <div>{n.noteEnglish || n.noteHebrew}</div>
          </div>
        ))}
        {merged.length > 80 ? (
          <p style={{ color: "var(--admin-muted)", fontSize: 12 }}>Showing first 80 of {merged.length}.</p>
        ) : null}
      </section>
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
const lab: CSSProperties = { fontSize: 12 };
const btn: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  background: "var(--admin-accent)",
  color: "var(--admin-accent-text)",
  fontWeight: 700,
  cursor: "pointer",
};
const tiny: CSSProperties = {
  padding: "2px 6px",
  fontSize: 11,
  borderRadius: 4,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-text)",
  cursor: "pointer",
};
