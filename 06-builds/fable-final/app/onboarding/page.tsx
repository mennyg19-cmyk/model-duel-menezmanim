"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type PendingInvite = {
  id: string;
  token: string;
  role: string;
  expiresAt: string;
  orgName: string;
  orgSlug: string;
};

/** R4 / P4o — create org + accept pending invites. */
function OnboardingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const inviteToken = search.get("invite") ?? "";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [latitude, setLatitude] = useState("31.7683");
  const [longitude, setLongitude] = useState("35.2137");
  const [elevation, setElevation] = useState("754");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [inIsrael, setInIsrael] = useState(true);
  const [dialect, setDialect] = useState("Ashkenazi");
  const [candleLightingMinutes, setCandle] = useState("18");
  const [shabbatEndType, setShabbatEndType] = useState("degrees");
  const [shabbatEndValue, setShabbatEndValue] = useState("8.5");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingInvite[]>([]);

  const suggested = useMemo(() => slugify(name), [name]);

  useEffect(() => {
    if (!slugTouched) setSlug(suggested);
  }, [suggested, slugTouched]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetch("/api/me");
      if (me.status === 401) {
        router.replace(`/login`);
        return;
      }
      const invites = await fetch("/api/invites/pending").then((r) => r.json());
      if (!cancelled) setPending(invites.invites ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    const handle = setTimeout(() => {
      void fetch(`/api/onboarding?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((data: { available?: boolean }) => setSlugAvailable(Boolean(data.available)))
        .catch(() => setSlugAvailable(null));
    }, 250);
    return () => clearTimeout(handle);
  }, [slug]);

  useEffect(() => {
    if (!inviteToken) return;
    void acceptInvite(inviteToken);
  }, [inviteToken]);

  async function acceptInvite(token: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/invites/${encodeURIComponent(token)}`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not accept invite.");
      return;
    }
    setMessage(`Joined ${data.slug}. Opening admin…`);
    router.push("/admin");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        latitude: Number(latitude),
        longitude: Number(longitude),
        elevation: Number(elevation),
        timezone,
        inIsrael,
        dialect,
        candleLightingMinutes: Number(candleLightingMinutes),
        shabbatEndType,
        shabbatEndValue: Number(shabbatEndValue),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; status?: string; slug?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create organization.");
      return;
    }
    setMessage(
      data.status === "pending"
        ? `Created ${data.slug} — pending super-admin approval. You can still open admin.`
        : `Created ${data.slug}.`,
    );
    router.push("/admin");
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ marginTop: 0 }}>Set up your synagogue</h1>
        <Link href="/">Home</Link>
      </div>

      {pending.length > 0 ? (
        <section style={{ marginBottom: 28, padding: 16, border: "1px solid #334155", borderRadius: 8 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Pending invitations</h2>
          <ul style={{ paddingLeft: 18 }}>
            {pending.map((invite) => (
              <li key={invite.id} style={{ marginBottom: 8 }}>
                {invite.orgName} ({invite.role}){" "}
                <button type="button" disabled={busy} onClick={() => void acceptInvite(invite.token)}>
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <label>
          Organization name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          URL slug{" "}
          {slugAvailable === true ? (
            <span style={{ color: "#4ade80" }}>(available)</span>
          ) : slugAvailable === false ? (
            <span style={{ color: "#f87171" }}>(taken)</span>
          ) : null}
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            pattern="[a-z0-9-]+"
            style={inputStyle}
          />
        </label>

        <fieldset style={{ border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <legend>Location</legend>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 0 }}>
            Enter coordinates (address geocode lands with settings UI). Defaults = Jerusalem.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Latitude
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} style={inputStyle} />
            </label>
            <label>
              Longitude
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} style={inputStyle} />
            </label>
            <label>
              Elevation (m)
              <input value={elevation} onChange={(e) => setElevation(e.target.value)} style={inputStyle} />
            </label>
            <label>
              Timezone
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle} />
            </label>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
            <input type="checkbox" checked={inIsrael} onChange={(e) => setInIsrael(e.target.checked)} />
            In Israel
          </label>
        </fieldset>

        <fieldset style={{ border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <legend>Minhag</legend>
          <label>
            Dialect
            <select value={dialect} onChange={(e) => setDialect(e.target.value)} style={inputStyle}>
              <option value="Ashkenazi">Ashkenazi</option>
              <option value="Sephardi">Sephardi</option>
              <option value="Edot HaMizrach">Edot HaMizrach</option>
            </select>
          </label>
          <label>
            Candle lighting (minutes before sunset)
            <input
              value={candleLightingMinutes}
              onChange={(e) => setCandle(e.target.value)}
              style={inputStyle}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Shabbat end type
              <select value={shabbatEndType} onChange={(e) => setShabbatEndType(e.target.value)} style={inputStyle}>
                <option value="degrees">degrees</option>
                <option value="minutes">minutes</option>
              </select>
            </label>
            <label>
              Shabbat end value
              <input value={shabbatEndValue} onChange={(e) => setShabbatEndValue(e.target.value)} style={inputStyle} />
            </label>
          </div>
        </fieldset>

        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        {message ? <p style={{ color: "#4ade80" }}>{message}</p> : null}
        <button type="submit" disabled={busy || slugAvailable === false} style={buttonStyle}>
          {busy ? "Working…" : "Create organization"}
        </button>
      </form>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading…</main>}>
      <OnboardingInner />
    </Suspense>
  );
}

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  marginBottom: 8,
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  padding: "12px 16px",
  borderRadius: 6,
  border: "none",
  background: "#fbbf24",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
