"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

interface DeviceView {
  id: string;
  name: string;
  lastSeenAt: number | null;
  revokedAt: number | null;
  createdAt: number;
}

const card: CSSProperties = {
  border: "1px solid var(--admin-border)",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  background: "var(--admin-surface)",
};
const input: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-bg)",
  color: "var(--admin-fg)",
};
const btn: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  background: "var(--admin-accent)",
  color: "#fff",
  cursor: "pointer",
};

export function DevicesClient({ orgId }: { orgId: string }) {
  const [devices, setDevices] = useState<DeviceView[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/org/${orgId}/devices`);
    if (!res.ok) {
      setError("Could not load devices (need admin).");
      return;
    }
    const json = (await res.json()) as { devices: DeviceView[] };
    setDevices(json.devices);
    setError(null);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function pair() {
    setBusy(true);
    setNewToken(null);
    const res = await fetch(`/api/org/${orgId}/devices`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Pair failed.");
      return;
    }
    const json = (await res.json()) as { token: string };
    setNewToken(json.token);
    setName("");
    await load();
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/org/${orgId}/devices/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Revoke failed.");
      return;
    }
    await load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Sync devices</h1>
      <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>
        Pair a desktop/hybrid box with a one-time token. Auth is the device Bearer token (F-API4), not Clerk.
      </p>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <div style={card}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Pair a new device</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Device name
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Lobby display PC" />
          </label>
          <button type="button" style={btn} disabled={busy || !name.trim()} onClick={() => void pair()}>
            {busy ? "…" : "Pair"}
          </button>
        </div>
        {newToken ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 6,
              border: "1px solid #d97706",
              background: "rgba(217,119,6,0.12)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Copy this token now — it will not be shown again.</p>
            <code style={{ display: "block", marginTop: 8, wordBreak: "break-all", fontSize: 12 }}>{newToken}</code>
            <button
              type="button"
              style={{ ...btn, marginTop: 8, background: "transparent", border: "1px solid var(--admin-border)", color: "var(--admin-fg)" }}
              onClick={() => void navigator.clipboard.writeText(newToken)}
            >
              Copy
            </button>
          </div>
        ) : null}
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Paired devices</h2>
        {devices.length === 0 ? (
          <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>No devices paired yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {devices.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--admin-border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {d.name}
                    {d.revokedAt ? <span style={{ marginInlineStart: 8, fontSize: 12, color: "var(--admin-danger)" }}>(revoked)</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                    {d.lastSeenAt ? `Last synced ${new Date(d.lastSeenAt).toLocaleString()}` : "Never synced"}
                  </div>
                </div>
                {!d.revokedAt ? (
                  <button type="button" style={{ ...btn, background: "transparent", color: "var(--admin-danger)", border: "1px solid var(--admin-border)" }} onClick={() => void revoke(d.id)}>
                    Revoke
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
