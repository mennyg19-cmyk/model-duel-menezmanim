"use client";

import { useState } from "react";

type Kind = "event" | "announcement" | "yahrzeit" | "sponsor";

export function QuickAddModals({ orgId, onCreated }: { orgId: string; onCreated: () => void }) {
  const [open, setOpen] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(kind: Kind, form: FormData) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      let res: Response;
      if (kind === "announcement") {
        res = await fetch(`/api/org/${orgId}/announcements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: String(form.get("title") || "Announcement"),
            content: String(form.get("content") || ""),
            isActive: true,
          }),
        });
      } else if (kind === "yahrzeit") {
        res = await fetch(`/api/org/${orgId}/memorials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hebrewName: String(form.get("hebrewName") || "נפטר"),
            englishName: String(form.get("englishName") || "") || null,
            hebrewMonth: Number(form.get("hebrewMonth") || 1),
            hebrewDay: Number(form.get("hebrewDay") || 1),
            isYahrzeit: true,
            isActive: true,
          }),
        });
      } else if (kind === "sponsor") {
        res = await fetch(`/api/org/${orgId}/sponsors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sponsorName: String(form.get("sponsorName") || "Sponsor"),
            type: String(form.get("type") || "general"),
            englishText: String(form.get("englishText") || "") || null,
            isActive: true,
          }),
        });
      } else {
        res = await fetch(`/api/org/${orgId}/schedules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            name: String(form.get("name") || "New event"),
            hebrewName: String(form.get("hebrewName") || "") || null,
            type: String(form.get("type") || "shacharit"),
            fixedTime: String(form.get("fixedTime") || "07:00"),
            isActive: true,
          }),
        });
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }
      setMessage("Created");
      setOpen(null);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adm-card">
      <div className="adm-cardHead">
        <h2>Quick add</h2>
      </div>
      <div className="adm-inlineActions">
        {(
          [
            ["event", "Event"],
            ["announcement", "Announcement"],
            ["yahrzeit", "Yahrzeit"],
            ["sponsor", "Sponsor"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className="button button-secondary" onClick={() => setOpen(id)}>
            + {label}
          </button>
        ))}
      </div>
      {message ? <p className="adm-ok">{message}</p> : null}
      {error ? <p className="adm-error">{error}</p> : null}
      {open ? (
        <div className="adm-modalBackdrop" role="presentation" onClick={() => setOpen(null)}>
          <form
            className="adm-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              void submit(open, new FormData(e.currentTarget));
            }}
          >
            <h3>Add {open}</h3>
            {open === "event" ? (
              <>
                <label>
                  Name
                  <input name="name" required defaultValue="Weekday Shacharit" />
                </label>
                <label>
                  Hebrew name
                  <input name="hebrewName" defaultValue="שחרית" />
                </label>
                <label>
                  Fixed time
                  <input name="fixedTime" type="time" defaultValue="07:00" />
                </label>
                <input type="hidden" name="type" value="shacharit" />
              </>
            ) : null}
            {open === "announcement" ? (
              <>
                <label>
                  Title
                  <input name="title" required defaultValue="Community notice" />
                </label>
                <label>
                  Content
                  <textarea name="content" required defaultValue="Please arrive early." />
                </label>
              </>
            ) : null}
            {open === "yahrzeit" ? (
              <>
                <label>
                  Hebrew name
                  <input name="hebrewName" required defaultValue="פלוני בן פלוני" />
                </label>
                <label>
                  English name
                  <input name="englishName" defaultValue="Ploni" />
                </label>
                <div className="adm-grid2">
                  <label>
                    Hebrew month
                    <input name="hebrewMonth" type="number" min={1} max={13} defaultValue={1} />
                  </label>
                  <label>
                    Hebrew day
                    <input name="hebrewDay" type="number" min={1} max={30} defaultValue={1} />
                  </label>
                </div>
              </>
            ) : null}
            {open === "sponsor" ? (
              <>
                <label>
                  Sponsor name
                  <input name="sponsorName" required defaultValue="Anonymous" />
                </label>
                <label>
                  Type
                  <select name="type" defaultValue="general">
                    <option value="general">General</option>
                    <option value="kiddush">Kiddush</option>
                    <option value="seudah">Seudah</option>
                  </select>
                </label>
                <label>
                  English text
                  <input name="englishText" defaultValue="Sponsored in memory of…" />
                </label>
              </>
            ) : null}
            <div className="adm-inlineActions">
              <button type="submit" className="button" disabled={busy}>
                {busy ? "Saving…" : "Create"}
              </button>
              <button type="button" className="button button-secondary" onClick={() => setOpen(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
