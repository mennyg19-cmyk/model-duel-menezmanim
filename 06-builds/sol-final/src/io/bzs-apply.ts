import { prisma } from "@/db/client";
import { HalachicAuthority, ZmanType } from "@/core/halachic-opinions";
import { parseBzs, type BzsParseResult } from "@/io/beezee";

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

export async function applyBzsImport(
  orgId: string,
  content: string,
  mode: "append" | "replace",
): Promise<{ parsed: BzsParseResult; zmanimWritten: number; minyanimWritten: number }> {
  if (!content || !content.trim()) {
    throw new Error("BZS content is empty — upload the file body, not only the filename.");
  }
  const parsed = parseBzs(content);
  if (parsed.zmanimDefs.length === 0 && parsed.toladotEntries.length === 0) {
    throw new Error("No BeeZee zmanim defs or toladot entries found in file.");
  }

  let zmanimWritten = 0;
  let minyanimWritten = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      await tx.zmanimConfig.deleteMany({ where: { orgId } });
      await tx.minyanSchedule.deleteMany({ where: { orgId } });
    }

    for (const def of parsed.zmanimDefs) {
      const zmanType = INDEX_TO_ZMAN[def.index];
      if (!zmanType) continue;
      await tx.zmanimConfig.upsert({
        where: { orgId_zmanType: { orgId, zmanType } },
        create: {
          orgId,
          zmanType,
          authority: HalachicAuthority.GRA,
          degreesBelow: def.degrees || null,
        },
        update: {
          authority: HalachicAuthority.GRA,
          degreesBelow: def.degrees || null,
        },
      });
      zmanimWritten++;
    }

    const visible = parsed.toladotEntries.filter((t) => t.isVisible);
    let sort = 0;
    for (const t of visible) {
      const base = INDEX_TO_ZMAN[t.baseZman];
      await tx.minyanSchedule.create({
        data: {
          orgId,
          name: t.englishLabel || `Toladot ${t.index}.${t.subIndex}`,
          hebrewName: t.hebrewLabel || t.englishLabel || `תולדות ${t.index}`,
          type: "other",
          baseZman: base ?? null,
          fixedTime: null,
          offset: t.minutes,
          roundTo: 1,
          dayOfWeekMask: "1111111",
          isActive: true,
          sortOrder: t.displayOrder || sort++,
          details: JSON.stringify({
            beezee: {
              index: t.index,
              subIndex: t.subIndex,
              isRelative: t.isRelative,
              relativeBase: t.relativeBase,
              relativeType: t.relativeType,
              relativeValue: t.relativeValue,
            },
          }),
        },
      });
      minyanimWritten++;
    }
  });

  return { parsed, zmanimWritten, minyanimWritten };
}
