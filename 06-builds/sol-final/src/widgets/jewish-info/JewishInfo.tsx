// === What's in this file ===
// W8 — the Jewish calendar info panel. Pulls the day's calendar bundle out of
// the snapshot (Hebrew date, parsha, holiday, omer, daf yomi, tefilah notes) and
// shows the chosen items in order, in the board's language.
//
// content options: daysAhead, showItems (per-item on/off), itemOrder, layout
//   (vertical|horizontal), horizontalSeparator, itemTitles (per-item label mode).

import type { ReactNode } from "react";
import type { WidgetRenderProps } from "@/widgets/types";
import type { CalendarBundle } from "@/core/board/types";

type InfoItem = "dayOfWeek" | "date" | "parsha" | "holiday" | "omer" | "dafYomi" | "tefilah";
export type TitleMode = "hidden" | "default" | "custom" | "inline";

type JewishInfoContent = {
  daysAhead?: number;
  showItems?: Partial<Record<InfoItem, boolean>>;
  itemOrder?: InfoItem[];
  layout?: "vertical" | "horizontal";
  horizontalSeparator?: string;
  itemTitles?: Partial<Record<InfoItem, { mode: TitleMode; text?: string }>>;
};

const DEFAULT_ORDER: InfoItem[] = ["dayOfWeek", "date", "parsha", "holiday", "omer", "dafYomi", "tefilah"];

export const INFO_ITEM_LABELS: Record<InfoItem, { en: string; he: string }> = {
  dayOfWeek: { en: "Day", he: "יום" },
  date: { en: "Date", he: "תאריך" },
  parsha: { en: "Parsha", he: "פרשה" },
  holiday: { en: "Holiday", he: "חג" },
  omer: { en: "Omer", he: "עומר" },
  dafYomi: { en: "Daf Yomi", he: "דף יומי" },
  tefilah: { en: "Tefilah", he: "תפילה" },
};
const DEFAULT_SHOW: Record<InfoItem, boolean> = {
  dayOfWeek: false,
  date: true,
  parsha: true,
  holiday: true,
  omer: true,
  dafYomi: true,
  tefilah: true,
};

const TEFILAH_LABELS_HE: Record<string, string> = {
  mashivHaruach: "משיב הרוח",
  moridHatal: "מוריד הטל",
  veseinTalUmatar: "ותן טל ומטר",
  veseinBeracha: "ותן ברכה",
  yaalehVeyavo: "יעלה ויבא",
  alHanissim: "על הניסים",
};

function tefilahNotes(bundle: CalendarBundle): string[] {
  const t = bundle.tefilah;
  const notes: string[] = [];
  for (const [key, label] of Object.entries(TEFILAH_LABELS_HE)) {
    if ((t as unknown as Record<string, boolean>)[key]) notes.push(label);
  }
  if (!t.tachanun) notes.push("אין תחנון");
  return notes;
}

function valueFor(item: InfoItem, bundle: CalendarBundle, isHebrew: boolean): string | null {
  switch (item) {
    case "dayOfWeek":
      return isHebrew ? bundle.date.dayOfWeekHebrew : null;
    case "date":
      return isHebrew ? bundle.date.formattedHebrew : bundle.date.formattedEnglish;
    case "parsha": {
      const p = isHebrew ? bundle.parsha.parshaHebrew : bundle.parsha.parsha;
      return p || null;
    }
    case "holiday": {
      const h = isHebrew ? bundle.holiday.nameHebrew : bundle.holiday.name;
      return h || null;
    }
    case "omer":
      return bundle.omer ? (isHebrew ? bundle.omer.formattedHebrew : bundle.omer.formattedEnglish) : null;
    case "dafYomi":
      return isHebrew ? bundle.dafYomi.formattedHebrew : bundle.dafYomi.formatted;
    case "tefilah": {
      const notes = tefilahNotes(bundle);
      return notes.length > 0 ? notes.join(" · ") : null;
    }
    default:
      return null;
  }
}

export function JewishInfo({ object, data }: WidgetRenderProps) {
  const content = object.content as JewishInfoContent;
  const offset = String(content.daysAhead ?? 0);
  const bundle = data.calendarByOffset[offset] ?? data.calendarByOffset["0"];
  if (!bundle) return null;

  const language = object.language;
  const isHebrew = language === "hebrew" || language === "both";
  const show = { ...DEFAULT_SHOW, ...(content.showItems ?? {}) };
  const order = content.itemOrder ?? DEFAULT_ORDER;
  const layout = content.layout ?? "vertical";
  const titles = content.itemTitles ?? {};

  function labelFor(item: InfoItem, mode: TitleMode, custom: string | undefined): string {
    if (mode === "custom" && custom) return custom;
    return isHebrew ? INFO_ITEM_LABELS[item].he : INFO_ITEM_LABELS[item].en;
  }

  const items = order
    .filter((item) => show[item])
    .map((item) => ({ item, value: valueFor(item, bundle, isHebrew) }))
    .filter((x): x is { item: InfoItem; value: string } => Boolean(x.value));

  function nodeFor(item: InfoItem, value: string): ReactNode {
    const t = titles[item];
    const mode: TitleMode = t?.mode ?? "hidden";
    if (mode === "hidden") return <>{value}</>;
    const label = labelFor(item, mode, t?.text);
    if (mode === "inline") {
      return <><span style={{ fontWeight: 700 }}>{label}:</span> {value}</>;
    }
    // default | custom -> the label sits above the value as a small heading.
    return (
      <span style={{ display: "inline-flex", flexDirection: "column" }}>
        <span style={{ fontSize: "0.75em", opacity: 0.7 }}>{label}</span>
        <span>{value}</span>
      </span>
    );
  }

  if (layout === "horizontal") {
    const sep = content.horizontalSeparator ?? "|";
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }} dir={isHebrew ? "rtl" : "ltr"}>
        {items.map(({ item, value }, i) => (
          <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            {nodeFor(item, value)}
            {i < items.length - 1 ? <span style={{ opacity: 0.5 }}>{sep}</span> : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }} dir={isHebrew ? "rtl" : "ltr"}>
      {items.map(({ item, value }) => (
        <div key={item}>{nodeFor(item, value)}</div>
      ))}
    </div>
  );
}
