// === What's in this file ===
// The widget registry (W0): the one table mapping a widget type key to how it
// renders, its default content, and its content schema. The board looks up each
// placed object's type here to draw it; the editor palette and import/export
// validation read the same table, so there is one source of truth per widget.
// Any DisplayObjectType missing from here is caught by registry.test.ts.
//
// getWidget(type) -- the definition for a type, or null if not registered.
// listWidgets()   -- every registered widget (for the editor palette).

import { z } from "zod/v4";
import { DisplayObjectType } from "@/core/style-engine";
import type { WidgetDefinition } from "./types";
import { DigitalClock } from "./digital-clock/DigitalClock";
import { ZmanimTable } from "./zmanim-table/ZmanimTable";
import { EventsTable } from "./events-table/EventsTable";
import { JewishInfo } from "./jewish-info/JewishInfo";
import { PlainText, PlainTextContentSchema, plainTextDefaultContent } from "./text/PlainText";
import { RichText, RichTextContentSchema, richTextDefaultContent } from "./text/RichText";
import { ShapeDivider, ShapeDividerContentSchema, shapeDividerDefaultContent } from "./shape/ShapeDivider";
import { Yahrzeit, YahrzeitContentSchema, yahrzeitDefaultContent } from "./yahrzeit/Yahrzeit";
import { SefiraCounter, SefiraContentSchema, sefiraDefaultContent } from "./sefira/SefiraCounter";
import { TefilahNotes, TefilahNotesContentSchema, tefilahNotesDefaultContent } from "./tefilah-notes/TefilahNotes";
import { AnalogClock, AnalogClockContentSchema, analogClockDefaultContent } from "./analog-clock/AnalogClock";
import { Countdown, CountdownContentSchema, countdownDefaultContent } from "./countdown/Countdown";
import { ScrollingTicker, ScrollingTickerContentSchema, scrollingTickerDefaultContent } from "./ticker/ScrollingTicker";
import { SponsorDisplay, SponsorContentSchema, sponsorDefaultContent } from "./sponsor/SponsorDisplay";
import { MediaViewer, MediaViewerContentSchema, mediaViewerDefaultContent } from "./media/MediaViewer";
import { FidsBoard, FidsBoardContentSchema, fidsBoardDefaultContent } from "./fids/FidsBoard";
import { DatePicker, DatePickerContentSchema, datePickerDefaultContent } from "./date-picker/DatePicker";

// Schemas for the four widgets built in Phase C (their content types live inline
// in each component; mirrored here so every registry entry carries a schema).
const digitalClockSchema = z
  .object({ format24h: z.boolean(), showSeconds: z.boolean(), showAmPm: z.boolean(), textAlign: z.enum(["left", "center", "right"]) })
  .partial();
// The shared per-object table layout (columns, spacing, header, borders, stripes,
// separators). Stored inside a table widget's content so TableWidgetFrame can read it.
const tableLayoutSchema = z
  .object({
    columns: z.number(),
    splitMode: z.enum(["even", "fillHeight"]),
    showHeader: z.boolean(),
    headerTextColor: z.string().nullable(),
    headerBackgroundColor: z.string().nullable(),
    showColumnHeaders: z.boolean(),
    columnHeaderLabel: z.string().nullable(),
    columnHeaderValue: z.string().nullable(),
    borderWidth: z.number(),
    borderColor: z.string().nullable(),
    borderRadius: z.number(),
    alternatingRows: z.boolean(),
    rowColor1: z.string().nullable(),
    rowColor2: z.string().nullable(),
    rowSpacing: z.number(),
    columnGap: z.number(),
    cellPaddingY: z.number(),
    cellPaddingX: z.number(),
    columnSeparator: z.boolean(),
    columnSeparatorColor: z.string().nullable(),
    columnSeparatorWidth: z.number(),
    textAlign: z.enum(["left", "center", "right"]),
    timeFormat: z.enum(["default", "24h", "hideAmPm"]),
  })
  .partial();
const zmanimTableSchema = z
  .object({
    daysAhead: z.number(),
    zmanim: z.record(z.string(), z.boolean()),
    title: z.string(),
    titleHebrew: z.string(),
    use24h: z.boolean(),
    hideAmPm: z.boolean(),
    rowColor1: z.string(),
    rowColor2: z.string(),
    tableLayout: tableLayoutSchema,
  })
  .partial();
const eventsTableSchema = z
  .object({
    title: z.string(),
    titleHebrew: z.string(),
    groupIds: z.array(z.string()),
    showRoom: z.boolean(),
    use24h: z.boolean(),
    hideAmPm: z.boolean(),
    rowColor1: z.string(),
    rowColor2: z.string(),
    emphasizeCurrentNext: z.boolean(),
    tableLayout: tableLayoutSchema,
  })
  .partial();
const jewishInfoSchema = z
  .object({
    daysAhead: z.number(),
    showItems: z.record(z.string(), z.boolean()),
    itemOrder: z.array(z.string()),
    layout: z.enum(["vertical", "horizontal"]),
    horizontalSeparator: z.string(),
    itemTitles: z.record(
      z.string(),
      z.object({ mode: z.enum(["hidden", "default", "custom", "inline"]), text: z.string().optional() }),
    ),
  })
  .partial();

const definitions: WidgetDefinition[] = [
  {
    type: DisplayObjectType.DIGITAL_CLOCK,
    inventoryId: "W6",
    label: "Digital Clock",
    labelHebrew: "שעון דיגיטלי",
    defaultContent: () => ({ format24h: false, showSeconds: true, showAmPm: true, textAlign: "center" }),
    contentSchema: digitalClockSchema,
    Renderer: DigitalClock,
  },
  {
    type: DisplayObjectType.ANALOG_CLOCK,
    inventoryId: "W5",
    label: "Analog Clock",
    labelHebrew: "שעון אנלוגי",
    defaultContent: analogClockDefaultContent,
    contentSchema: AnalogClockContentSchema,
    Renderer: AnalogClock,
  },
  {
    type: DisplayObjectType.ZMANIM_TABLE,
    inventoryId: "W2",
    label: "Zmanim List",
    labelHebrew: "לוח זמנים",
    defaultContent: () => ({ daysAhead: 0 }),
    contentSchema: zmanimTableSchema,
    Renderer: ZmanimTable,
  },
  {
    type: DisplayObjectType.EVENTS_TABLE,
    inventoryId: "W4",
    label: "Minyan Times",
    labelHebrew: "זמני מנינים",
    defaultContent: () => ({ showHeader: true }),
    contentSchema: eventsTableSchema,
    Renderer: EventsTable,
  },
  {
    type: DisplayObjectType.JEWISH_INFO,
    inventoryId: "W8",
    label: "Jewish Info",
    labelHebrew: "מידע יומי",
    defaultContent: () => ({ layout: "vertical" }),
    contentSchema: jewishInfoSchema,
    Renderer: JewishInfo,
  },
  {
    type: DisplayObjectType.PLAIN_TEXT,
    inventoryId: "W1",
    label: "Text",
    labelHebrew: "טקסט",
    defaultContent: plainTextDefaultContent,
    contentSchema: PlainTextContentSchema,
    Renderer: PlainText,
  },
  {
    type: DisplayObjectType.RICH_TEXT,
    inventoryId: "W1",
    label: "Rich Text",
    labelHebrew: "טקסט מעוצב",
    defaultContent: richTextDefaultContent,
    contentSchema: RichTextContentSchema,
    Renderer: RichText,
  },
  {
    type: DisplayObjectType.COUNTDOWN_TIMER,
    inventoryId: "W7",
    label: "Countdown",
    labelHebrew: "ספירה לאחור",
    defaultContent: countdownDefaultContent,
    contentSchema: CountdownContentSchema,
    Renderer: Countdown,
  },
  {
    type: DisplayObjectType.SCROLLING_TICKER,
    inventoryId: "W9",
    label: "Announcements",
    labelHebrew: "הודעות",
    defaultContent: scrollingTickerDefaultContent,
    contentSchema: ScrollingTickerContentSchema,
    Renderer: ScrollingTicker,
  },
  {
    type: DisplayObjectType.YAHRZEIT_DISPLAY,
    inventoryId: "W10",
    label: "Yahrzeits",
    labelHebrew: "יארצייטן",
    defaultContent: yahrzeitDefaultContent,
    contentSchema: YahrzeitContentSchema,
    Renderer: Yahrzeit,
  },
  {
    type: DisplayObjectType.SPONSOR_DISPLAY,
    inventoryId: "W11",
    label: "Sponsor",
    labelHebrew: "נדבן",
    defaultContent: sponsorDefaultContent,
    contentSchema: SponsorContentSchema,
    Renderer: SponsorDisplay,
  },
  {
    type: DisplayObjectType.MEDIA_VIEWER,
    inventoryId: "W12",
    label: "Image / Media",
    labelHebrew: "תמונה / מדיה",
    defaultContent: mediaViewerDefaultContent,
    contentSchema: MediaViewerContentSchema,
    Renderer: MediaViewer,
  },
  {
    type: DisplayObjectType.SHAPE_DIVIDER,
    inventoryId: "W13",
    label: "Shape / Divider",
    labelHebrew: "צורה / קו",
    defaultContent: shapeDividerDefaultContent,
    contentSchema: ShapeDividerContentSchema,
    Renderer: ShapeDivider,
  },
  {
    type: DisplayObjectType.TEFILAH_NOTES,
    inventoryId: "W14",
    label: "Tefilah Notes",
    labelHebrew: "הערות תפילה",
    defaultContent: tefilahNotesDefaultContent,
    contentSchema: TefilahNotesContentSchema,
    Renderer: TefilahNotes,
  },
  {
    type: DisplayObjectType.SEFIRA_COUNTER,
    inventoryId: "W15",
    label: "Sefiras HaOmer",
    labelHebrew: "ספירת העומר",
    defaultContent: sefiraDefaultContent,
    contentSchema: SefiraContentSchema,
    Renderer: SefiraCounter,
  },
  {
    type: DisplayObjectType.FIDS_BOARD,
    inventoryId: "W16",
    label: "FIDS Board",
    labelHebrew: "לוח טיסות",
    defaultContent: fidsBoardDefaultContent,
    contentSchema: FidsBoardContentSchema,
    Renderer: FidsBoard,
  },
  {
    type: DisplayObjectType.DATE_PICKER,
    inventoryId: "W17",
    label: "Date Picker",
    labelHebrew: "בורר תאריך",
    defaultContent: datePickerDefaultContent,
    contentSchema: DatePickerContentSchema,
    Renderer: DatePicker,
  },
];

const registry = new Map<string, WidgetDefinition>(definitions.map((d) => [d.type, d]));

export function getWidget(type: string): WidgetDefinition | null {
  return registry.get(type) ?? null;
}

export function listWidgets(): WidgetDefinition[] {
  return [...registry.values()];
}
