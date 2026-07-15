// === What's in this file ===
// W10 — the yahrzeit / memorial board. The snapshot already worked out how many
// days until each memorial's next Hebrew anniversary, so this just picks today's
// (and optionally the next few days') and lists them: name, relationship, and the
// Hebrew date. No date math here — that lives in the snapshot.
//
// YahrzeitContentSchema / yahrzeitDefaultContent — the content shape.
// Yahrzeit — the renderer.

import { z } from "zod/v4";
import type { WidgetRenderProps } from "@/widgets/types";
import type { SnapshotMemorial } from "@/core/board/types";

export const YahrzeitContentSchema = z.object({
  title: z.string().optional(),
  titleHebrew: z.string().optional(),
  upcomingDays: z.number().int().min(0).optional(),
  showRelationship: z.boolean().optional(),
  showEnglishName: z.boolean().optional(),
});
type YahrzeitContent = z.infer<typeof YahrzeitContentSchema>;

export const yahrzeitDefaultContent = (): YahrzeitContent => ({
  title: "Yahrzeits",
  titleHebrew: "יארצייטן",
  upcomingDays: 0,
  showRelationship: true,
  showEnglishName: true,
});

const HEBREW_MONTHS: Record<number, string> = {
  1: "ניסן", 2: "אייר", 3: "סיון", 4: "תמוז", 5: "אב", 6: "אלול",
  7: "תשרי", 8: "חשון", 9: "כסלו", 10: "טבת", 11: "שבט", 12: "אדר", 13: "אדר ב'",
};

function hebrewDate(memorial: SnapshotMemorial): string {
  return `${memorial.hebrewDay} ${HEBREW_MONTHS[memorial.hebrewMonth] ?? ""}`.trim();
}

export function Yahrzeit({ object, data }: WidgetRenderProps) {
  const content = object.content as YahrzeitContent;
  const isHebrew = object.language === "hebrew" || object.language === "both";
  const window = content.upcomingDays ?? 0;

  const matches = data.memorials
    .filter((m) => m.daysUntil !== null && m.daysUntil <= window)
    .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0));

  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }} dir={isHebrew ? "rtl" : "ltr"}>
      {title ? <div style={{ fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{title}</div> : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {matches.map((m) => {
          const name = isHebrew ? m.hebrewName : m.englishName ?? m.hebrewName;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span>
                {name}
                {content.showRelationship && m.relationship ? <span style={{ opacity: 0.7 }}> ({m.relationship})</span> : null}
                {content.showEnglishName && isHebrew && m.englishName ? <span style={{ opacity: 0.6 }}> · {m.englishName}</span> : null}
              </span>
              <span style={{ opacity: 0.8 }}>{hebrewDate(m)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
