"use client";

import { useState } from "react";
import { btn, btnAccent, card, field, input, tabBtn } from "@/admin/formStyles";

const ENTITIES = [
  { key: "minyanim", label: "Minyan times" },
  { key: "groups", label: "Schedule groups" },
  { key: "announcements", label: "Announcements" },
  { key: "memorials", label: "Memorials / yahrzeits" },
  { key: "sponsors", label: "Sponsors" },
  { key: "media", label: "Media" },
] as const;

type Preview = {
  total: number;
  columns: string[];
  sample: Record<string, string>[];
  errors: string[];
};

/** P10 Import/Export hub (E19, F9, F10, F-DUP-CSV, F-SCREENSHOT). */
export function ImportExportHub({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const exportUrl = (params: Record<string, string>) =>
    `/api/org/${orgId}/export?${new URLSearchParams(params).toString()}`;

  const [weeks, setWeeks] = useState(4);
  const [basis, setBasis] = useState<"sunday" | "shabbos">("sunday");
  const [namesSide, setNamesSide] = useState<"left" | "right">("left");

  const [type, setType] = useState<string>("minyanim");
  const [format, setFormat] = useState<string>("csv");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [groupsText, setGroupsText] = useState("");
  const [eventsText, setEventsText] = useState("");
  const [bzsText, setBzsText] = useState("");
  const [tab, setTab] = useState<"main" | "groups-events" | "beezee">("main");

  async function readFile(file: File | undefined, set: (t: string) => void) {
    if (!file) return;
    set(await file.text());
  }

  async function runPreview() {
    setBusy(true);
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview", type, format, text }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Preview failed");
      setPreview(null);
      return;
    }
    setPreview(data as Preview);
  }

  async function runImport() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "commit", type, format, text, mode }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setMsg(`Imported ${data.inserted} row(s)${data.replaced ? " (replaced)" : ""}.`);
    setText("");
    setPreview(null);
  }

  async function restoreBackup(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", text: await file.text() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Restore failed");
      return;
    }
    const total = Object.values(data.outcome as Record<string, number>).reduce((a, b) => a + b, 0);
    setMsg(`Restored ${total} rows from backup.`);
  }

  async function previewGroupsEvents() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "preview",
        type: "groups-events",
        format: "csv",
        groupsText,
        eventsText,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Preview failed");
      return;
    }
    setPreview({
      total: data.total,
      columns: data.columns,
      sample: [...(data.sample?.groups ?? []), ...(data.sample?.events ?? [])],
      errors: data.errors ?? [],
    });
  }

  async function commitGroupsEvents() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "commit",
        type: "groups-events",
        format: "csv",
        groupsText,
        eventsText,
        mode,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setMsg(`Groups ${data.groups}, events ${data.events}${data.replaced ? " (replaced)" : ""}.`);
    setPreview(null);
  }

  async function importBzs() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "beezee", text: bzsText, mode }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "BZS import failed");
      return;
    }
    setMsg(`BeeZee: ${data.zmanimWritten} zmanim configs, ${data.minyanimWritten} minyanim (defs=${data.defs}, toladot=${data.toladot}).`);
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Import / Export</h1>
      <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>Org: {orgSlug}</p>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}
      {msg ? <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>{msg}</p> : null}

      <div style={card}>
        <strong>Export (P10.2)</strong>
        {ENTITIES.map((e) => (
          <div key={e.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--admin-border)" }}>
            <span style={{ fontSize: 13 }}>{e.label}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <a href={exportUrl({ type: e.key, format: "csv" })} style={btn}>
                CSV
              </a>
              <a href={exportUrl({ type: e.key, format: "json" })} style={btn}>
                JSON
              </a>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <a href={exportUrl({ type: "backup" })} style={btnAccent}>
            Full backup (JSON)
          </a>
          <a href={exportUrl({ type: "ics" })} style={btn}>
            Calendar (.ics)
          </a>
          <a href={exportUrl({ type: "screenshot", format: "svg" })} style={btn}>
            Board SVG (P10.4)
          </a>
          <a href={exportUrl({ type: "screenshot", format: "html" })} style={btn} target="_blank" rel="noreferrer">
            Board print HTML
          </a>
        </div>
      </div>

      <div style={card}>
        <strong>Luach — multi-week (P10.3 / F10)</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, alignItems: "end" }}>
          <label style={field}>
            Weeks (1–52)
            <input style={input} type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(Math.min(52, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
          <label style={field}>
            Week basis
            <select style={input} value={basis} onChange={(e) => setBasis(e.target.value as "sunday" | "shabbos")}>
              <option value="sunday">Sunday</option>
              <option value="shabbos">Shabbos (Fri)</option>
            </select>
          </label>
          <label style={field}>
            Name order
            <select style={input} value={namesSide} onChange={(e) => setNamesSide(e.target.value as "left" | "right")}>
              <option value="left">HE / EN</option>
              <option value="right">EN / HE</option>
            </select>
          </label>
          <a
            href={exportUrl({ type: "zmanim", format: "html", weeks: String(weeks), basis })}
            style={btnAccent}
            target="_blank"
            rel="noreferrer"
          >
            Print / PDF (HTML)
          </a>
          <a href={exportUrl({ type: "zmanim", format: "csv", weeks: String(weeks), basis, names: namesSide })} style={btn}>
            Weekly CSV
          </a>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button type="button" style={tabBtn(tab === "main")} onClick={() => setTab("main")}>
          Import
        </button>
        <button type="button" style={tabBtn(tab === "groups-events")} onClick={() => setTab("groups-events")}>
          Groups + Events
        </button>
        <button type="button" style={tabBtn(tab === "beezee")} onClick={() => setTab("beezee")}>
          BeeZee (.bzs)
        </button>
      </div>

      {tab === "main" ? (
        <div style={card}>
          <strong>Import (P10.1 / P10.6)</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <label style={field}>
              Type
              <select style={input} value={type} onChange={(e) => { setType(e.target.value); setPreview(null); }}>
                {ENTITIES.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
                <option value="ics">ICS → announcements</option>
              </select>
            </label>
            <label style={field}>
              Format
              <select style={input} value={format} onChange={(e) => { setFormat(e.target.value); setPreview(null); }}>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="ics">ICS</option>
              </select>
            </label>
            <a href={exportUrl({ type: "sample", entity: type === "ics" ? "announcements" : type, format: format === "ics" ? "csv" : format })} style={btn}>
              Sample file
            </a>
          </div>
          <label style={field}>
            Paste data
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setPreview(null); }}
              rows={7}
              style={{ ...input, fontFamily: "monospace", fontSize: 12 }}
              spellCheck={false}
            />
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label style={{ ...btn, cursor: "pointer" }}>
              Choose file
              <input type="file" accept=".csv,.json,.ics,text/csv,application/json,text/calendar" style={{ display: "none" }} onChange={(e) => void readFile(e.target.files?.[0], (t) => { setText(t); setPreview(null); })} />
            </label>
            <button type="button" style={btn} disabled={busy} onClick={() => void runPreview()}>
              Preview
            </button>
          </div>
          {preview ? (
            <div style={{ marginTop: 12, border: "1px solid var(--admin-border)", borderRadius: 8, padding: 10 }}>
              <p style={{ fontSize: 13 }}>
                {preview.total} row(s). {preview.errors.length ? <span style={{ color: "var(--admin-danger)" }}>{preview.errors.length} problem(s).</span> : null}
              </p>
              {preview.errors.length > 0 ? (
                <ul style={{ fontSize: 12, color: "var(--admin-danger)", maxHeight: 120, overflow: "auto" }}>
                  {preview.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : null}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <select style={input} value={mode} onChange={(e) => setMode(e.target.value as "append" | "replace")}>
                  <option value="append">Add to existing</option>
                  <option value="replace">Replace all existing</option>
                </select>
                <button type="button" style={btnAccent} disabled={busy || preview.errors.length > 0} onClick={() => void runImport()}>
                  Import
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "groups-events" ? (
        <div style={card}>
          <strong>Groups + Events CSV (P10.5)</strong>
          <p style={{ fontSize: 12, color: "var(--admin-muted)" }}>Two files, UTF-8 BOM samples, preview, append/replace.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <a href={exportUrl({ type: "sample", entity: "groups", format: "csv" })} style={btn}>
              Sample groups.csv
            </a>
            <a href={exportUrl({ type: "sample", entity: "minyanim", format: "csv" })} style={btn}>
              Sample events.csv
            </a>
          </div>
          <label style={field}>
            Groups CSV
            <textarea value={groupsText} onChange={(e) => setGroupsText(e.target.value)} rows={4} style={{ ...input, fontFamily: "monospace", fontSize: 12 }} />
          </label>
          <label style={field}>
            Events (minyanim) CSV
            <textarea value={eventsText} onChange={(e) => setEventsText(e.target.value)} rows={4} style={{ ...input, fontFamily: "monospace", fontSize: 12 }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={btn} disabled={busy} onClick={() => void previewGroupsEvents()}>
              Preview
            </button>
            <select style={input} value={mode} onChange={(e) => setMode(e.target.value as "append" | "replace")}>
              <option value="append">Append</option>
              <option value="replace">Replace</option>
            </select>
            <button type="button" style={btnAccent} disabled={busy || (preview?.errors.length ?? 0) > 0} onClick={() => void commitGroupsEvents()}>
              Import both
            </button>
          </div>
          {preview && tab === "groups-events" ? (
            <p style={{ fontSize: 13, marginTop: 8 }}>
              {preview.total} rows · {preview.errors.length} errors
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "beezee" ? (
        <div style={card}>
          <strong>BeeZee import (F9)</strong>
          <p style={{ fontSize: 12, color: "var(--admin-muted)" }}>Paste full .bzs content (parsed + applied — not filename-only).</p>
          <textarea value={bzsText} onChange={(e) => setBzsText(e.target.value)} rows={6} style={{ ...input, fontFamily: "monospace", fontSize: 12, width: "100%" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <label style={{ ...btn, cursor: "pointer" }}>
              Choose .bzs
              <input type="file" accept=".bzs,.txt,text/plain" style={{ display: "none" }} onChange={(e) => void readFile(e.target.files?.[0], setBzsText)} />
            </label>
            <select style={input} value={mode} onChange={(e) => setMode(e.target.value as "append" | "replace")}>
              <option value="append">Append / upsert zmanim</option>
              <option value="replace">Replace zmanim + minyanim</option>
            </select>
            <button type="button" style={btnAccent} disabled={busy || !bzsText.trim()} onClick={() => void importBzs()}>
              Parse &amp; apply
            </button>
          </div>
        </div>
      ) : null}

      <div style={card}>
        <strong>Restore backup</strong>
        <p style={{ fontSize: 12, color: "var(--admin-muted)" }}>Additive only — never deletes existing rows.</p>
        <label style={{ ...btn, cursor: "pointer", display: "inline-block" }}>
          Choose backup JSON
          <input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => void restoreBackup(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}
