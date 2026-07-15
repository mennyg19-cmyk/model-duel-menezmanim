"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  members: number;
  screens: number;
  styles: number;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  memberships: Array<{ id: string; role: string; orgSlug: string; orgName: string }>;
};

type NoteRow = {
  id: string;
  hebrewMonth: number;
  hebrewDay: number;
  noteHebrew: string;
  noteEnglish: string | null;
  category: string;
};

export function SuperAdminConsole() {
  const [tab, setTab] = useState<"orgs" | "users" | "notes">("orgs");
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [cloneSource, setCloneSource] = useState("");
  const [cloneName, setCloneName] = useState("");
  const [cloneSlug, setCloneSlug] = useState("");
  const [editors, setEditors] = useState<Record<string, string> | null>(null);

  const loadOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/orgs", { cache: "no-store" });
    if (!res.ok) throw new Error(`Orgs failed (${res.status})`);
    const body = await res.json();
    setOrgs(body.orgs ?? []);
    if (!cloneSource && body.orgs?.[0]) setCloneSource(body.orgs[0].id);
  }, [cloneSource]);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (!res.ok) throw new Error(`Users failed (${res.status})`);
    const body = await res.json();
    setUsers(body.users ?? []);
  }, []);

  const loadNotes = useCallback(async () => {
    const res = await fetch("/api/admin/notes", { cache: "no-store" });
    if (!res.ok) throw new Error(`Notes failed (${res.status})`);
    const body = await res.json();
    setNotes(body.notes ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setError(null);
        if (tab === "orgs") await loadOrgs();
        if (tab === "users") await loadUsers();
        if (tab === "notes") await loadNotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed");
      }
    })();
  }, [tab, loadOrgs, loadUsers, loadNotes]);

  async function createOrg() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug, status: "pending" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Create failed");
      setMessage(`Created ${body.org.slug}`);
      setNewName("");
      setNewSlug("");
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(orgId: string, status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Status failed (${res.status})`);
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status failed");
    } finally {
      setBusy(false);
    }
  }

  async function setPlan(orgId: string, plan: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error(`Plan failed (${res.status})`);
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plan failed");
    } finally {
      setBusy(false);
    }
  }

  async function openData(orgId: string) {
    const res = await fetch(`/api/admin/orgs/${orgId}/data`);
    const body = await res.json();
    setEditors(body.editors ?? null);
  }

  async function cloneOrg() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceOrgId: cloneSource, name: cloneName, slug: cloneSlug }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Clone failed");
      setMessage(`Cloned to ${body.org.slug}`);
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setBusy(false);
    }
  }

  async function reseed() {
    if (!confirm("Reseed demo org content?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reseed-demo", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Reseed failed");
      setMessage("Demo reseeded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reseed failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleSuper(userId: string, next: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setSuperAdmin", userId, isSuperAdmin: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Update failed");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeMembership(membershipId: string) {
    if (!confirm("Remove membership?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeMembership", membershipId }),
      });
      if (!res.ok) throw new Error("Remove failed");
      await loadUsers();
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hebrewMonth: 1,
          hebrewDay: 1,
          noteHebrew: "הערה חדשה",
          noteEnglish: "New baseline note",
          category: "minhag",
        }),
      });
      if (!res.ok) throw new Error("Create note failed");
      await loadNotes();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Super-admin</p>
          <h1>Console</h1>
        </div>
        <div className="adm-inlineActions">
          <button type="button" className={tab === "orgs" ? "adm-chipActive" : "adm-chip"} onClick={() => setTab("orgs")}>
            Organizations
          </button>
          <button type="button" className={tab === "users" ? "adm-chipActive" : "adm-chip"} onClick={() => setTab("users")}>
            Users
          </button>
          <button type="button" className={tab === "notes" ? "adm-chipActive" : "adm-chip"} onClick={() => setTab("notes")}>
            Baseline notes
          </button>
        </div>
      </header>
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-ok">{message}</p> : null}

      {tab === "orgs" ? (
        <>
          <section className="adm-card">
            <div className="adm-cardHead">
              <h2>Create organization</h2>
            </div>
            <div className="adm-formGrid">
              <label>
                Name
                <input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </label>
              <label>
                Slug
                <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
              </label>
            </div>
            <button type="button" className="button" disabled={busy} onClick={() => void createOrg()}>
              Create
            </button>
          </section>

          <section className="adm-card">
            <div className="adm-cardHead">
              <h2>Organizations</h2>
              <button type="button" className="button button-secondary" disabled={busy} onClick={() => void reseed()}>
                Reseed demo
              </button>
            </div>
            <ul className="adm-list">
              {orgs.map((org) => (
                <li key={org.id} className="adm-memberRow">
                  <div>
                    <strong>
                      {org.name} ({org.slug})
                    </strong>
                    <small>
                      {org.status} · {org.plan} · {org.members} members · {org.screens} screens
                    </small>
                  </div>
                  <select value={org.status} disabled={busy} onChange={(e) => void setStatus(org.id, e.target.value)}>
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                  <select value={org.plan} disabled={busy} onChange={(e) => void setPlan(org.id, e.target.value)}>
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="pro">pro</option>
                    <option value="enterprise">enterprise</option>
                  </select>
                  <button type="button" className="button button-secondary" onClick={() => void openData(org.id)}>
                    Data editors
                  </button>
                  <Link className="button button-secondary" href={`/admin/${org.slug}`}>
                    Open org
                  </Link>
                </li>
              ))}
            </ul>
            {editors ? (
              <div className="adm-inlineActions">
                {Object.entries(editors).map(([key, href]) => (
                  <Link key={key} className="button button-secondary" href={href}>
                    {key}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>

          <section className="adm-card">
            <div className="adm-cardHead">
              <h2>Clone organization</h2>
            </div>
            <div className="adm-formGrid">
              <label>
                Source
                <select value={cloneSource} onChange={(e) => setCloneSource(e.target.value)}>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.slug}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                New name
                <input value={cloneName} onChange={(e) => setCloneName(e.target.value)} />
              </label>
              <label>
                New slug
                <input value={cloneSlug} onChange={(e) => setCloneSlug(e.target.value)} />
              </label>
            </div>
            <button type="button" className="button" disabled={busy} onClick={() => void cloneOrg()}>
              Clone
            </button>
          </section>
        </>
      ) : null}

      {tab === "users" ? (
        <section className="adm-card">
          <div className="adm-cardHead">
            <h2>Users</h2>
          </div>
          <ul className="adm-list">
            {users.map((user) => (
              <li key={user.id} className="adm-memberRow">
                <div>
                  <strong>
                    {user.name} {user.isSuperAdmin ? "· super-admin" : ""}
                  </strong>
                  <small>{user.email}</small>
                  <small>
                    {user.memberships.map((m) => `${m.orgSlug}:${m.role}`).join(" · ") || "no memberships"}
                  </small>
                </div>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={busy}
                  onClick={() => void toggleSuper(user.id, !user.isSuperAdmin)}
                >
                  {user.isSuperAdmin ? "Revoke super" : "Make super"}
                </button>
                {user.memberships.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="button button-secondary"
                    disabled={busy}
                    onClick={() => void removeMembership(m.id)}
                  >
                    Remove {m.orgSlug}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "notes" ? (
        <section className="adm-card">
          <div className="adm-cardHead">
            <h2>Global baseline notes</h2>
            <button type="button" className="button" disabled={busy} onClick={() => void addNote()}>
              Add note
            </button>
          </div>
          <ul className="adm-list">
            {notes.slice(0, 40).map((note) => (
              <li key={note.id} className="adm-memberRow">
                <div>
                  <strong>
                    {note.hebrewMonth}/{note.hebrewDay} · {note.category}
                  </strong>
                  <small>{note.noteHebrew}</small>
                  <small>{note.noteEnglish}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
