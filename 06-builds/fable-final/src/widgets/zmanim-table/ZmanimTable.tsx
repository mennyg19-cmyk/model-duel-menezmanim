// === What's in this file ===
// W2 — the zmanim list. Reads the day's zmanim out of the snapshot (the offset
// the widget asked for, e.g. today or tomorrow) and shows the ones turned on,
// in the board's language, with per-zman display-name overrides applied.
//
// content options: daysAhead, zmanim (map of zmanKey -> on/off), title/titleHebrew,
//   use24h, hideAmPm, headerColor, rowColor1, rowColor2.

import type { WidgetRenderProps } from "@/widgets/types";
import type { SnapshotZman } from "@/core/board/types";
import type { DisplayObjectTableLayout } from "@/core/board/appearance";
import { formatZmanTime } from "@/widgets/format";
import { TableWidgetFrame, resolveTableLayout, tableTimeOptions } from "@/widgets/table/TableWidgetFrame";

type ZmanimContent = {
  daysAhead?: number;
  zmanim?: Record<string, boolean>;
  title?: string;
  titleHebrew?: string;
  use24h?: boolean;
  hideAmPm?: boolean;
  rowColor1?: string;
  rowColor2?: string;
  tableLayout?: Partial<DisplayObjectTableLayout>;
};

function selectZmanim(all: SnapshotZman[], content: ZmanimContent): SnapshotZman[] {
  if (content.zmanim && Object.keys(content.zmanim).length > 0) {
    return all.filter((z) => content.zmanim?.[z.type]);
  }
  // Default: the regular (non-Tukachinsky) zmanim, in engine order.
  return all.filter((z) => !z.type.endsWith("_TUKACHINSKY"));
}

export function ZmanimTable({ object, data }: WidgetRenderProps) {
  const content = object.content as ZmanimContent;
  const offset = String(content.daysAhead ?? 0);
  const dayZmanim = data.zmanimByOffset[offset] ?? data.zmanimByOffset["0"] ?? [];
  const rows = selectZmanim(dayZmanim, content);

  const language = object.language;
  const isHebrew = language === "hebrew" || language === "both";
  const overrides = data.displayNameOverrides;
  const layout = resolveTableLayout(content);
  const timeOptions = tableTimeOptions(layout, content);

  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;

  function labelFor(zman: SnapshotZman): string {
    const override = overrides[zman.type];
    if (language === "english") return override?.english ?? zman.label;
    if (language === "hebrew") return override?.hebrew ?? zman.hebrewLabel;
    const he = override?.hebrew ?? zman.hebrewLabel;
    const en = override?.english ?? zman.label;
    return `${he} · ${en}`;
  }

  return (
    <TableWidgetFrame
      title={title}
      layout={layout}
      dir={isHebrew ? "rtl" : "ltr"}
      rows={rows.map((zman) => ({
        key: zman.type,
        label: labelFor(zman),
        value: formatZmanTime(zman.time, data.timezone, timeOptions),
      }))}
    />
  );
}
