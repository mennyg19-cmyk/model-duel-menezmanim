"use client";

import { useCallback, useEffect, useState } from "react";
import { btn, btnAccent, btnDanger, card, field, input } from "@/admin/formStyles";

type Member = { id: string; userId: string; role: string; email: string; name: string | null };
type Invite = { id: string; email: string; role: string; token: string; expiresAt: string; invitePath: string };

const ROLES = ["owner", "admin", "editor", "viewer"] as const;
const INVITE_ROLES = ["admin", "editor", "viewer"] as const;

/** P8 Members + invites (E16/E17). */
export function MembersManager({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof INVITE_ROLES)[number]>("editor");
  const [busy, setBusy] = useState(false);
  const [canManage, setCanManage] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    const mRes = await fetch(`/api/org/${orgId}/members`);
    if (!mRes.ok) {
      setError("Could not load members.");
      return;
    }
    setMembers(((await mRes.json()) as { members: Member[] }).members);

    const iRes = await fetch(`/api/org/${orgId}/invites`);
    if (iRes.status === 403) {
      setCanManage(false);
      setInvites([]);
      return;
    }
    setCanManage(true);
    if (iRes.ok) setInvites(((await iRes.json()) as { invites: Invite[] }).invites);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeRole(id: string, role: string) {
    const res = await fetch(`/api/org/${orgId}/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Role change failed.");
      return;
    }
    await load();
  }

  async function removeMember(id: string) {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/org/${orgId}/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Remove failed.");
      return;
    }
    await load();
  }

  async function sendInvite() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/org/${orgId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Invite failed.");
      return;
    }
    setInviteEmail("");
    await load();
  }

  async function revokeInvite(id: string) {
    await fetch(`/api/org/${orgId}/invites?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  async function resendInvite(id: string) {
    await fetch(`/api/org/${orgId}/invites?id=${encodeURIComponent(id)}&action=resend`, { method: "DELETE" });
    await load();
  }

  function inviteLink(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/onboarding?invite=${token}`;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Members</h1>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <h2 style={{ fontSize: 16 }}>People</h2>
      {members.map((m) => (
        <div key={m.id} style={{ ...card, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div>
            <strong>{m.name || m.email}</strong>
            <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>{m.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {canManage ? (
              <select style={input} value={m.role} onChange={(e) => void changeRole(m.id, e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: 13 }}>{m.role}</span>
            )}
            {canManage ? (
              <button type="button" style={btnDanger} onClick={() => void removeMember(m.id)}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ))}

      {canManage ? (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24 }}>Invite</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              style={{ ...input, minWidth: 220 }}
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select style={input} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}>
              {INVITE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="button" style={btnAccent} disabled={busy || !inviteEmail.includes("@")} onClick={() => void sendInvite()}>
              Send invite
            </button>
          </div>

          <h2 style={{ fontSize: 16 }}>Pending invites</h2>
          {invites.length === 0 ? <p style={{ color: "var(--admin-muted)" }}>No pending invites.</p> : null}
          {invites.map((inv) => (
            <div key={inv.id} style={card}>
              <div>
                <strong>{inv.email}</strong> · {inv.role}
                <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                  expires {new Date(inv.expiresAt).toLocaleDateString()} · org {orgSlug}
                </div>
                <code style={{ fontSize: 11, wordBreak: "break-all" }}>{inviteLink(inv.token)}</code>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button type="button" style={btn} onClick={() => void navigator.clipboard.writeText(inviteLink(inv.token))}>
                  Copy link
                </button>
                <button type="button" style={btn} onClick={() => void resendInvite(inv.id)}>
                  Resend
                </button>
                <button type="button" style={btnDanger} onClick={() => void revokeInvite(inv.id)}>
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p style={{ color: "var(--admin-muted)" }}>Only owners/admins can invite or change roles.</p>
      )}
    </div>
  );
}
