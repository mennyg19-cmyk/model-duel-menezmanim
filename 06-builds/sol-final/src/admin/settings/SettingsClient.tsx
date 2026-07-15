"use client";

import { useEffect, useMemo, useState } from "react";
import { ZmanType, HalachicAuthority } from "@/core/halachic-opinions";
import { TEFILAH_DISPLAY_KEYS, type OrgSettingsBlob } from "@/domain/org-settings";

type SettingsPayload = {
  org: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    dialect: string;
    candleLightingMinutes: number;
    shabbatEndType: string;
    shabbatEndValue: number;
    rabbeinu_tam_minutes: number;
    amPmFormat: boolean;
    inIsrael: boolean;
  };
  settings: OrgSettingsBlob;
  zmanimConfigs: Array<{
    zmanType: string;
    authority: string;
    degreesBelow: number | null;
    fixedMinutes: number | null;
    earliest: string | null;
    latest: string | null;
    roundTo: number | null;
    offset: number | null;
  }>;
};

function timezones(): string[] {
  try {
    // F8 — real IANA list from the runtime, not a hardcoded subset.
    return (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf("timeZone");
  } catch {
    return ["Asia/Jerusalem", "America/New_York", "America/Los_Angeles", "Europe/London", "UTC"];
  }
}

const ZMAN_KEYS = Object.values(ZmanType);
const AUTHORITIES = Object.values(HalachicAuthority);

export function SettingsClient({ orgId, initial }: { orgId: string; initial: SettingsPayload }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tzOptions = useMemo(() => timezones(), []);

  const displayNames = data.settings.displayNames ?? {};
  const locale = data.settings.locale ?? {};
  const kiosk = data.settings.kiosk ?? {};
  const rabbeinuTam = data.settings.rabbeinuTam ?? {
    type: "minutes" as const,
    value: data.org.rabbeinu_tam_minutes,
  };

  useEffect(() => {
    setData(initial);
  }, [initial]);

  async function save(section: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/org/${orgId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
      const body = (await res.json()) as SettingsPayload & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Save failed (${res.status})`);
      setData(body);
      setMessage("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function setDisplayName(key: string, field: "english" | "hebrew", value: string) {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        displayNames: {
          ...prev.settings.displayNames,
          [key]: {
            ...prev.settings.displayNames?.[key],
            [field]: value,
          },
        },
      },
    }));
  }

  return (
    <div className="adm-page" data-tutorial="settings-page">
      <header className="adm-pageHead">
        <div>
          <p className="adm-eyebrow">Settings</p>
          <h1>{data.org.name}</h1>
        </div>
        {message ? <span className="adm-ok">{message}</span> : null}
      </header>
      {error ? <p className="adm-error">{error}</p> : null}

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Organization profile</h2>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => void save({ profile: { name: data.org.name } })}
          >
            Save profile
          </button>
        </div>
        <label>
          Name
          <input
            value={data.org.name}
            onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, name: e.target.value } }))}
          />
        </label>
        <p className="adm-muted">
          Slug: {data.org.slug} · Plan: {data.org.plan}
        </p>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Location</h2>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() =>
              void save({
                location: {
                  latitude: data.org.latitude,
                  longitude: data.org.longitude,
                  elevation: data.org.elevation,
                  timezone: data.org.timezone,
                  inIsrael: data.org.inIsrael,
                },
              })
            }
          >
            Save location
          </button>
        </div>
        <div className="adm-formGrid">
          <label>
            Latitude
            <input
              type="number"
              step="any"
              value={data.org.latitude}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, latitude: Number(e.target.value) } }))}
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              step="any"
              value={data.org.longitude}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, longitude: Number(e.target.value) } }))}
            />
          </label>
          <label>
            Elevation (m)
            <input
              type="number"
              step="any"
              value={data.org.elevation}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, elevation: Number(e.target.value) } }))}
            />
          </label>
          <label>
            Timezone
            <select
              value={data.org.timezone}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, timezone: e.target.value } }))}
            >
              {tzOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-check">
            <input
              type="checkbox"
              checked={data.org.inIsrael}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, inIsrael: e.target.checked } }))}
            />
            In Israel
          </label>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Zmanim / Halacha</h2>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() =>
              void save({
                halacha: {
                  dialect: data.org.dialect,
                  candleLightingMinutes: data.org.candleLightingMinutes,
                  shabbatEndType: data.org.shabbatEndType,
                  shabbatEndValue: data.org.shabbatEndValue,
                  amPmFormat: data.org.amPmFormat,
                  rabbeinuTam,
                },
                zmanimConfigs: data.zmanimConfigs,
              })
            }
          >
            Save halacha
          </button>
        </div>
        <div className="adm-formGrid">
          <label>
            Dialect
            <select
              value={data.org.dialect}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, dialect: e.target.value } }))}
            >
              <option value="Ashkenazi">Ashkenazi</option>
              <option value="Sephardi">Sephardi</option>
              <option value="Chabad">Chabad</option>
            </select>
          </label>
          <label>
            Candle lighting (minutes)
            <input
              type="number"
              value={data.org.candleLightingMinutes}
              onChange={(e) =>
                setData((p) => ({ ...p, org: { ...p.org, candleLightingMinutes: Number(e.target.value) } }))
              }
            />
          </label>
          <label>
            Shabbat end type
            <select
              value={data.org.shabbatEndType}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, shabbatEndType: e.target.value } }))}
            >
              <option value="degrees">Degrees</option>
              <option value="minutes">Minutes</option>
            </select>
          </label>
          <label>
            Shabbat end value
            <input
              type="number"
              step="any"
              value={data.org.shabbatEndValue}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, shabbatEndValue: Number(e.target.value) } }))}
            />
          </label>
          <label>
            Rabbeinu Tam type
            <select
              value={rabbeinuTam.type}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    rabbeinuTam: { ...rabbeinuTam, type: e.target.value as "minutes" | "degrees" },
                  },
                }))
              }
            >
              <option value="minutes">Minutes</option>
              <option value="degrees">Degrees</option>
            </select>
          </label>
          <label>
            Rabbeinu Tam value
            <input
              type="number"
              step="any"
              value={rabbeinuTam.value}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    rabbeinuTam: { ...rabbeinuTam, value: Number(e.target.value) },
                  },
                }))
              }
            />
          </label>
          <label className="adm-check">
            <input
              type="checkbox"
              checked={data.org.amPmFormat}
              onChange={(e) => setData((p) => ({ ...p, org: { ...p.org, amPmFormat: e.target.checked } }))}
            />
            AM/PM format
          </label>
        </div>

        <h3>Per-zman overrides</h3>
        <div className="adm-zmanConfigList">
          {ZMAN_KEYS.slice(0, 12).map((zmanType) => {
            const row = data.zmanimConfigs.find((c) => c.zmanType === zmanType) ?? {
              zmanType,
              authority: "GRA",
              degreesBelow: null,
              fixedMinutes: null,
              earliest: null,
              latest: null,
              roundTo: null,
              offset: null,
            };
            return (
              <div key={zmanType} className="adm-scheduleRow">
                <strong>{zmanType}</strong>
                <label>
                  Authority
                  <select
                    value={row.authority}
                    onChange={(e) => {
                      const next = { ...row, authority: e.target.value };
                      setData((p) => ({
                        ...p,
                        zmanimConfigs: [
                          ...p.zmanimConfigs.filter((c) => c.zmanType !== zmanType),
                          next,
                        ],
                      }));
                    }}
                  >
                    {AUTHORITIES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Offset
                  <input
                    type="number"
                    value={row.offset ?? 0}
                    onChange={(e) => {
                      const next = { ...row, offset: Number(e.target.value) };
                      setData((p) => ({
                        ...p,
                        zmanimConfigs: [
                          ...p.zmanimConfigs.filter((c) => c.zmanType !== zmanType),
                          next,
                        ],
                      }));
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>
        <p className="adm-muted">Showing first 12 zman types; save writes only edited overrides.</p>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Display / locale defaults</h2>
          <button type="button" className="button" disabled={busy} onClick={() => void save({ locale })}>
            Save locales
          </button>
        </div>
        <div className="adm-formGrid">
          {(["uiLocale", "boardDefaultLocale", "objectTextLocale"] as const).map((key) => (
            <label key={key}>
              {key}
              <select
                value={locale[key] ?? "en"}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    settings: { ...p.settings, locale: { ...locale, [key]: e.target.value } },
                  }))
                }
              >
                <option value="en">English</option>
                <option value="he">Hebrew</option>
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Kiosk / display prefs</h2>
          <button type="button" className="button" disabled={busy} onClick={() => void save({ kiosk })}>
            Save kiosk
          </button>
        </div>
        <div className="adm-formGrid">
          <label>
            Default display language
            <select
              value={kiosk.defaultDisplayLanguage ?? "he"}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    kiosk: { ...kiosk, defaultDisplayLanguage: e.target.value },
                  },
                }))
              }
            >
              <option value="he">Hebrew</option>
              <option value="en">English</option>
            </select>
          </label>
          {(
            [
              ["kioskMode", "Kiosk mode"],
              ["hideCursor", "Hide cursor"],
              ["autoStartOnBoot", "Auto-start on boot"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="adm-check">
              <input
                type="checkbox"
                checked={Boolean(kiosk[key])}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    settings: {
                      ...p.settings,
                      kiosk: { ...kiosk, [key]: e.target.checked },
                    },
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Display names</h2>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => void save({ displayNames })}
          >
            Save display names
          </button>
        </div>
        <div className="adm-displayNames">
          {[...ZMAN_KEYS.slice(0, 8), ...TEFILAH_DISPLAY_KEYS].map((key) => (
            <div key={key} className="adm-scheduleRow">
              <strong>{key}</strong>
              <label>
                English
                <input
                  value={displayNames[key]?.english ?? ""}
                  onChange={(e) => setDisplayName(key, "english", e.target.value)}
                />
              </label>
              <label>
                Hebrew
                <input
                  value={displayNames[key]?.hebrew ?? ""}
                  onChange={(e) => setDisplayName(key, "hebrew", e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-cardHead">
          <h2>Plan info</h2>
        </div>
        <p>
          Current plan: <strong>{data.org.plan}</strong>
        </p>
        <p className="adm-muted">Plan changes are managed by super-admin (Phase 10).</p>
      </section>
    </div>
  );
}
