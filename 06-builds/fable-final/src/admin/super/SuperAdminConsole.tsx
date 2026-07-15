"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { btn, btnAccent, btnDanger, card, field, input, tabBtn } from "@/admin/formStyles";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  counts: { screens: number; styles: number; members: number };
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  memberships: { id: string; orgId: string; role: string; orgSlug: string | null; orgName: string | null }[];
};

type NoteRow = {
  id: string;
  hebrewMonth: number;
  hebrewDay: number;
  noteHebrew: string;
  noteEnglish: string | null;
  category: string;
};

type Tab = "orgs" | "users" | "notes";

export function SuperAdminConsole() {
  const [tab, setTab] = useState<Tab>("orgs");
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [cloneSource, setCloneSource] = useState("");
  const [cloneName, setCloneName] = useState("");
  const [cloneSlug, setCloneSlug] = useState("");
  const [hub, setHub] = useState<{
    org: { name: string; slug: string };
    editorLinks: Record<string, string>;
    counts: Record<string, number>;
  } | null>(null);

  const [noteForm, setNoteForm] = useState({ hebrewMonth: 1, hebrewDay: 1, noteHebrew: "", noteEnglish: "", category: "other" });

  const loadOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/orgs");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load orgs");
    setOrgs(data.orgs);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load users");
    setUsers(data.users);
    setOrgOptions(data.orgs ?? []);
  }, []);

  const loadNotes = useCallback(async () => {
    const res = await fetch("/api/admin/notes");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load notes");
    setNotes(data.notes);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setError(null);
        if (tab === "orgs") await loadOrgs();
        else if (tab === "users") await loadUsers();
        else await loadNotes();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, [tab, loadOrgs, loadUsers, loadNotes]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(label);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function createOrg() {
    await run("Org created", async () => {
      const res = await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug, status: "pending" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setNewName("");
      setNewSlug("");
      await loadOrgs();
    });
  }

  async function patchStatus(orgId: string, status: string) {
    await run(`Status → ${status}`, async () => {
      const res = await fetch(`/api/admin/orgs/${orgId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status failed");
      await loadOrgs();
    });
  }

  async function patchPlan(orgId: string, plan: string) {
    await run(`Plan → ${plan}`, async () => {
      const res = await fetch(`/api/admin/orgs/${orgId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Plan failed");
      await loadOrgs();
    });
  }

  async function openHub(orgId: string) {
    await run("Loaded org hub (F11)", async () => {
      const res = await fetch(`/api/admin/orgs/${orgId}/data`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Data hub failed");
      setHub({ org: data.org, editorLinks: data.editorLinks, counts: data.counts });
    });
  }

  async function doClone() {
    await run("Cloned", async () => {
      const res = await fetch("/api/admin/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceOrgId: cloneSource,
          createTarget: { name: cloneName, slug: cloneSlug, status: "active" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Clone failed");
      setCloneName("");
      setCloneSlug("");
      await loadOrgs();
    });
  }

  async function reseed() {
    if (!confirm("Wipe and recreate demo + demo-b users/orgs?")) return;
    await run("Reseeded demo", async () => {
      const res = await fetch("/api/admin/reseed-demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reseed failed");
      await loadOrgs();
    });
  }

  async function userAction(body: Record<string, unknown>) {
    await run("User updated", async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User action failed");
      await loadUsers();
    });
  }

  async function addNote() {
    await run("Note added", async () => {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Note create failed");
      setNoteForm({ hebrewMonth: 1, hebrewDay: 1, noteHebrew: "", noteEnglish: "", category: "other" });
      await loadNotes();
    });
  }

  async function deleteNote(id: string) {
    await run("Note deleted", async () => {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await loadNotes();
    });
  }

  const pending = useMemo(() => orgs.filter((o) => o.status === "pending"), [orgs]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Super-admin</h1>
        <Link href="/admin/demo" style={{ fontSize: 13 }}>
          ← Back to org admin
        </Link>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["orgs", "users", "notes"] as Tab[]).map((t) => (
          <button key={t} type="button" style={tabBtn(tab === t)} onClick={() => setTab(t)}>
            {t === "orgs" ? "Organizations" : t === "users" ? "Users" : "Baseline notes"}
          </button>
        ))}
      </div>

      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}
      {msg ? <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>{msg}</p> : null}
      {busy ? <p style={{ fontSize: 12, color: "var(--admin-muted)" }}>Working…</p> : null}

      {tab === "orgs" ? (
        <>
          {pending.length > 0 ? (
            <p style={{ fontSize: 13, color: "var(--admin-muted)" }}>{pending.length} pending approval</p>
          ) : null}

          <div style={card}>
            <strong>Create org (SA.2)</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <label style={{ ...field, marginBottom: 0, flex: 1 }}>
                Name
                <input style={input} value={newName} onChange={(e) => setNewName(e.target.value)} />
              </label>
              <label style={{ ...field, marginBottom: 0, flex: 1 }}>
                Slug
                <input style={input} value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
              </label>
              <button type="button" style={btnAccent} disabled={busy || !newName || !newSlug} onClick={() => void createOrg()}>
                Create
              </button>
            </div>
          </div>

          <div style={card}>
            <strong>Clone org (SA.6)</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <label style={{ ...field, marginBottom: 0, flex: 1 }}>
                Source
                <select style={input} value={cloneSource} onChange={(e) => setCloneSource(e.target.value)}>
                  <option value="">Select…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ ...field, marginBottom: 0, flex: 1 }}>
                New name
                <input style={input} value={cloneName} onChange={(e) => setCloneName(e.target.value)} />
              </label>
              <label style={{ ...field, marginBottom: 0, flex: 1 }}>
                New slug
                <input style={input} value={cloneSlug} onChange={(e) => setCloneSlug(e.target.value)} />
              </label>
              <button
                type="button"
                style={btnAccent}
                disabled={busy || !cloneSource || !cloneName || !cloneSlug}
                onClick={() => void doClone()}
              >
                Clone
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button type="button" style={btnDanger} disabled={busy} onClick={() => void reseed()}>
              Reseed demo (SA.7)
            </button>
          </div>

          {hub ? (
            <div style={card}>
              <strong>
                Edit hub — {hub.org.name} ({hub.org.slug}) · F11
              </strong>
              <p style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                screens {hub.counts.screens} · styles {hub.counts.styles} · members {hub.counts.members}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {Object.entries(hub.editorLinks).map(([k, href]) => (
                  <Link key={k} href={href} style={{ ...btn, textDecoration: "none" }}>
                    {k}
                  </Link>
                ))}
              </div>
              <button type="button" style={{ ...btn, marginTop: 8 }} onClick={() => setHub(null)}>
                Close hub
              </button>
            </div>
          ) : null}

          {orgs.map((o) => (
            <div key={o.id} style={card} data-testid={`sa-org-${o.slug}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <strong>{o.name}</strong>{" "}
                  <span style={{ color: "var(--admin-muted)", fontSize: 13 }}>/{o.slug}</span>
                  <div style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 4 }}>
                    {o.status} · {o.plan} · s{o.counts.screens}/st{o.counts.styles}/m{o.counts.members}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {o.status === "pending" ? (
                    <>
                      <button type="button" style={btnAccent} onClick={() => void patchStatus(o.id, "active")}>
                        Approve
                      </button>
                      <button type="button" style={btnDanger} onClick={() => void patchStatus(o.id, "rejected")}>
                        Reject
                      </button>
                    </>
                  ) : null}
                  {o.status === "active" ? (
                    <button type="button" style={btn} onClick={() => void patchStatus(o.id, "suspended")}>
                      Suspend
                    </button>
                  ) : null}
                  {o.status === "suspended" || o.status === "rejected" ? (
                    <button type="button" style={btnAccent} onClick={() => void patchStatus(o.id, "active")}>
                      Reactivate
                    </button>
                  ) : null}
                  <select style={input} value={o.plan} onChange={(e) => void patchPlan(o.id, e.target.value)}>
                    {["free", "basic", "pro", "enterprise"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button type="button" style={btn} onClick={() => void openHub(o.id)}>
                    Edit data
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {tab === "users" ? (
        <>
          <p style={{ fontSize: 13, color: "var(--admin-muted)" }}>F12 — toggle super-admin, memberships, reset password.</p>
          {users.map((u) => (
            <div key={u.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <strong>{u.email}</strong>
                  {u.isSuperAdmin ? (
                    <span style={{ marginLeft: 8, fontSize: 11, background: "var(--admin-accent)", color: "var(--admin-accent-text)", padding: "2px 6px", borderRadius: 4 }}>
                      super-admin
                    </span>
                  ) : null}
                  <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>{u.name || "—"}</div>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
                    {u.memberships.map((m) => (
                      <li key={m.id}>
                        {m.orgSlug} · {m.role}{" "}
                        <button type="button" style={{ ...btnDanger, padding: "2px 6px", fontSize: 11 }} onClick={() => void userAction({ action: "removeMembership", membershipId: m.id })}>
                          remove
                        </button>
                      </li>
                    ))}
                    {u.memberships.length === 0 ? <li style={{ listStyle: "none", marginLeft: -18 }}>No memberships</li> : null}
                  </ul>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    type="button"
                    style={btn}
                    onClick={() => void userAction({ action: "setSuperAdmin", userId: u.id, isSuperAdmin: !u.isSuperAdmin })}
                  >
                    {u.isSuperAdmin ? "Revoke super" : "Make super"}
                  </button>
                  <button type="button" style={btn} onClick={() => void userAction({ action: "resetPassword", userId: u.id })}>
                    Reset password → demo-pass
                  </button>
                  <AddMembershipRow userId={u.id} orgs={orgOptions} onAdd={(orgId, role) => void userAction({ action: "setMembership", userId: u.id, orgId, role })} />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {tab === "notes" ? (
        <>
          <p style={{ fontSize: 13, color: "var(--admin-muted)" }}>SA.9 — global Tukachinsky baseline (orgId null). E22.</p>
          <div style={card}>
            <strong>Add baseline note</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <label style={field}>
                Month
                <input style={input} type="number" min={1} max={13} value={noteForm.hebrewMonth} onChange={(e) => setNoteForm({ ...noteForm, hebrewMonth: Number(e.target.value) })} />
              </label>
              <label style={field}>
                Day
                <input style={input} type="number" min={1} max={30} value={noteForm.hebrewDay} onChange={(e) => setNoteForm({ ...noteForm, hebrewDay: Number(e.target.value) })} />
              </label>
              <label style={{ ...field, flex: 2 }}>
                Hebrew
                <input style={input} value={noteForm.noteHebrew} onChange={(e) => setNoteForm({ ...noteForm, noteHebrew: e.target.value })} dir="rtl" />
              </label>
              <button type="button" style={btnAccent} disabled={!noteForm.noteHebrew.trim()} onClick={() => void addNote()}>
                Add
              </button>
            </div>
          </div>
          {notes.slice(0, 40).map((n) => (
            <div key={n.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>
                    {n.hebrewMonth}/{n.hebrewDay}
                  </strong>{" "}
                  <span style={{ fontSize: 12, color: "var(--admin-muted)" }}>{n.category}</span>
                  <div dir="rtl">{n.noteHebrew}</div>
                  {n.noteEnglish ? <div style={{ fontSize: 12 }}>{n.noteEnglish}</div> : null}
                </div>
                <button type="button" style={btnDanger} onClick={() => void deleteNote(n.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {notes.length > 40 ? <p style={{ fontSize: 12 }}>Showing 40 of {notes.length}</p> : null}
        </>
      ) : null}
    </div>
  );
}

function AddMembershipRow({
  userId: _userId,
  orgs,
  onAdd,
}: {
  userId: string;
  orgs: { id: string; slug: string; name: string }[];
  onAdd: (orgId: string, role: string) => void;
}) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [role, setRole] = useState("viewer");
  useEffect(() => {
    if (!orgId && orgs[0]) setOrgId(orgs[0].id);
  }, [orgs, orgId]);
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      <select style={{ ...input, maxWidth: 120 }} value={orgId} onChange={(e) => setOrgId(e.target.value)}>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.slug}
          </option>
        ))}
      </select>
      <select style={{ ...input, maxWidth: 90 }} value={role} onChange={(e) => setRole(e.target.value)}>
        {["owner", "admin", "editor", "viewer"].map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button type="button" style={btn} disabled={!orgId} onClick={() => onAdd(orgId, role)}>
        Add membership
      </button>
    </div>
  );
}
