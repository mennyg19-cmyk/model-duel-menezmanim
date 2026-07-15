"use client";

import { useCallback, useEffect, useState } from "react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type Invite = {
  id: string;
  email: string;
  role: string;
  acceptPath: string;
  expiresAt: string;
};

const ROLES = ["owner", "admin", "editor", "viewer"] as const;

export function MembersManager({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [mRes, iRes] = await Promise.all([
      fetch(`/api/org/${orgId}/members`, { cache: "no-store" }),
      fetch(`/api/org/${orgId}/invites`, { cache: "no-store" }),
    ]);
    if (!mRes.ok) {
      const body = (await mRes.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? `Members failed (${mRes.status})`);
      return;
    }
    const mBody = (await mRes.json()) as { members: Member[] };
    setMembers(mBody.members);
    if (iRes.ok) {
      const iBody = (await iRes.json()) as { invites: Invite[] };
      setInvites(iBody.invites);
    }
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeRole(membershipId: string, nextRole: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, role: nextRole }),
      });
      if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? `Update failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(membershipId: string) {
    if (!confirm("Remove this member?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/members?membershipId=${encodeURIComponent(membershipId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Remove failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  async function invite() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Invite failed (${res.status})`);
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  async function resend(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resendId: id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Resend failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${orgId}/invites?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Revoke failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-page" data-tutorial="members-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Members</p>
          <h1>Team access</h1>
        </div>
      </header>
      {error ? <p className="adm-error">{error}</p> : null}

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Members</h2>
        </div>
        <ul className="adm-list">
          {members.map((m) => (
            <li key={m.id} className="adm-memberRow">
              <div>
                <strong>{m.user.name}</strong>
                <small>{m.user.email}</small>
              </div>
              <select
                aria-label={`Role for ${m.user.email}`}
                value={m.role}
                disabled={busy}
                onChange={(e) => void changeRole(m.id, e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button type="button" className="button button-secondary" disabled={busy} onClick={() => void removeMember(m.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Invite by email</h2>
        </div>
        <div className="adm-formGrid">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="button" disabled={busy || !email.trim()} onClick={() => void invite()}>
          Send invite
        </button>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Pending invites</h2>
        </div>
        {invites.length === 0 ? <p className="adm-muted">No pending invites.</p> : null}
        <ul className="adm-list">
          {invites.map((inviteRow) => (
            <li key={inviteRow.id} className="adm-memberRow">
              <div>
                <strong>{inviteRow.email}</strong>
                <small>
                  {inviteRow.role} · expires {new Date(inviteRow.expiresAt).toLocaleDateString()} · {inviteRow.acceptPath}
                </small>
              </div>
              <button type="button" className="button button-secondary" disabled={busy} onClick={() => void resend(inviteRow.id)}>
                Resend
              </button>
              <button type="button" className="button button-secondary" disabled={busy} onClick={() => void revoke(inviteRow.id)}>
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
