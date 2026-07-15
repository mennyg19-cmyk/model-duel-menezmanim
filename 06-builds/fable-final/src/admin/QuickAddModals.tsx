"use client";

import { FormEvent, useState, type CSSProperties } from "react";

type QuickKind = "event" | "announcement" | "yahrzeit" | "sponsor";

/** P3.6 — create content from the dashboard without leaving the page. */
export function QuickAddModals({
  orgId,
  onCreated,
}: {
  orgId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState<QuickKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(kind: QuickKind, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/dashboard/quick-add`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, ...body }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    setOpen(null);
    onCreated();
  }

  return (
    <section style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Quick add</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(
          [
            ["event", "Event / minyan"],
            ["announcement", "Announcement"],
            ["yahrzeit", "Yahrzeit"],
            ["sponsor", "Sponsor"],
          ] as const
        ).map(([kind, label]) => (
          <button key={kind} type="button" onClick={() => setOpen(kind)} style={btnStyle}>
            {label}
          </button>
        ))}
      </div>

      {open ? (
        <div
          role="dialog"
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 10,
            border: "1px solid var(--admin-border)",
            background: "var(--admin-surface)",
            maxWidth: 420,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>Add {open}</strong>
            <button type="button" onClick={() => setOpen(null)} style={{ cursor: "pointer" }}>
              Close
            </button>
          </div>
          {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

          {open === "announcement" ? (
            <QuickForm
              busy={busy}
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "content", label: "Content", required: true },
              ]}
              onSubmit={(values) => void submit("announcement", values)}
            />
          ) : null}
          {open === "event" ? (
            <QuickForm
              busy={busy}
              fields={[
                { name: "name", label: "Name", required: true },
                { name: "hebrewName", label: "Hebrew name" },
                { name: "fixedTime", label: "Fixed time (HH:MM)", required: true },
              ]}
              onSubmit={(values) => void submit("event", { ...values, type: "other" })}
            />
          ) : null}
          {open === "yahrzeit" ? (
            <QuickForm
              busy={busy}
              fields={[
                { name: "hebrewName", label: "Hebrew name", required: true },
                { name: "englishName", label: "English name" },
                { name: "relationship", label: "Relationship" },
                { name: "hebrewMonth", label: "Hebrew month (1–13)", required: true },
                { name: "hebrewDay", label: "Hebrew day", required: true },
              ]}
              onSubmit={(values) =>
                void submit("yahrzeit", {
                  ...values,
                  hebrewMonth: Number(values.hebrewMonth),
                  hebrewDay: Number(values.hebrewDay),
                })
              }
            />
          ) : null}
          {open === "sponsor" ? (
            <QuickForm
              busy={busy}
              fields={[
                { name: "sponsorName", label: "Sponsor name", required: true },
                { name: "englishText", label: "English text" },
                { name: "hebrewText", label: "Hebrew text" },
                { name: "type", label: "Type", required: true },
              ]}
              onSubmit={(values) => void submit("sponsor", values)}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function QuickForm({
  fields,
  busy,
  onSubmit,
}: {
  fields: { name: string; label: string; required?: boolean }[];
  busy: boolean;
  onSubmit: (values: Record<string, string>) => void;
}) {
  function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const f of fields) values[f.name] = String(fd.get(f.name) ?? "");
    onSubmit(values);
  }

  return (
    <form onSubmit={handle} style={{ display: "grid", gap: 10 }}>
      {fields.map((f) => (
        <label key={f.name} style={{ fontSize: 13 }}>
          {f.label}
          <input
            name={f.name}
            required={f.required}
            defaultValue={f.name === "type" ? "kiddush" : ""}
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--admin-border)",
              background: "var(--admin-bg)",
              color: "var(--admin-text)",
              boxSizing: "border-box",
            }}
          />
        </label>
      ))}
      <button type="submit" disabled={busy} style={{ ...btnStyle, background: "var(--admin-accent)", color: "var(--admin-accent-text)" }}>
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

const btnStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-text)",
  cursor: "pointer",
};
