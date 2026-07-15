"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HalachicAuthority, ZmanType } from "@/core/zman-types";
import { btn, btnAccent, card, field, input, tabBtn } from "@/admin/formStyles";

type ZmanRow = {
  zmanType: string;
  authority: string;
  degreesBelow: number | null;
  fixedMinutes: number | null;
  earliest: string | null;
  latest: string | null;
  roundTo: number | null;
  offset: number | null;
};

type OrgPayload = {
  name: string;
  slug: string;
  plan: string;
  status: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  inIsrael: boolean;
  dialect: string;
  candleLightingMinutes: number;
  shabbatEndType: string;
  shabbatEndValue: number;
  rabbeinuTamMinutes: number;
  amPmFormat: boolean;
  settings: Record<string, unknown>;
  planLimits: { screens: number; styles: number; members: number; label: string };
};

const TEFILAH_KEYS = [
  "mashiv_haruach",
  "yaaleh_veyavo",
  "hallel",
  "al_hanissim",
  "anenu",
  "neilah",
  "tal_umatar",
];

const ZMAN_KEYS = Object.values(ZmanType).filter((v) => typeof v === "string") as string[];
const AUTHORITIES = Object.values(HalachicAuthority).filter((v) => typeof v === "string") as string[];

function listTimezones(): string[] {
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
    if (typeof intl.supportedValuesOf === "function") {
      return intl.supportedValuesOf("timeZone");
    }
  } catch {
    /* fall through */
  }
  return [
    "Asia/Jerusalem",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "UTC",
  ];
}

type Tab = "profile" | "location" | "halacha" | "display" | "kiosk" | "names" | "plan";

/** P9 Settings — one Save (F7), real timezone list (F8). */
export function SettingsPage({ orgId }: { orgId: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [org, setOrg] = useState<OrgPayload | null>(null);
  const [zmanRows, setZmanRows] = useState<ZmanRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timezones = useMemo(() => listTimezones(), []);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/org/${orgId}/settings`);
    if (!res.ok) {
      setError("Could not load settings.");
      return;
    }
    const json = (await res.json()) as { org: OrgPayload; zmanimConfigs: ZmanRow[] };
    setOrg(json.org);
    setZmanRows(json.zmanimConfigs);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  function settingsBag(): Record<string, unknown> {
    return { ...(org?.settings ?? {}) };
  }

  function patchSettings(patch: Record<string, unknown>) {
    if (!org) return;
    setOrg({ ...org, settings: { ...settingsBag(), ...patch } });
  }

  function displayNames(): Record<string, { english?: string; hebrew?: string }> {
    const raw = settingsBag().displayNameOverrides;
    return (raw && typeof raw === "object" ? raw : {}) as Record<string, { english?: string; hebrew?: string }>;
  }

  function tefilahNames(): Record<string, { english?: string; hebrew?: string }> {
    const raw = settingsBag().tefilahDisplayNames;
    return (raw && typeof raw === "object" ? raw : {}) as Record<string, { english?: string; hebrew?: string }>;
  }

  function upsertZman(type: string) {
    if (zmanRows.some((z) => z.zmanType === type)) return;
    setZmanRows((rows) => [
      ...rows,
      {
        zmanType: type,
        authority: HalachicAuthority.GRA,
        degreesBelow: null,
        fixedMinutes: null,
        earliest: null,
        latest: null,
        roundTo: null,
        offset: null,
      },
    ]);
  }

  async function saveAll() {
    if (!org) return;
    setBusy(true);
    setError(null);
    const bag = { ...settingsBag() };
    // Sync Rabbeinu Tam column from typed pair (P9.3).
    if (bag.rabbeinuTamType === "minutes" && typeof bag.rabbeinuTamValue === "number") {
      org.rabbeinuTamMinutes = bag.rabbeinuTamValue;
    }
    const res = await fetch(`/api/org/${orgId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: org.name,
        latitude: org.latitude,
        longitude: org.longitude,
        elevation: org.elevation,
        timezone: org.timezone,
        inIsrael: org.inIsrael,
        dialect: org.dialect,
        candleLightingMinutes: org.candleLightingMinutes,
        shabbatEndType: org.shabbatEndType,
        shabbatEndValue: org.shabbatEndValue,
        rabbeinuTamMinutes: org.rabbeinuTamMinutes,
        amPmFormat: org.amPmFormat,
        settings: bag,
        zmanimConfigs: zmanRows,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Save failed (need admin).");
      return;
    }
    const json = (await res.json()) as { org: OrgPayload; zmanimConfigs: ZmanRow[]; savedAt: string };
    setOrg(json.org);
    setZmanRows(json.zmanimConfigs);
    setSavedAt(json.savedAt);
  }

  if (!org) {
    return <p style={{ color: "var(--admin-muted)" }}>{error ?? "Loading…"}</p>;
  }

  const rtType = (settingsBag().rabbeinuTamType as string) || "minutes";
  const rtValue = typeof settingsBag().rabbeinuTamValue === "number" ? (settingsBag().rabbeinuTamValue as number) : org.rabbeinuTamMinutes;

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "location", label: "Location" },
    { id: "halacha", label: "Halacha / zmanim" },
    { id: "display", label: "Display / locale" },
    { id: "kiosk", label: "Kiosk" },
    { id: "names", label: "Display names" },
    { id: "plan", label: "Plan" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Settings</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {savedAt ? <span style={{ fontSize: 12, color: "var(--admin-muted)" }}>Saved {new Date(savedAt).toLocaleTimeString()}</span> : null}
          <button type="button" style={btnAccent} disabled={busy} onClick={() => void saveAll()}>
            {busy ? "Saving…" : "Save all"}
          </button>
        </div>
      </div>
      <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>One Save writes profile, location, halacha, kiosk prefs, and display-name overrides together (F7).</p>
      {error ? <p style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" style={tabBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div style={card}>
          <label style={field}>
            Organization name
            <input style={input} value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
          </label>
          <label style={field}>
            Slug (read-only)
            <input style={input} value={org.slug} disabled />
          </label>
          <div style={{ fontSize: 13, color: "var(--admin-muted)" }}>Status: {org.status}</div>
        </div>
      )}

      {tab === "location" && (
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <label style={field}>
              Latitude
              <input
                type="number"
                step="any"
                style={input}
                value={org.latitude}
                onChange={(e) => setOrg({ ...org, latitude: Number(e.target.value) })}
              />
            </label>
            <label style={field}>
              Longitude
              <input
                type="number"
                step="any"
                style={input}
                value={org.longitude}
                onChange={(e) => setOrg({ ...org, longitude: Number(e.target.value) })}
              />
            </label>
            <label style={field}>
              Elevation (m)
              <input
                type="number"
                step="any"
                style={input}
                value={org.elevation}
                onChange={(e) => setOrg({ ...org, elevation: Number(e.target.value) })}
              />
            </label>
          </div>
          <label style={field}>
            Timezone (F8 — Intl list)
            <select style={input} value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={org.inIsrael} onChange={(e) => setOrg({ ...org, inIsrael: e.target.checked })} />
            In Israel
          </label>
        </div>
      )}

      {tab === "halacha" && (
        <div style={card}>
          <label style={field}>
            Dialect
            <select style={input} value={org.dialect} onChange={(e) => setOrg({ ...org, dialect: e.target.value })}>
              {["Ashkenazi", "Sephardi", "Edot HaMizrach"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label style={field}>
            Candle lighting (minutes before)
            <input
              type="number"
              style={input}
              value={org.candleLightingMinutes}
              onChange={(e) => setOrg({ ...org, candleLightingMinutes: Number(e.target.value) || 0 })}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={field}>
              Shabbat end type
              <select style={input} value={org.shabbatEndType} onChange={(e) => setOrg({ ...org, shabbatEndType: e.target.value })}>
                <option value="degrees">degrees</option>
                <option value="minutes">minutes</option>
              </select>
            </label>
            <label style={field}>
              Shabbat end value
              <input
                type="number"
                step="any"
                style={input}
                value={org.shabbatEndValue}
                onChange={(e) => setOrg({ ...org, shabbatEndValue: Number(e.target.value) })}
              />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={field}>
              Rabbeinu Tam type
              <select
                style={input}
                value={rtType}
                onChange={(e) => patchSettings({ rabbeinuTamType: e.target.value, rabbeinuTamValue: rtValue })}
              >
                <option value="minutes">minutes</option>
                <option value="degrees">degrees</option>
              </select>
            </label>
            <label style={field}>
              Rabbeinu Tam value
              <input
                type="number"
                step="any"
                style={input}
                value={rtValue}
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  patchSettings({ rabbeinuTamType: rtType, rabbeinuTamValue: v });
                  if (rtType === "minutes") setOrg({ ...org, rabbeinuTamMinutes: v });
                }}
              />
            </label>
          </div>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={org.amPmFormat} onChange={(e) => setOrg({ ...org, amPmFormat: e.target.checked })} />
            Prefer AM/PM format
          </label>

          <h3 style={{ fontSize: 14 }}>Per-zman overrides (D10)</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <select
              style={input}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) upsertZman(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Add zman override…</option>
              {ZMAN_KEYS.filter((k) => !zmanRows.some((z) => z.zmanType === k)).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          {zmanRows.map((z, i) => (
            <div key={z.zmanType} style={{ ...card, background: "transparent" }}>
              <strong style={{ fontSize: 13 }}>{z.zmanType}</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                <label style={field}>
                  Authority
                  <select
                    style={input}
                    value={z.authority}
                    onChange={(e) => {
                      const next = zmanRows.slice();
                      next[i] = { ...z, authority: e.target.value };
                      setZmanRows(next);
                    }}
                  >
                    {AUTHORITIES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={field}>
                  Degrees below
                  <input
                    type="number"
                    step="any"
                    style={input}
                    value={z.degreesBelow ?? ""}
                    onChange={(e) => {
                      const next = zmanRows.slice();
                      next[i] = { ...z, degreesBelow: e.target.value === "" ? null : Number(e.target.value) };
                      setZmanRows(next);
                    }}
                  />
                </label>
                <label style={field}>
                  Fixed minutes
                  <input
                    type="number"
                    style={input}
                    value={z.fixedMinutes ?? ""}
                    onChange={(e) => {
                      const next = zmanRows.slice();
                      next[i] = { ...z, fixedMinutes: e.target.value === "" ? null : Number(e.target.value) };
                      setZmanRows(next);
                    }}
                  />
                </label>
                <label style={field}>
                  Offset
                  <input
                    type="number"
                    style={input}
                    value={z.offset ?? ""}
                    onChange={(e) => {
                      const next = zmanRows.slice();
                      next[i] = { ...z, offset: e.target.value === "" ? null : Number(e.target.value) };
                      setZmanRows(next);
                    }}
                  />
                </label>
              </div>
              <button type="button" style={btn} onClick={() => setZmanRows(zmanRows.filter((_, j) => j !== i))}>
                Remove override
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "display" && (
        <div style={card}>
          <label style={field}>
            Board default locale (display board)
            <select
              style={input}
              value={(settingsBag().defaultDisplayLanguage as string) || "hebrew"}
              onChange={(e) => patchSettings({ defaultDisplayLanguage: e.target.value })}
              data-testid="board-default-locale"
            >
              <option value="hebrew">hebrew</option>
              <option value="english">english</option>
              <option value="both">both</option>
            </select>
          </label>
          <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 0 }}>
            UI locale (menus/landing) is EN/עברית in the sidebar — separate from the board. Object text locale is per
            widget in the editor (hebrew / english / both).
          </p>
          <label style={field}>
            Locale tag (formatting)
            <input
              style={input}
              value={(settingsBag().locale as string) || "he-IL"}
              onChange={(e) => patchSettings({ locale: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === "kiosk" && (
        <div style={card}>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(settingsBag().kioskMode)}
              onChange={(e) => patchSettings({ kioskMode: e.target.checked })}
            />
            Kiosk mode
          </label>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(settingsBag().hideCursor)}
              onChange={(e) => patchSettings({ hideCursor: e.target.checked })}
            />
            Hide cursor
          </label>
          <label style={{ ...field, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(settingsBag().autoStartOnBoot)}
              onChange={(e) => patchSettings({ autoStartOnBoot: e.target.checked })}
            />
            Auto-start on boot (desktop)
          </label>
        </div>
      )}

      {tab === "names" && (
        <div style={card}>
          <h3 style={{ fontSize: 14, marginTop: 0 }}>Zman labels (EN + HE)</h3>
          <div style={{ maxHeight: 320, overflow: "auto" }}>
            {ZMAN_KEYS.slice(0, 32).map((key) => {
              const cur = displayNames()[key] ?? {};
              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, alignSelf: "center" }}>{key}</span>
                  <input
                    style={input}
                    placeholder="English"
                    value={cur.english ?? ""}
                    onChange={(e) =>
                      patchSettings({
                        displayNameOverrides: { ...displayNames(), [key]: { ...cur, english: e.target.value } },
                      })
                    }
                  />
                  <input
                    style={input}
                    placeholder="עברית"
                    dir="rtl"
                    value={cur.hebrew ?? ""}
                    onChange={(e) =>
                      patchSettings({
                        displayNameOverrides: { ...displayNames(), [key]: { ...cur, hebrew: e.target.value } },
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
          <h3 style={{ fontSize: 14 }}>Tefilah labels</h3>
          {TEFILAH_KEYS.map((key) => {
            const cur = tefilahNames()[key] ?? {};
            return (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 11, alignSelf: "center" }}>{key}</span>
                <input
                  style={input}
                  placeholder="English"
                  value={cur.english ?? ""}
                  onChange={(e) =>
                    patchSettings({
                      tefilahDisplayNames: { ...tefilahNames(), [key]: { ...cur, english: e.target.value } },
                    })
                  }
                />
                <input
                  style={input}
                  placeholder="עברית"
                  dir="rtl"
                  value={cur.hebrew ?? ""}
                  onChange={(e) =>
                    patchSettings({
                      tefilahDisplayNames: { ...tefilahNames(), [key]: { ...cur, hebrew: e.target.value } },
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {tab === "plan" && (
        <div style={card}>
          <p>
            Plan: <strong>{org.planLimits.label}</strong> ({org.plan})
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--admin-muted)" }}>
            <li>Screens: {org.planLimits.screens}</li>
            <li>Styles: {org.planLimits.styles}</li>
            <li>Members: {org.planLimits.members}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
