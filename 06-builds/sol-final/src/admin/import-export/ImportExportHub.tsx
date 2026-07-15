"use client";

import { useMemo, useState } from "react";

type Category =
  | "schedules"
  | "announcements"
  | "yahrzeit"
  | "sponsors"
  | "groups-events"
  | "bezee"
  | "json-announcements"
  | "json-yahrzeit"
  | "json-sponsors";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "schedules", label: "Schedules CSV" },
  { id: "announcements", label: "Announcements CSV" },
  { id: "yahrzeit", label: "Yahrzeit CSV" },
  { id: "sponsors", label: "Sponsors CSV" },
  { id: "groups-events", label: "Groups CSV" },
  { id: "bezee", label: "BeeZee (.bzs)" },
  { id: "json-announcements", label: "Announcements JSON" },
  { id: "json-yahrzeit", label: "Yahrzeit JSON" },
  { id: "json-sponsors", label: "Sponsors JSON" },
];

export function ImportExportHub({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [category, setCategory] = useState<Category>("schedules");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [preview, setPreview] = useState<unknown[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [basis, setBasis] = useState<"sunday" | "shabbos">("sunday");

  const exportLinks = useMemo(
    () => [
      { label: "Schedules CSV", href: `/api/org/${orgId}/export?kind=schedules&format=csv` },
      { label: "Announcements CSV", href: `/api/org/${orgId}/export?kind=announcements&format=csv` },
      { label: "Memorials CSV", href: `/api/org/${orgId}/export?kind=memorials&format=csv` },
      { label: "Sponsors CSV", href: `/api/org/${orgId}/export?kind=sponsors&format=csv` },
      { label: "Groups CSV", href: `/api/org/${orgId}/export?kind=groups&format=csv` },
      { label: "Schedules ICS", href: `/api/org/${orgId}/export?kind=ics-schedules&format=ics` },
      { label: "Full org JSON", href: `/api/org/${orgId}/export?kind=full-json&format=json` },
      {
        label: `Weekly CSV (${weeks}w)`,
        href: `/api/org/${orgId}/export?kind=weekly&weeks=${weeks}&basis=${basis}&format=csv`,
      },
      {
        label: `Weekly HTML/PDF (${weeks}w)`,
        href: `/api/org/${orgId}/export?kind=weekly&weeks=${weeks}&basis=${basis}&format=html`,
      },
      { label: "Board screenshot SVG", href: `/api/org/${orgId}/export?kind=screenshot&screenId=main` },
    ],
    [orgId, weeks, basis],
  );

  async function loadSample() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/org/${orgId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sample", category }),
      });
      const body = await res.json();
      setContent(String(body.sample ?? ""));
    } finally {
      setBusy(false);
    }
  }

  async function runPreview() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/org/${orgId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", category, content }),
      });
      const body = await res.json();
      setPreview(body.preview ?? []);
      setErrors(body.errors ?? []);
      setMessage(`Preview: ${body.count ?? 0} rows`);
    } finally {
      setBusy(false);
    }
  }

  async function runCommit() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/org/${orgId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "commit", category, content, mode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Commit failed (${res.status})`);
      setErrors(body.errors ?? []);
      setMessage(`Wrote ${body.written ?? 0} records`);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Commit failed"]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Import / Export</p>
          <h1>{orgSlug}</h1>
        </div>
      </header>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Import</h2>
        </div>
        <div className="adm-formGrid">
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <select value={mode} onChange={(e) => setMode(e.target.value as "append" | "replace")}>
              <option value="append">Append</option>
              <option value="replace">Replace</option>
            </select>
          </label>
        </div>
        <label>
          File content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Paste CSV/JSON/BZS content, or load a sample"
          />
        </label>
        <label className="adm-upload">
          Or choose a file
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setContent(await file.text());
            }}
          />
        </label>
        <div className="adm-inlineActions">
          <button type="button" className="button button-secondary" disabled={busy} onClick={() => void loadSample()}>
            Sample
          </button>
          <button type="button" className="button button-secondary" disabled={busy || !content} onClick={() => void runPreview()}>
            Preview
          </button>
          <button type="button" className="button" disabled={busy || !content} onClick={() => void runCommit()}>
            Commit
          </button>
        </div>
        {message ? <p className="adm-ok">{message}</p> : null}
        {errors.length > 0 ? (
          <ul className="adm-error">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        ) : null}
        {preview ? (
          <pre className="adm-pre">{JSON.stringify(preview, null, 2)}</pre>
        ) : null}
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Export</h2>
        </div>
        <div className="adm-formGrid">
          <label>
            Weeks
            <input type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(Number(e.target.value) || 1)} />
          </label>
          <label>
            Week basis
            <select value={basis} onChange={(e) => setBasis(e.target.value as "sunday" | "shabbos")}>
              <option value="sunday">Sunday</option>
              <option value="shabbos">Shabbos</option>
            </select>
          </label>
        </div>
        <div className="adm-inlineActions">
          {exportLinks.map((link) => (
            <a key={link.href} className="button button-secondary" href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
