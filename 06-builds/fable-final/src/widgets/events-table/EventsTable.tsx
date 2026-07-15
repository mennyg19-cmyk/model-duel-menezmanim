// === What's in this file ===
// W4 — the minyan / schedule table. Lists the org's minyan times from the
// snapshot (already resolved to real clock times), optionally filtered to chosen
// schedule groups.
//
// content options: title/titleHebrew, groupIds, showRoom, use24h, hideAmPm,
//   rowColor1, rowColor2, emphasizeCurrentNext.

import type { WidgetRenderProps } from "@/widgets/types";
import type { SnapshotMinyan } from "@/core/board/types";
import type { DisplayObjectTableLayout } from "@/core/board/appearance";
import { formatZmanTime } from "@/widgets/format";
import { TableWidgetFrame, resolveTableLayout, tableTimeOptions, type TableRow } from "@/widgets/table/TableWidgetFrame";

type EventsContent = {
  title?: string;
  titleHebrew?: string;
  groupIds?: string[];
  showRoom?: boolean;
  use24h?: boolean;
  hideAmPm?: boolean;
  rowColor1?: string;
  rowColor2?: string;
  emphasizeCurrentNext?: boolean;
  tableLayout?: Partial<DisplayObjectTableLayout>;
};

/**
 * Which minyan is happening now and which is up next, by clock time vs the board's
 * "now". Current = the latest one already started today; next = the earliest still
 * to come. Ignores minyanim whose time couldn't be resolved.
 */
function currentAndNext(minyanim: SnapshotMinyan[], nowIso: string): { currentId: string | null; nextId: string | null } {
  const now = new Date(nowIso).getTime();
  let currentId: string | null = null;
  let currentT = -Infinity;
  let nextId: string | null = null;
  let nextT = Infinity;
  for (const m of minyanim) {
    if (!m.time) continue;
    const t = new Date(m.time).getTime();
    if (t <= now && t > currentT) {
      currentT = t;
      currentId = m.id;
    } else if (t > now && t < nextT) {
      nextT = t;
      nextId = m.id;
    }
  }
  return { currentId, nextId };
}

export function EventsTable({ object, data }: WidgetRenderProps) {
  const content = object.content as EventsContent;
  const language = object.language;
  const isHebrew = language === "hebrew" || language === "both";

  const groupFilter = content.groupIds ?? [];
  const minyanim: SnapshotMinyan[] =
    groupFilter.length > 0
      ? data.minyanim.filter((m) => m.groupIds.some((g) => groupFilter.includes(g)))
      : data.minyanim;

  const layout = resolveTableLayout(content);
  const timeOptions = tableTimeOptions(layout, content);
  const title = isHebrew ? content.titleHebrew ?? content.title : content.title ?? content.titleHebrew;

  const emphasize = content.emphasizeCurrentNext ?? true;
  const { currentId, nextId } = emphasize ? currentAndNext(minyanim, data.now) : { currentId: null, nextId: null };

  function nameFor(minyan: SnapshotMinyan): string {
    if (language === "english") return minyan.name;
    if (language === "hebrew") return minyan.hebrewName;
    return `${minyan.hebrewName} · ${minyan.name}`;
  }

  const rows: TableRow[] = minyanim.map((minyan) => ({
    key: minyan.id,
    label: (
      <>
        {nameFor(minyan)}
        {content.showRoom && minyan.room ? <span style={{ opacity: 0.6 }}> · {minyan.room}</span> : null}
      </>
    ),
    value: formatZmanTime(minyan.time, data.timezone, timeOptions),
    emphasis: minyan.id === nextId ? "next" : minyan.id === currentId ? "current" : undefined,
  }));

  return <TableWidgetFrame title={title} layout={layout} dir={isHebrew ? "rtl" : "ltr"} rows={rows} />;
}
