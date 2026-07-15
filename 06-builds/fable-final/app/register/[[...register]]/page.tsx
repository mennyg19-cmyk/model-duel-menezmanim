"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type CSSProperties } from "react";

/** R3 — sign-up catch-all path (session auth; Clerk when keys present later). */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create account.");
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form
        onSubmit={onSubmit}
        style={{ width: "100%", maxWidth: 400, background: "#1e293b", padding: 28, borderRadius: 12, border: "1px solid #334155" }}
      >
        <h1 style={{ marginTop: 0 }}>Create account</h1>
        <label style={{ display: "block", marginBottom: 12 }}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <button type="submit" disabled={busy} style={buttonStyle}>
          {busy ? "Creating…" : "Sign up"}
        </button>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 6,
  border: "none",
  background: "#fbbf24",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
