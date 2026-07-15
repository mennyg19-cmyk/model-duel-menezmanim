"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "announcements" | "memorials" | "sponsors" | "media" | "notes";

type Announcement = {
  id: string;
  title: string;
  titleHebrew: string | null;
  content: string;
  contentHebrew: string | null;
  priority: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  scheduleRules: unknown;
};

type Memorial = {
  id: string;
  hebrewName: string;
  englishName: string | null;
  hebrewFamilyName: string | null;
  hebrewBenBat: string | null;
  hebrewYear: number | null;
  hebrewMonth: number;
  hebrewDay: number;
  hebrewAdar: number;
  civilDate: string | null;
  isYahrzeit: boolean;
  donorInfo: string | null;
  notes: string | null;
  relationship: string | null;
  isActive: boolean;
};

type Sponsor = {
  id: string;
  type: string;
  sponsorName: string;
  hebrewText: string | null;
  englishText: string | null;
  hebrewDate: string | null;
  civilDate: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  isActive: boolean;
};

type MediaItem = {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  sortOrder: number;
  isActive: boolean;
  scheduleRules: unknown;
};

type MergedNote = {
  id: string;
  baselineId: string | null;
  hebrewMonth: number;
  hebrewDay: number;
  noteHebrew: string;
  noteEnglish: string | null;
  category: string;
  origin: "global" | "org" | "override";
  hiddenByOrg: boolean;
  isHidden: boolean;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "announcements", label: "Announcements" },
  { id: "memorials", label: "Memorials" },
  { id: "sponsors", label: "Sponsors" },
  { id: "media", label: "Media" },
  { id: "notes", label: "Daily notes" },
];

const HE_MONTHS = [
  "",
  "Nisan",
  "Iyar",
  "Sivan",
  "Tammuz",
  "Av",
  "Elul",
  "Tishrei",
  "Cheshvan",
  "Kislev",
  "Tevet",
  "Shevat",
  "Adar",
  "Adar II",
];

export function ContentHub({
  orgId,
  orgName,
  orgSlug,
  initialTab = "announcements",
}: {
  orgId: string;
  orgName: string;
  orgSlug: string;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [notes, setNotes] = useState<MergedNote[]>([]);
  const [memorialQ, setMemorialQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [a, m, s, med, n] = await Promise.all([
      fetch(`/api/org/${orgId}/announcements`),
      fetch(`/api/org/${orgId}/memorials${memorialQ ? `?q=${encodeURIComponent(memorialQ)}` : ""}`),
      fetch(`/api/org/${orgId}/sponsors`),
      fetch(`/api/org/${orgId}/media`),
      fetch(`/api/org/${orgId}/notes`),
    ]);
    if (!a.ok || !m.ok || !s.ok || !med.ok || !n.ok) {
      const bad = [a, m, s, med, n].find((r) => !r.ok)!;
      const body = (await bad.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `HTTP ${bad.status}`);
    }
    setAnnouncements(((await a.json()) as { announcements: Announcement[] }).announcements);
    setMemorials(((await m.json()) as { memorials: Memorial[] }).memorials);
    setSponsors(((await s.json()) as { sponsors: Sponsor[] }).sponsors);
    setMedia(((await med.json()) as { media: MediaItem[] }).media);
    setNotes(((await n.json()) as { merged: MergedNote[] }).merged);
  }, [orgId, memorialQ]);

  useEffect(() => {
    void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [load]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const visibleNotes = useMemo(
    () => notes.filter((n) => !n.hiddenByOrg).slice(0, 40),
    [notes],
  );
  const hiddenCount = notes.filter((n) => n.hiddenByOrg).length;

  return (
    <div className="hub">
      <header className="hub-header">
        <div>
          <p className="eyebrow">Content hub</p>
          <h1>{orgName}</h1>
          <p className="auth-copy">
            Announcements, memorials (with relationship), sponsors, media, and OP6 daily notes for{" "}
            {orgSlug}.
          </p>
        </div>
      </header>

      {error && <div className="hub-error">{error}</div>}

      <nav className="hub-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "hub-tabActive" : "hub-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="hub-panel">
        {tab === "announcements" && (
          <div>
            <div className="hub-toolbar">
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const res = await fetch(`/api/org/${orgId}/announcements`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: "New announcement",
                        content: "Details…",
                        priority: announcements.length + 1,
                        scheduleRules: { type: "always" },
                      }),
                    });
                    if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error);
                  })
                }
              >
                Add announcement
              </button>
            </div>
            {announcements.map((a) => {
              const open = expanded === a.id;
              return (
                <div key={a.id} className="hub-card">
                  <div className="hub-row" onClick={() => setExpanded(open ? null : a.id)}>
                    <strong>{a.title}</strong>
                    <span className="hub-muted">P{a.priority}</span>
                    <span className="hub-muted">{a.isActive ? "active" : "off"}</span>
                  </div>
                  {open && (
                    <div className="hub-editor">
                      <label>
                        Title
                        <input
                          value={a.title}
                          onChange={(e) =>
                            setAnnouncements((prev) =>
                              prev.map((x) => (x.id === a.id ? { ...x, title: e.target.value } : x)),
                            )
                          }
                        />
                      </label>
                      <label>
                        Title HE
                        <input
                          dir="rtl"
                          value={a.titleHebrew ?? ""}
                          onChange={(e) =>
                            setAnnouncements((prev) =>
                              prev.map((x) =>
                                x.id === a.id ? { ...x, titleHebrew: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Content
                        <textarea
                          value={a.content}
                          onChange={(e) =>
                            setAnnouncements((prev) =>
                              prev.map((x) => (x.id === a.id ? { ...x, content: e.target.value } : x)),
                            )
                          }
                        />
                      </label>
                      <label>
                        Content HE
                        <textarea
                          dir="rtl"
                          value={a.contentHebrew ?? ""}
                          onChange={(e) =>
                            setAnnouncements((prev) =>
                              prev.map((x) =>
                                x.id === a.id ? { ...x, contentHebrew: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <div className="hub-grid2">
                        <label>
                          Priority
                          <input
                            type="number"
                            value={a.priority}
                            onChange={(e) =>
                              setAnnouncements((prev) =>
                                prev.map((x) =>
                                  x.id === a.id ? { ...x, priority: Number(e.target.value) || 0 } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Start
                          <input
                            type="date"
                            value={a.startDate ?? ""}
                            onChange={(e) =>
                              setAnnouncements((prev) =>
                                prev.map((x) =>
                                  x.id === a.id ? { ...x, startDate: e.target.value || null } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          End
                          <input
                            type="date"
                            value={a.endDate ?? ""}
                            onChange={(e) =>
                              setAnnouncements((prev) =>
                                prev.map((x) =>
                                  x.id === a.id ? { ...x, endDate: e.target.value || null } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="hub-check">
                          <input
                            type="checkbox"
                            checked={a.isActive}
                            onChange={(e) =>
                              setAnnouncements((prev) =>
                                prev.map((x) =>
                                  x.id === a.id ? { ...x, isActive: e.target.checked } : x,
                                ),
                              )
                            }
                          />
                          Active
                        </label>
                      </div>
                      <label>
                        Visibility rules (JSON)
                        <textarea
                          value={JSON.stringify(a.scheduleRules ?? { type: "always" }, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value) as unknown;
                              setAnnouncements((prev) =>
                                prev.map((x) => (x.id === a.id ? { ...x, scheduleRules: parsed } : x)),
                              );
                            } catch {
                              /* keep typing */
                            }
                          }}
                        />
                      </label>
                      <div className="hub-actions">
                        <button
                          type="button"
                          className="button"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/announcements`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(a),
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/announcements?id=${a.id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "memorials" && (
          <div>
            <div className="hub-toolbar">
              <input
                placeholder="Search name / relationship…"
                value={memorialQ}
                onChange={(e) => setMemorialQ(e.target.value)}
              />
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const res = await fetch(`/api/org/${orgId}/memorials`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        hebrewName: "פלוני בן פלוני",
                        englishName: "Ploni ben Ploni",
                        relationship: "father",
                        hebrewMonth: 7,
                        hebrewDay: 10,
                      }),
                    });
                    if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error);
                  })
                }
              >
                Add memorial
              </button>
            </div>
            {memorials.map((m) => {
              const open = expanded === m.id;
              return (
                <div key={m.id} className="hub-card">
                  <div className="hub-row" onClick={() => setExpanded(open ? null : m.id)}>
                    <strong dir="rtl">{m.hebrewName}</strong>
                    <span>{m.englishName}</span>
                    <span className="hub-muted">{m.relationship ?? "—"}</span>
                    <span className="hub-muted">
                      {HE_MONTHS[m.hebrewMonth]} {m.hebrewDay}
                    </span>
                  </div>
                  {open && (
                    <div className="hub-editor">
                      <div className="hub-grid2">
                        {(
                          [
                            ["hebrewName", "Hebrew name"],
                            ["englishName", "English name"],
                            ["hebrewFamilyName", "Family"],
                            ["hebrewBenBat", "Ben/Bat"],
                            ["relationship", "Relationship (F5)"],
                            ["donorInfo", "Donor"],
                          ] as const
                        ).map(([key, label]) => (
                          <label key={key}>
                            {label}
                            <input
                              value={(m[key] as string | null) ?? ""}
                              onChange={(e) =>
                                setMemorials((prev) =>
                                  prev.map((x) =>
                                    x.id === m.id ? { ...x, [key]: e.target.value || null } : x,
                                  ),
                                )
                              }
                            />
                          </label>
                        ))}
                        <label>
                          Month
                          <input
                            type="number"
                            value={m.hebrewMonth}
                            onChange={(e) =>
                              setMemorials((prev) =>
                                prev.map((x) =>
                                  x.id === m.id ? { ...x, hebrewMonth: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Day
                          <input
                            type="number"
                            value={m.hebrewDay}
                            onChange={(e) =>
                              setMemorials((prev) =>
                                prev.map((x) =>
                                  x.id === m.id ? { ...x, hebrewDay: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="hub-check">
                          <input
                            type="checkbox"
                            checked={m.isYahrzeit}
                            onChange={(e) =>
                              setMemorials((prev) =>
                                prev.map((x) =>
                                  x.id === m.id ? { ...x, isYahrzeit: e.target.checked } : x,
                                ),
                              )
                            }
                          />
                          Yahrzeit
                        </label>
                        <label className="hub-check">
                          <input
                            type="checkbox"
                            checked={m.isActive}
                            onChange={(e) =>
                              setMemorials((prev) =>
                                prev.map((x) =>
                                  x.id === m.id ? { ...x, isActive: e.target.checked } : x,
                                ),
                              )
                            }
                          />
                          Active
                        </label>
                      </div>
                      <label>
                        Notes
                        <textarea
                          value={m.notes ?? ""}
                          onChange={(e) =>
                            setMemorials((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, notes: e.target.value || null } : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <div className="hub-actions">
                        <button
                          type="button"
                          className="button"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/memorials/${m.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(m),
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/memorials/${m.id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "sponsors" && (
          <div>
            <div className="hub-toolbar">
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const res = await fetch(`/api/org/${orgId}/sponsors`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "kiddush",
                        sponsorName: "New sponsor",
                        englishText: "Sponsored by…",
                        hebrewText: "נתרם ע״י…",
                      }),
                    });
                    if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error);
                  })
                }
              >
                Add sponsor
              </button>
            </div>
            {sponsors.map((s) => {
              const open = expanded === s.id;
              return (
                <div key={s.id} className="hub-card">
                  <div className="hub-row" onClick={() => setExpanded(open ? null : s.id)}>
                    <strong>{s.sponsorName}</strong>
                    <span className="hub-muted">{s.type}</span>
                    <span className="hub-muted">{s.isRecurring ? "recurring" : "one-time"}</span>
                  </div>
                  {open && (
                    <div className="hub-editor">
                      <div className="hub-grid2">
                        <label>
                          Name
                          <input
                            value={s.sponsorName}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, sponsorName: e.target.value } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Type
                          <input
                            value={s.type}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) => (x.id === s.id ? { ...x, type: e.target.value } : x)),
                              )
                            }
                          />
                        </label>
                        <label>
                          English text
                          <input
                            value={s.englishText ?? ""}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, englishText: e.target.value || null } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Hebrew text
                          <input
                            dir="rtl"
                            value={s.hebrewText ?? ""}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, hebrewText: e.target.value || null } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Hebrew date
                          <input
                            value={s.hebrewDate ?? ""}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, hebrewDate: e.target.value || null } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Recurrence rule
                          <input
                            value={s.recurrenceRule ?? ""}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id
                                    ? { ...x, recurrenceRule: e.target.value || null }
                                    : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="hub-check">
                          <input
                            type="checkbox"
                            checked={s.isRecurring}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, isRecurring: e.target.checked } : x,
                                ),
                              )
                            }
                          />
                          Recurring
                        </label>
                        <label className="hub-check">
                          <input
                            type="checkbox"
                            checked={s.isActive}
                            onChange={(e) =>
                              setSponsors((prev) =>
                                prev.map((x) =>
                                  x.id === s.id ? { ...x, isActive: e.target.checked } : x,
                                ),
                              )
                            }
                          />
                          Active
                        </label>
                      </div>
                      <div className="hub-actions">
                        <button
                          type="button"
                          className="button"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/sponsors/${s.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(s),
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const res = await fetch(`/api/org/${orgId}/sponsors/${s.id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok)
                                throw new Error(((await res.json()) as { error?: string }).error);
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "media" && (
          <div>
            <div className="hub-toolbar">
              <label className="button button-secondary hub-upload">
                Upload
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void run(async () => {
                      const form = new FormData();
                      form.append("file", file);
                      form.append(
                        "scheduleRules",
                        JSON.stringify({ type: "always" }),
                      );
                      const res = await fetch(`/api/org/${orgId}/media`, {
                        method: "POST",
                        body: form,
                      });
                      if (!res.ok)
                        throw new Error(((await res.json()) as { error?: string }).error);
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                className="button button-secondary"
                disabled={busy || media.length < 2}
                onClick={() =>
                  void run(async () => {
                    const ids = [...media].reverse().map((m) => m.id);
                    const res = await fetch(`/api/org/${orgId}/media/ordering`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids }),
                    });
                    if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error);
                  })
                }
              >
                Reverse order
              </button>
            </div>
            <div className="hub-mediaGrid">
              {media.map((item, index) => (
                <div key={item.id} className="hub-mediaCard">
                  {item.mimeType.startsWith("image/") ? (
                    <img src={item.publicUrl} alt={item.originalName} />
                  ) : (
                    <div className="hub-mediaFile">{item.mimeType}</div>
                  )}
                  <div className="hub-mediaMeta">
                    <strong>
                      #{index + 1} {item.originalName}
                    </strong>
                    <span className="hub-muted">{Math.round(item.fileSize / 1024)} KB</span>
                    <label className="hub-check">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) =>
                          void run(async () => {
                            const res = await fetch(`/api/org/${orgId}/media/${item.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isActive: e.target.checked }),
                            });
                            if (!res.ok)
                              throw new Error(((await res.json()) as { error?: string }).error);
                          })
                        }
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const res = await fetch(`/api/org/${orgId}/media/${item.id}`, {
                            method: "DELETE",
                          });
                          if (!res.ok)
                            throw new Error(((await res.json()) as { error?: string }).error);
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "notes" && (
          <div>
            <p className="auth-copy">
              Global baseline is read-only here. Org can add, override, or hide. Merged visible:{" "}
              {notes.filter((n) => !n.hiddenByOrg).length}; hidden by org: {hiddenCount}.
            </p>
            <div className="hub-toolbar">
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const res = await fetch(`/api/org/${orgId}/notes`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "add",
                        hebrewMonth: 1,
                        hebrewDay: 15,
                        category: "minhag",
                        noteHebrew: "הערה מקומית",
                        noteEnglish: "Local org note",
                      }),
                    });
                    if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error);
                  })
                }
              >
                Add org note
              </button>
            </div>
            {visibleNotes.map((n) => (
              <div key={`${n.origin}-${n.id}`} className="hub-card">
                <div className="hub-row">
                  <span className="hub-badge">{n.origin}</span>
                  <strong>
                    {HE_MONTHS[n.hebrewMonth]} {n.hebrewDay}
                  </strong>
                  <span className="hub-muted">{n.category}</span>
                </div>
                <p dir="rtl">{n.noteHebrew}</p>
                {n.noteEnglish && <p className="hub-muted">{n.noteEnglish}</p>}
                <div className="hub-actions">
                  {n.origin === "global" && n.baselineId && (
                    <>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const res = await fetch(`/api/org/${orgId}/notes`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "override",
                                baselineId: n.baselineId,
                                noteHebrew: `${n.noteHebrew} (org override)`,
                                noteEnglish: `${n.noteEnglish ?? ""} (override)`.trim(),
                              }),
                            });
                            if (!res.ok)
                              throw new Error(((await res.json()) as { error?: string }).error);
                          })
                        }
                      >
                        Override
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const res = await fetch(`/api/org/${orgId}/notes`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "hide", baselineId: n.baselineId }),
                            });
                            if (!res.ok)
                              throw new Error(((await res.json()) as { error?: string }).error);
                          })
                        }
                      >
                        Hide
                      </button>
                    </>
                  )}
                  {n.origin === "override" && n.baselineId && (
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const res = await fetch(`/api/org/${orgId}/notes`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "clear-override",
                              baselineId: n.baselineId,
                            }),
                          });
                          if (!res.ok)
                            throw new Error(((await res.json()) as { error?: string }).error);
                        })
                      }
                    >
                      Clear override
                    </button>
                  )}
                  {n.origin === "org" && (
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const res = await fetch(`/api/org/${orgId}/notes?id=${n.id}`, {
                            method: "DELETE",
                          });
                          if (!res.ok)
                            throw new Error(((await res.json()) as { error?: string }).error);
                        })
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notes
              .filter((n) => n.hiddenByOrg)
              .slice(0, 10)
              .map((n) => (
                <div key={`hidden-${n.id}`} className="hub-card hub-cardMuted">
                  <div className="hub-row">
                    <span className="hub-badge">hidden</span>
                    <strong>
                      {HE_MONTHS[n.hebrewMonth]} {n.hebrewDay}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const res = await fetch(`/api/org/${orgId}/notes`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "unhide",
                            baselineId: n.baselineId,
                          }),
                        });
                        if (!res.ok)
                          throw new Error(((await res.json()) as { error?: string }).error);
                      })
                    }
                  >
                    Unhide
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
