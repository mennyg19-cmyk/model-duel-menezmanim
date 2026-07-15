"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

type PendingInvite = {
  id: string;
  token: string;
  role: string;
  organization: { name: string; slug: string; status: string };
};

type MeData = {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  memberships: Array<{
    orgId: string;
    orgName: string;
    orgSlug: string;
    orgStatus: string;
    role: string;
  }>;
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-shell">
          <div className="auth-card">
            <p className="auth-copy">Loading onboarding…</p>
          </div>
        </main>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"choose" | "create" | "pending">("choose");
  const [me, setMe] = useState<MeData | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slugStatus, setSlugStatus] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [latitude, setLatitude] = useState("31.7683");
  const [longitude, setLongitude] = useState("35.2137");
  const [elevation, setElevation] = useState("780");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [inIsrael, setInIsrael] = useState(true);
  const [dialect, setDialect] = useState("Ashkenazi");
  const [candleLightingMinutes, setCandleLightingMinutes] = useState("18");
  const [shabbatEndType, setShabbatEndType] = useState("degrees");
  const [shabbatEndValue, setShabbatEndValue] = useState("8.5");

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setTimezone("Asia/Jerusalem");
    }
  }, []);

  useEffect(() => {
    const suggested = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setOrgSlug(suggested);
  }, [orgName]);

  useEffect(() => {
    if (!orgSlug) {
      setSlugStatus("");
      return;
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(`/api/onboarding?slug=${encodeURIComponent(orgSlug)}`);
      if (!response.ok) return;
      const data = (await response.json()) as { available: boolean };
      setSlugStatus(data.available ? "Slug is available" : "Slug is already taken");
    }, 250);
    return () => window.clearTimeout(handle);
  }, [orgSlug]);

  useEffect(() => {
    const init = async () => {
      try {
        const meResponse = await fetch("/api/me");
        if (meResponse.status === 401) {
          router.push("/login");
          return;
        }
        if (!meResponse.ok) {
          setError("Could not load your account");
          return;
        }
        const meData = (await meResponse.json()) as MeData;
        setMe(meData);

        const active = meData.memberships.filter((membership) => membership.orgStatus === "active");
        if (active.length > 0) {
          router.push("/admin");
          return;
        }
        if (meData.memberships.some((membership) => membership.orgStatus === "pending")) {
          setMode("pending");
        }

        const inviteToken = searchParams.get("invite");
        if (inviteToken) {
          const acceptResponse = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "accept-invite", token: inviteToken }),
          });
          if (acceptResponse.ok) {
            router.push("/admin");
            return;
          }
        }

        const invitesResponse = await fetch("/api/invites/pending");
        if (invitesResponse.ok) {
          setPendingInvites((await invitesResponse.json()) as PendingInvite[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onboarding failed to load");
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [router, searchParams]);

  async function handleCreateOrg(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-org",
          name: orgName,
          slug: orgSlug,
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
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not create organization");
        return;
      }
      setMode("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAcceptInvite(token: string) {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not accept invite");
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept invite");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="auth-shell">
        <div className="auth-card">
          <p className="auth-copy">Loading onboarding…</p>
        </div>
      </main>
    );
  }

  if (mode === "pending") {
    return (
      <main className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Pending approval</p>
          <h1>Your synagogue is waiting for approval</h1>
          <p className="auth-copy">
            New organizations stay pending until a super-admin activates them. You can leave this
            page and sign back in later.
          </p>
          {me ? (
            <p className="auth-hint">
              Signed in as {me.name} ({me.email})
            </p>
          ) : null}
          <Link className="button button-secondary" href="/">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (mode === "create") {
    return (
      <main className="auth-shell auth-shell-wide">
        <form className="auth-card auth-card-wide" onSubmit={handleCreateOrg}>
          <p className="eyebrow">Create organization</p>
          <h1>Set up your synagogue</h1>
          <div className="form-grid">
            <label>
              Name
              <input value={orgName} onChange={(event) => setOrgName(event.target.value)} required />
            </label>
            <label>
              Slug
              <input value={orgSlug} onChange={(event) => setOrgSlug(event.target.value)} required />
              <span className="field-hint">{slugStatus}</span>
            </label>
            <label>
              Latitude
              <input value={latitude} onChange={(event) => setLatitude(event.target.value)} required />
            </label>
            <label>
              Longitude
              <input
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                required
              />
            </label>
            <label>
              Elevation (m)
              <input value={elevation} onChange={(event) => setElevation(event.target.value)} />
            </label>
            <label>
              Timezone
              <input value={timezone} onChange={(event) => setTimezone(event.target.value)} required />
            </label>
            <label>
              Dialect / minhag
              <select value={dialect} onChange={(event) => setDialect(event.target.value)}>
                <option value="Ashkenazi">Ashkenazi</option>
                <option value="Sephardi">Sephardi</option>
                <option value="EdotHaMizrach">Edot HaMizrach</option>
              </select>
            </label>
            <label>
              Candle lighting (minutes before sunset)
              <input
                value={candleLightingMinutes}
                onChange={(event) => setCandleLightingMinutes(event.target.value)}
              />
            </label>
            <label>
              Shabbat end type
              <select
                value={shabbatEndType}
                onChange={(event) => setShabbatEndType(event.target.value)}
              >
                <option value="degrees">Degrees</option>
                <option value="minutes">Minutes</option>
              </select>
            </label>
            <label>
              Shabbat end value
              <input
                value={shabbatEndValue}
                onChange={(event) => setShabbatEndValue(event.target.value)}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={inIsrael}
                onChange={(event) => setInIsrael(event.target.checked)}
              />
              Location is in Israel
            </label>
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="hero-actions">
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setMode("choose")}
            >
              Back
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="auth-shell auth-shell-wide">
      <div className="auth-card auth-card-wide">
        <p className="eyebrow">Onboarding</p>
        <h1>Join or create a synagogue</h1>
        <p className="auth-copy">
          {me
            ? `Signed in as ${me.name}. Create a new organization or accept an invitation.`
            : "Choose how to get access."}
        </p>
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="choice-grid">
          <button className="choice-card" type="button" onClick={() => setMode("create")}>
            <strong>Create organization</strong>
            <span>Name, location, minhag, then pending approval.</span>
          </button>
          <div className="choice-card static">
            <strong>Pending invitations</strong>
            {pendingInvites.length === 0 ? (
              <span>No open invites for this email.</span>
            ) : (
              <ul className="invite-list">
                {pendingInvites.map((invite) => (
                  <li key={invite.id}>
                    <div>
                      <div>{invite.organization.name}</div>
                      <small>
                        {invite.role} · {invite.organization.slug}
                      </small>
                    </div>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={submitting}
                      onClick={() => void handleAcceptInvite(invite.token)}
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
