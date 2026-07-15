// === What's in this file ===
// W14 — the tefilah / davening notes panel. Reads the day's tefilah rules from
// the snapshot's calendar bundle (mashiv haruach, tal umatar, yaaleh veyavo, al
// hanissim, hallel, tachanun, sefira) and lists the ones that apply today, in the
// board's language. It also lists the shul's own D16 daily notes (its own notes
// plus the global baseline, with overrides/hidden already resolved server-side)
// that fall on today's Hebrew date.
//
// TefilahNotesContentSchema / tefilahNotesDefaultContent — the content shape.
// TefilahNotes — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";
import type { TefilahRulesInfo } from "@/core/calendar-engine";

export const TefilahNotesContentSchema = z.object({
  daysAhead: z.number().int().optional(),
  title: z.string().optional(),
  titleHebrew: z.string().optional(),
  layout: z.enum(["vertical", "horizontal"]).optional(),
  separator: z.string().optional(),
});
type TefilahNotesContent = z.infer<typeof TefilahNotesContentSchema>;

export const tefilahNotesDefaultContent = (): TefilahNotesContent => ({ layout: "vertical" });

interface NoteDef {
  key: keyof TefilahRulesInfo;
  he: string;
  en: string;
  whenTrue: boolean;
}

// Each note shows when its rule is in the listed state (true for additions,
// false for "no tachanun").
const NOTES: NoteDef[] = [
  { key: "mashivHaruach", he: "משיב הרוח", en: "Mashiv Haruach", whenTrue: true },
  { key: "moridHatal", he: "מוריד הטל", en: "Morid HaTal", whenTrue: true },
  { key: "veseinTalUmatar", he: "ותן טל ומטר", en: "V'sein Tal U'matar", whenTrue: true },
  { key: "veseinBeracha", he: "ותן ברכה", en: "V'sein Beracha", whenTrue: true },
  { key: "yaalehVeyavo", he: "יעלה ויבא", en: "Yaaleh V'yavo", whenTrue: true },
  { key: "alHanissim", he: "על הניסים", en: "Al HaNissim", whenTrue: true },
  { key: "tachanun", he: "אין תחנון", en: "No Tachanun", whenTrue: false },
];

export function TefilahNotes({ object, data }: WidgetRenderProps) {
  const content = object.content as TefilahNotesContent;
  const bundle = data.calendarByOffset[String(content.daysAhead ?? 0)] ?? data.calendarByOffset["0"];
  if (!bundle) return null;

  const isHebrew = object.language === "hebrew" || object.language === "both";
  const t = bundle.tefilah;

  const notes = NOTES.filter((n) => Boolean(t[n.key]) === n.whenTrue).map((n) => (isHebrew ? n.he : n.en));
  if (t.hallel !== "none") notes.push(isHebrew ? (t.hallel === "full" ? "הלל שלם" : "חצי הלל") : t.hallel === "full" ? "Full Hallel" : "Half Hallel");

  // The shul's own daily notes for today (D16), in the board's language.
  for (const note of bundle.notes ?? []) {
    const text = isHebrew ? note.noteHebrew : note.noteEnglish ?? note.noteHebrew;
    if (text) notes.push(text);
  }

  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;
  if (notes.length === 0 && !title) return null;

  const layout = content.layout ?? "vertical";
  const sep = content.separator ?? "·";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }} dir={isHebrew ? "rtl" : "ltr"}>
      {title ? <div style={{ fontWeight: 700, marginBottom: 6, textAlign: "center" }}>{title}</div> : null}
      {layout === "horizontal" ? (
        <div style={{ textAlign: "center" }}>{notes.join(` ${sep} `)}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          {notes.map((n, i) => (
            <div key={i}>{n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
