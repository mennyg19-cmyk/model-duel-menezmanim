"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@demo.local");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Sign-in failed");
        return;
      }

      const meResponse = await fetch("/api/me");
      if (!meResponse.ok) {
        router.push("/onboarding");
        return;
      }
      const me = (await meResponse.json()) as {
        memberships: Array<{ orgStatus: string }>;
      };
      const hasActive = me.memberships.some((membership) => membership.orgStatus === "active");
      router.push(hasActive ? "/admin" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Sign in</p>
        <h1>Welcome back</h1>
        <p className="auth-copy">
          Local session auth is active for this experiment arm. Seeded accounts work without Clerk
          cloud keys. OAuth catch-all path: <code>/login/sso-callback</code>.
        </p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="auth-footer">
          Need an account? <Link href="/register">Register</Link>
        </p>
        <p className="auth-hint">Try owner@demo.local, newcomer@demo.local, or invitee@demo.local</p>
      </form>
    </main>
  );
}
