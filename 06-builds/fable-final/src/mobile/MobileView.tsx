"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { SharedBoardData, SnapshotZman } from "@/core/board/types";

const MORNING = new Set([
  "ALOS",
  "ALOS_TUKACHINSKY",
  "MISHEYAKIR",
  "MISHEYAKIR_TUKACHINSKY",
  "HANETZ",
  "HANETZ_TUKACHINSKY",
  "SOF_ZMAN_SHMA",
  "SOF_ZMAN_SHMA_TUKACHINSKY",
  "SOF_ZMAN_SHMA_MGA",
  "SOF_ZMAN_SHMA_MGA_TUKACHINSKY",
  "SOF_ZMAN_TEFILLAH",
  "SOF_ZMAN_TEFILLAH_TUKACHINSKY",
  "SOF_ZMAN_TEFILLAH_MGA",
  "SOF_ZMAN_TEFILLAH_MGA_TUKACHINSKY",
  "CHATZOS",
]);
const EVENING = new Set([
  "SHKIAH",
  "SHKIAH_TUKACHINSKY",
  "TZAIS",
  "TZAIS_TUKACHINSKY",
  "CANDLE_LIGHTING",
  "CANDLE_LIGHTING_TUKACHINSKY",
  "HAVDALAH",
  "HAVDALAH_TUKACHINSKY",
  "RABBEINU_TAM_END",
  "RABBEINU_TAM_TUKACHINSKY",
  "CHATZOS_HALAILA",
]);

function bucketOf(type: string): "morning" | "afternoon" | "evening" {
  if (MORNING.has(type)) return "morning";
  if (EVENING.has(type)) return "evening";
  return "afternoon";
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextFriday(fromIso: string): string {
  const d = new Date(fromIso);
  const day = d.getUTCDay();
  const add = day === 5 ? 7 : (5 - day + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

const MINYAN_TYPE_LABELS: Record<string, string> = {
  shacharit: "Shacharit",
  mincha: "Mincha",
  maariv: "Maariv",
  other: "Other",
};

const TYPE_COLOR: Record<string, string> = {
  shacharit: "#2563eb",
  mincha: "#d97706",
  maariv: "#7c3aed",
  other: "#64748b",
};

function priorityLabel(p: number | undefined): string | null {
  if (p == null) return null;
  if (p >= 10) return "High";
  if (p >= 5) return "Med";
  return "Low";
}

export function MobileView({
  orgSlug,
  orgName,
  effectiveDate,
  hasDateOverride,
  shared,
}: {
  orgSlug: string;
  orgName: string;
  effectiveDate: string;
  hasDateOverride: boolean;
  shared: SharedBoardData;
}) {
  const router = useRouter();
  const { timezone, calendarByOffset, zmanimByOffset, minyanim, announcements } = shared;
  const [openAnnouncement, setOpenAnnouncement] = useState<string | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
      }),
    [timezone],
  );
  const fmt = (iso: string | null) => (iso ? timeFmt.format(new Date(iso)) : "—");

  const calendar = calendarByOffset["0"];
  const zmanim = useMemo(() => zmanimByOffset["0"] ?? [], [zmanimByOffset]);

  const nextZmanType = useMemo(() => {
    if (hasDateOverride) return null;
    const upcoming = zmanim
      .filter((z) => z.time && new Date(z.time).getTime() > nowMs)
      .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());
    return upcoming[0]?.type ?? null;
  }, [zmanim, nowMs, hasDateOverride]);

  const nextMinyanId = useMemo(() => {
    if (hasDateOverride) return null;
    const upcoming = minyanim
      .filter((m) => m.time && new Date(m.time).getTime() > nowMs)
      .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());
    return upcoming[0]?.id ?? null;
  }, [minyanim, nowMs, hasDateOverride]);

  const buckets: Record<"morning" | "afternoon" | "evening", SnapshotZman[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const z of zmanim) buckets[bucketOf(z.type)].push(z);

  const minyanGroups = useMemo(() => {
    const order = ["shacharit", "mincha", "maariv", "other"];
    const byType = new Map<string, typeof minyanim>();
    for (const m of [...minyanim].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const list = byType.get(m.type) ?? [];
      list.push(m);
      byType.set(m.type, list);
    }
    return order.filter((t) => byType.has(t)).map((t) => ({ type: t, minyanim: byType.get(t)! }));
  }, [minyanim]);

  const goToDate = (iso: string) => {
    setShowCal(false);
    router.push(`/mobile?org=${encodeURIComponent(orgSlug)}&date=${iso}`);
  };
  const goToday = () => {
    setShowCal(false);
    router.push(`/mobile?org=${encodeURIComponent(orgSlug)}`);
  };

  const dateYmd = effectiveDate.slice(0, 10);
  const gregLabel = new Date(effectiveDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  });

  const card: CSSProperties = {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
    marginBottom: 12,
    overflow: "hidden",
  };
  const badge: CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "2px 6px",
    borderRadius: 4,
    background: "#0f172a",
    color: "#fff",
  };

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: "20px 16px", fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
      <header style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>{orgName}</h1>
        {calendar && (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#475569" }} dir="rtl">
            {calendar.date.formattedHebrew}
          </p>
        )}
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{gregLabel}</p>
        {calendar?.parsha?.parshaHebrew && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569" }} dir="rtl">
            פרשת {calendar.parsha.parshaHebrew}
          </p>
        )}
        {calendar?.dafYomi?.formatted && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{calendar.dafYomi.formatted}</p>
        )}
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" onClick={() => goToDate(shiftDate(effectiveDate, -1))} style={navBtn} aria-label="Previous day">
          ←
        </button>
        <button type="button" onClick={goToday} style={{ ...navBtn, flex: 1 }}>
          {hasDateOverride ? "Today" : "Today ✓"}
        </button>
        <button type="button" onClick={() => goToDate(shiftDate(effectiveDate, 1))} style={navBtn} aria-label="Next day">
          →
        </button>
        <button type="button" onClick={() => goToDate(nextFriday(effectiveDate))} style={navBtn}>
          Shabbat
        </button>
        <button type="button" onClick={() => setShowCal((v) => !v)} style={navBtn}>
          Calendar
        </button>
      </div>

      {showCal ? (
        <div style={{ ...card, padding: 12, marginBottom: 16 }}>
          <label style={{ fontSize: 13, display: "block" }}>
            Jump to date
            <input
              type="date"
              value={dateYmd}
              onChange={(e) => {
                if (e.target.value) goToDate(e.target.value);
              }}
              style={{ display: "block", width: "100%", marginTop: 6, padding: 8, borderRadius: 6, border: "1px solid #cbd5e1" }}
            />
          </label>
        </div>
      ) : null}

      <section>
        {(["morning", "afternoon", "evening"] as const).map((bucket) =>
          buckets[bucket].length === 0 ? null : (
            <div key={bucket} style={card}>
              <div style={{ padding: "10px 12px", fontSize: 12, color: "#64748b", textTransform: "capitalize", borderBottom: "1px solid #f1f5f9" }}>
                {bucket}
              </div>
              {buckets[bucket].map((z) => (
                <div key={z.type} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #f8fafc", fontSize: 14 }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {z.label}
                    {z.type === nextZmanType ? <span style={badge}>Now</span> : null}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(z.time)}</span>
                </div>
              ))}
            </div>
          ),
        )}
      </section>

      {minyanGroups.length > 0 ? (
        <section style={{ marginTop: 8 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Minyanim</h2>
          {minyanGroups.map((group) => (
            <div key={group.type} style={{ ...card, borderLeft: `4px solid ${TYPE_COLOR[group.type] ?? "#64748b"}` }}>
              <div style={{ padding: "10px 12px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                {MINYAN_TYPE_LABELS[group.type] ?? group.type}
              </div>
              {group.minyanim.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", fontSize: 14 }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {m.name}
                    {m.room ? <span style={{ fontSize: 11, color: "#94a3b8" }}>· {m.room}</span> : null}
                    {m.id === nextMinyanId ? <span style={badge}>Next</span> : null}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(m.time)}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section style={{ marginTop: 8 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Announcements</h2>
          {announcements.map((a) => {
            const isOpen = openAnnouncement === a.id;
            const pl = priorityLabel(a.priority ?? a.sortOrder);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setOpenAnnouncement(isOpen ? null : a.id)}
                style={{ ...card, display: "block", width: "100%", textAlign: "left", cursor: "pointer", padding: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <strong style={{ fontSize: 14 }}>{a.title || (isOpen ? null : (a.hebrewText || a.text).slice(0, 48))}</strong>
                  {pl ? (
                    <span style={{ ...badge, background: pl === "High" ? "#b91c1c" : pl === "Med" ? "#b45309" : "#64748b" }}>{pl}</span>
                  ) : null}
                </div>
                {isOpen ? (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {a.hebrewText ? <div dir="rtl">{a.hebrewText}</div> : null}
                    <div>{a.text}</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.hebrewText || a.text}
                  </div>
                )}
              </button>
            );
          })}
        </section>
      ) : null}

      <footer style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>Powered by MenEZmanim</footer>
    </main>
  );
}

const navBtn: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
};
