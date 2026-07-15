import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { minyanSchedules, zmanimConfigs } from "@/db/schema";
import { parseBzs, type BzsParseResult } from "@/io/beezee";
import { HalachicAuthority, ZmanType } from "@/core/zman-types";

/** BeeZee index → ZmanType (common Default.Bzs layout). Unmapped indices skipped. */
const INDEX_TO_ZMAN: Record<number, ZmanType> = {
  0: ZmanType.ALOS,
  1: ZmanType.MISHEYAKIR,
  2: ZmanType.HANETZ,
  3: ZmanType.SOF_ZMAN_SHMA,
  4: ZmanType.SOF_ZMAN_TEFILLAH,
  5: ZmanType.CHATZOS,
  6: ZmanType.MINCHA_GEDOLAH,
  7: ZmanType.MINCHA_KETANAH,
  8: ZmanType.PLAG_HAMINCHA,
  9: ZmanType.SHKIAH,
  10: ZmanType.TZAIS,
  11: ZmanType.CANDLE_LIGHTING,
  12: ZmanType.HAVDALAH,
};

/**
 * F9 — real BZS parse + apply path (not filename-only).
 * Applies degree-based zmanim defs into zmanim_configs and visible toladot as minyan rows.
 */
export async function applyBzsImport(
  orgId: string,
  content: string,
  mode: "append" | "replace",
): Promise<{ parsed: BzsParseResult; zmanimWritten: number; minyanimWritten: number }> {
  const parsed = parseBzs(content);
  if (parsed.zmanimDefs.length === 0 && parsed.toladotEntries.length === 0) {
    throw new Error("No BeeZee zmanim defs or toladot entries found in file.");
  }

  let zmanimWritten = 0;
  let minyanimWritten = 0;

  await db.transaction(async (tx) => {
    if (mode === "replace") {
      await tx.delete(zmanimConfigs).where(eq(zmanimConfigs.orgId, orgId));
      await tx.delete(minyanSchedules).where(eq(minyanSchedules.orgId, orgId));
    }

    for (const def of parsed.zmanimDefs) {
      const zmanType = INDEX_TO_ZMAN[def.index];
      if (!zmanType) continue;
      await tx.delete(zmanimConfigs).where(and(eq(zmanimConfigs.orgId, orgId), eq(zmanimConfigs.zmanType, zmanType)));
      await tx.insert(zmanimConfigs).values({
        orgId,
        zmanType,
        authority: HalachicAuthority.GRA,
        degreesBelow: def.degrees || null,
        fixedMinutes: null,
      });
      zmanimWritten++;
    }

    const visible = parsed.toladotEntries.filter((t) => t.isVisible);
    let sort = 0;
    for (const t of visible) {
      const base = INDEX_TO_ZMAN[t.baseZman];
      await tx.insert(minyanSchedules).values({
        orgId,
        name: t.englishLabel || `Toladot ${t.index}.${t.subIndex}`,
        hebrewName: t.hebrewLabel || t.englishLabel || `תולדות ${t.index}`,
        type: "other",
        baseZman: base ?? null,
        fixedTime: null,
        offset: t.minutes,
        roundTo: 1,
        roundDirection: "nearest",
        dayOfWeekMask: "1111111",
        isActive: true,
        sortOrder: t.displayOrder || sort++,
        details: {
          beezee: {
            index: t.index,
            subIndex: t.subIndex,
            isRelative: t.isRelative,
            relativeBase: t.relativeBase,
            relativeType: t.relativeType,
            relativeValue: t.relativeValue,
          },
        },
      });
      minyanimWritten++;
    }
  });

  return { parsed, zmanimWritten, minyanimWritten };
}
