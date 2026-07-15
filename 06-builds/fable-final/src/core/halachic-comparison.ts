// === What's in this file ===
// The "two engines, side by side" inventory (USER DECISION: build both opinions
// and let me compare them against my own calendar). Every zman the app knows has
// one or more competing opinions -- the standard GR"A/M"A calculation and the
// Tukachinsky-profile calculation. This groups the flat engine output by concept
// (e.g. "Sof Zman Shema" gathers GR"A, M"A, and both Tukachinsky variants) so a
// human can eyeball each concept's candidate times and pick the one that matches
// a trusted printed calendar. Pure: no DB, no React, no clock of its own.
//
// conceptKey() -- collapses a ZmanType to its base concept (drops _MGA/_TUKACHINSKY).
// buildHalachicComparison() -- turns engine results into one row per concept, each
//   row listing every opinion's time and the spread (minutes) between the extremes.

import { DateTime } from "luxon";
import { DEFAULT_OPINIONS, type HalachicAuthority, ZmanType } from "./zman-types";
import { ENGLISH_LABELS, HEBREW_LABELS, type ZmanResult } from "./zmanim-engine";

export interface ComparisonOpinion {
  zmanType: ZmanType;
  authority: HalachicAuthority;
  description: string;
  /** Wall-clock time in the org timezone, e.g. "5:33 AM", or null when it does not occur. */
  time: string | null;
  iso: string | null;
}

export interface ComparisonRow {
  /** The base concept id (the standard variant), used as a stable key. */
  concept: ZmanType;
  label: string;
  hebrewLabel: string;
  opinions: ComparisonOpinion[];
  /** Minutes between the earliest and latest opinion in this row, or null if <2 times. */
  spreadMinutes: number | null;
}

// A few zmanim don't follow the simple "<base>_TUKACHINSKY" naming, so pin them.
const CONCEPT_OVERRIDES: Partial<Record<ZmanType, ZmanType>> = {
  [ZmanType.RABBEINU_TAM_TUKACHINSKY]: ZmanType.RABBEINU_TAM_END,
};

export function conceptKey(zmanType: ZmanType): ZmanType {
  const override = CONCEPT_OVERRIDES[zmanType];
  if (override) return override;
  const base = zmanType.replace(/_TUKACHINSKY$/, "").replace(/_MGA$/, "");
  return (Object.values(ZmanType) as string[]).includes(base) ? (base as ZmanType) : zmanType;
}

function formatTime(time: Date | null, timezone: string): string | null {
  if (!time) return null;
  return DateTime.fromJSDate(time, { zone: timezone }).toFormat("h:mm a");
}

export function buildHalachicComparison(results: ZmanResult[], timezone: string): ComparisonRow[] {
  const byConcept = new Map<ZmanType, ComparisonRow>();
  // Preserve the engine's order: the first time a concept is seen sets its position.
  const order: ZmanType[] = [];

  for (const result of results) {
    const concept = conceptKey(result.type);
    let row = byConcept.get(concept);
    if (!row) {
      row = {
        concept,
        label: ENGLISH_LABELS[concept] ?? concept,
        hebrewLabel: HEBREW_LABELS[concept] ?? concept,
        opinions: [],
        spreadMinutes: null,
      };
      byConcept.set(concept, row);
      order.push(concept);
    }
    row.opinions.push({
      zmanType: result.type,
      authority: result.authority,
      description: DEFAULT_OPINIONS.get(result.type)?.description ?? "",
      time: formatTime(result.time, timezone),
      iso: result.time ? result.time.toISOString() : null,
    });
  }

  for (const row of byConcept.values()) {
    const millis = row.opinions.map((o) => (o.iso ? new Date(o.iso).getTime() : null)).filter((n): n is number => n !== null);
    row.spreadMinutes = millis.length >= 2 ? Math.round((Math.max(...millis) - Math.min(...millis)) / 60_000) : null;
  }

  return order.map((c) => byConcept.get(c)!);
}
