"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TabId = "zmanim" | "schedule" | "announcements";

type MobilePayload = {
  org: { slug: string; name: string; nameHebrew: string | null; timezone: string };
  locales: { uiLocale: string; boardDefaultLocale: string; objectTextLocale: string };
  zmanim: Array<{
    type: string;
    label: string;
    hebrewLabel: string;
    category: string;
    isHighlighted: boolean;
    displayTime: string | null;
  }>;
  calendar: {
    jewishDate: { formattedHebrew: string; formattedEnglish: string };
    parsha: { parsha: string; parshaHebrew: string; upcoming: string; upcomingHebrew: string };
    dafYomi: { formatted: string; formattedHebrew: string };
    holiday: { name: string; nameHebrew: string };
  };
  schedule: Array<{
    id: string;
    name: string;
    hebrewName: string;
    type: string;
    room: string | null;
    displayTime: string | null;
    isNext: boolean;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    titleHebrew: string | null;
    content: string;
    contentHebrew: string | null;
    priority: number;
  }>;
};

const TABS: { id: TabId; en: string; he: string }[] = [
  { id: "zmanim", en: "Zmanim", he: "זמנים" },
  { id: "schedule", en: "Schedule", he: "לוח זמנים" },
  { id: "announcements", en: "News", he: "הודעות" },
];

const CAT_ORDER = ["morning", "afternoon", "evening", "other"];
const CAT_LABELS: Record<string, { en: string; he: string }> = {
  morning: { en: "Morning", he: "בוקר" },
  afternoon: { en: "Afternoon", he: "אחר הצהריים" },
  evening: { en: "Evening", he: "ערב" },
  other: { en: "Other", he: "אחר" },
};

const TYPE_ORDER = ["shacharit", "mincha", "maariv", "other"];
const TYPE_LABELS: Record<string, string> = {
  shacharit: "Shacharit",
  mincha: "Mincha",
  maariv: "Maariv",
  other: "Other",
};
const TYPE_COLORS: Record<string, string> = {
  shacharit: "#F59E0B",
  mincha: "#F97316",
  maariv: "#6366F1",
  other: "#10B981",
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function nextSaturday(from: Date): Date {
  const d = new Date(from);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 6 ? 7 : 6 - dow));
  return d;
}

function formatGreg(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatHe(d: Date): string {
  try {
    return d.toLocaleDateString("he-IL-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MobileClient({ orgSlug, initialLang }: { orgSlug: string; initialLang: "en" | "he" }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [tab, setTab] = useState<TabId>("zmanim");
  const [uiLocale, setUiLocale] = useState<"en" | "he">(initialLang);
  const [data, setData] = useState<MobilePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCal, setShowCal] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [openAnnouncement, setOpenAnnouncement] = useState<string | null>(null);

  const isHe = uiLocale === "he";

  const load = useCallback(async (date: Date, lang: "en" | "he") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/mobile?org=${encodeURIComponent(orgSlug)}&date=${encodeURIComponent(date.toISOString())}&lang=${lang}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      setData((await res.json()) as MobilePayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load(selectedDate, uiLocale);
  }, [load, selectedDate, uiLocale]);

  const zmanGroups = useMemo(() => {
    const groups: Record<string, MobilePayload["zmanim"]> = {};
    for (const z of data?.zmanim ?? []) {
      const cat = z.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(z);
    }
    return groups;
  }, [data]);

  const scheduleGroups = useMemo(() => {
    const groups: Record<string, MobilePayload["schedule"]> = {};
    for (const s of data?.schedule ?? []) {
      const type = s.type || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(s);
    }
    return groups;
  }, [data]);

  const days = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startPad = new Date(viewYear, viewMonth, 1).getDay();

  return (
    <div className="mob-app" dir={isHe ? "rtl" : "ltr"}>
      <header className="mob-header">
        <div className="mob-headerTitle">{data?.org.name ?? orgSlug}</div>
        {data?.org.nameHebrew && <div className="mob-headerSub" dir="rtl">{data.org.nameHebrew}</div>}
        {data?.calendar && (
          <div className="mob-headerMeta">
            <span>{isHe ? data.calendar.jewishDate.formattedHebrew : data.calendar.jewishDate.formattedEnglish}</span>
            {(data.calendar.parsha.upcoming || data.calendar.parsha.parsha) && (
              <span>
                {isHe
                  ? data.calendar.parsha.parshaHebrew || data.calendar.parsha.upcomingHebrew
                  : data.calendar.parsha.parsha || data.calendar.parsha.upcoming}
              </span>
            )}
            {data.calendar.dafYomi.formatted && (
              <span>{isHe ? data.calendar.dafYomi.formattedHebrew : data.calendar.dafYomi.formatted}</span>
            )}
          </div>
        )}
        <div className="mob-localeRow">
          <button type="button" className={uiLocale === "en" ? "mob-chipActive" : "mob-chip"} onClick={() => setUiLocale("en")}>
            EN
          </button>
          <button type="button" className={uiLocale === "he" ? "mob-chipActive" : "mob-chip"} onClick={() => setUiLocale("he")}>
            עב
          </button>
          <span className="mob-localeHint">
            UI {data?.locales.uiLocale ?? uiLocale} · board {data?.locales.boardDefaultLocale ?? "en"}
          </span>
        </div>
      </header>

      <div className="mob-dateBar">
        <button type="button" className="mob-dateBtn" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
          ‹
        </button>
        <button
          type="button"
          className="mob-dateCenter"
          onClick={() => {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
            setShowCal((v) => !v);
          }}
        >
          <strong>{formatGreg(selectedDate)}</strong>
          <span>{formatHe(selectedDate)}</span>
        </button>
        <button type="button" className="mob-dateBtn" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          ›
        </button>
      </div>

      <div className="mob-quickRow">
        <button type="button" className="mob-chip" onClick={() => setSelectedDate(new Date())}>
          {isHe ? "היום" : "Today"}
        </button>
        <button type="button" className="mob-chip" onClick={() => setSelectedDate(nextSaturday(selectedDate))}>
          {isHe ? "שבת" : "Shabbat"}
        </button>
      </div>

      {showCal && (
        <div className="mob-monthCal">
          <div className="mob-monthNav">
            <button
              type="button"
              onClick={() => {
                const d = new Date(viewYear, viewMonth - 1, 1);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }}
            >
              ‹
            </button>
            <span>
              {new Date(viewYear, viewMonth, 1).toLocaleDateString(isHe ? "he-IL" : "en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => {
                const d = new Date(viewYear, viewMonth + 1, 1);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }}
            >
              ›
            </button>
          </div>
          <div className="mob-monthGrid">
            {Array.from({ length: startPad }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const cell = new Date(viewYear, viewMonth, day);
              return (
                <button
                  key={ymd(cell)}
                  type="button"
                  className={sameDay(cell, selectedDate) ? "mob-dayActive" : "mob-day"}
                  onClick={() => {
                    setSelectedDate(cell);
                    setShowCal(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="mob-tabBar">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? "mob-tabActive" : "mob-tab"} onClick={() => setTab(t.id)}>
            {isHe ? t.he : t.en}
          </button>
        ))}
      </nav>

      <main className="mob-main">
        {loading && <div className="mob-empty">{isHe ? "טוען…" : "Loading…"}</div>}
        {error && <div className="mob-error">{error}</div>}
        {!loading && !error && tab === "zmanim" && (
          <div>
            {CAT_ORDER.filter((c) => zmanGroups[c]?.length).map((cat) => (
              <section key={cat} className="mob-category">
                <div className="mob-categoryLabel">{isHe ? CAT_LABELS[cat].he : CAT_LABELS[cat].en}</div>
                {zmanGroups[cat].map((z) => (
                  <div key={z.type} className={z.isHighlighted ? "mob-rowHighlight" : "mob-row"}>
                    <span className="mob-rowLabel">
                      {isHe ? z.hebrewLabel : z.label}
                      {z.isHighlighted && <span className="mob-nowBadge">{isHe ? "עכשיו" : "NOW"}</span>}
                    </span>
                    <span className="mob-rowValue" dir="ltr">
                      {z.displayTime ?? "—"}
                    </span>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}

        {!loading && !error && tab === "schedule" && (
          <div>
            {data?.schedule.length === 0 && <div className="mob-empty">{isHe ? "אין מניינים" : "No minyans for this day"}</div>}
            {TYPE_ORDER.filter((t) => scheduleGroups[t]?.length).map((type) => (
              <section key={type} className="mob-category">
                <div className="mob-sectionHeader">
                  <span className="mob-typeDot" style={{ backgroundColor: TYPE_COLORS[type] }} />
                  <span className="mob-sectionLabel">{TYPE_LABELS[type]}</span>
                </div>
                {scheduleGroups[type].map((item) => (
                  <div key={item.id} className={item.isNext ? "mob-schedRowHighlight" : "mob-schedRow"}>
                    <span className="mob-schedTime" dir="ltr">
                      {item.displayTime ?? "—"}
                    </span>
                    <div className="mob-schedName">
                      <strong>{isHe ? item.hebrewName || item.name : item.name}</strong>
                      {item.room && <span className="mob-room">{item.room}</span>}
                    </div>
                    {item.isNext && <span className="mob-nextBadge">{isHe ? "הבא" : "NEXT"}</span>}
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}

        {!loading && !error && tab === "announcements" && (
          <div>
            {data?.announcements.length === 0 && <div className="mob-empty">{isHe ? "אין הודעות" : "No announcements"}</div>}
            {data?.announcements.map((a) => {
              const open = openAnnouncement === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="mob-announceCard"
                  onClick={() => setOpenAnnouncement(open ? null : a.id)}
                >
                  <div className="mob-announceTop">
                    <strong>{isHe && a.titleHebrew ? a.titleHebrew : a.title}</strong>
                    {a.priority > 0 && <span className="mob-priority">P{a.priority}</span>}
                  </div>
                  {open && <p className="mob-announceBody">{isHe && a.contentHebrew ? a.contentHebrew : a.content}</p>}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
