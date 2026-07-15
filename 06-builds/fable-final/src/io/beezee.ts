// === What's in this file ===
// The BeeZee (.bzs) zmanim-file parser, ported verbatim from the v1 desktop app so
// no parsing knowledge is lost. It reads the hex-encoded CSV that BeeZee writes:
// a block of zmanim definitions (index, degrees, Hebrew/English labels) followed by
// the "toladot" entries (derived times with offsets and relative bases).
//
// IMPORTANT — UNVERIFIED (deferred by decision): this faithfully reproduces the v1
// logic and its types, but it is NOT yet wired into the import flow and has NOT been
// checked against real customer .bzs files or mapped onto our schema. Treat its
// output as raw until a verification pass confirms the field mapping. See
// DECISION-LOG (BeeZee = defer) and FEATURE-INVENTORY F9.
//
// parseBzs(content) -- { zmanimDefs, toladotEntries } from the file's text.

export interface BzsZmanimDef {
  index: number;
  degrees: number;
  hebrewLabel: string;
  englishLabel: string;
}

export interface BzsToladotEntry {
  index: number;
  subIndex: number;
  minutes: number;
  baseZman: number;
  isRelative: boolean;
  relativeBase: number;
  relativeType: number;
  relativeValue: number;
  isHighlight: boolean;
  isVisible: boolean;
  displayOrder: number;
  showAlways: boolean;
  hebrewLabel: string;
  englishLabel: string;
  fontSize: number;
}

export interface BzsParseResult {
  zmanimDefs: BzsZmanimDef[];
  toladotEntries: BzsToladotEntry[];
}

function decodeHexString(hex: string): string {
  const parts = hex.trim().split(/\s+/);
  let result = "";
  for (const part of parts) {
    const code = parseInt(part, 16);
    if (!Number.isNaN(code)) result += String.fromCharCode(code);
  }
  return result;
}

function parseCsvField(content: string, pos: { index: number }): string {
  let i = pos.index;
  while (i < content.length && content[i] === " ") i++;
  if (i >= content.length) {
    pos.index = i;
    return "";
  }
  if (content[i] === '"') {
    i++;
    let value = "";
    while (i < content.length) {
      if (content[i] === '"' && (i + 1 >= content.length || content[i + 1] !== '"')) {
        i++;
        break;
      }
      if (content[i] === '"' && content[i + 1] === '"') {
        value += '"';
        i += 2;
      } else {
        value += content[i];
        i++;
      }
    }
    if (i < content.length && content[i] === ",") i++;
    pos.index = i;
    return value;
  }
  let value = "";
  while (i < content.length && content[i] !== ",") {
    value += content[i];
    i++;
  }
  if (i < content.length && content[i] === ",") i++;
  pos.index = i;
  return value.trim();
}

const isHex = (s: string) => /^[0-9A-Fa-f\s]+$/.test(s.trim());

export function parseBzs(content: string): BzsParseResult {
  const text = content.trim();
  const pos = { index: 0 };
  const fields: string[] = [];
  while (pos.index < text.length) fields.push(parseCsvField(text, pos));

  const zmanimDefs: BzsZmanimDef[] = [];
  const toladotEntries: BzsToladotEntry[] = [];

  let i = 0;
  while (i + 3 < fields.length) {
    const index = parseInt(fields[i]!, 10);
    if (Number.isNaN(index)) break;
    const degrees = parseFloat(fields[i + 1]!) || 0;
    const hebrewHex = fields[i + 2] || "";
    const englishHex = fields[i + 3] || "";
    zmanimDefs.push({
      index,
      degrees,
      hebrewLabel: hebrewHex.trim() ? decodeHexString(hebrewHex) : "",
      englishLabel: englishHex.trim() ? decodeHexString(englishHex) : "",
    });
    i += 4;
    if (index >= 24) break;
  }

  while (i < fields.length) {
    const rawName = fields[i];
    if (rawName === undefined || rawName === "") break;
    const fontSize = parseInt(fields[i + 1] || "0", 10) || 0;
    i += 2;

    const entryIndex = parseInt(fields[i] || "", 10);
    if (Number.isNaN(entryIndex)) break;
    const subIndex = parseInt(fields[i + 1] || "0", 10) || 0;
    const minutes = parseInt(fields[i + 2] || "0", 10) || 0;
    const baseZman = parseInt(fields[i + 3] || "0", 10) || 0;
    const isRelative = fields[i + 4] === "#TRUE#";
    const relativeBase = parseInt(fields[i + 5] || "0", 10) || 0;
    const relativeType = parseInt(fields[i + 6] || "0", 10) || 0;
    const relativeValue = parseFloat(fields[i + 7] || "0") || 0;
    const isHighlight = fields[i + 8] === "#TRUE#";
    const isVisible = fields[i + 9] === "#TRUE#";
    const displayOrder = parseInt(fields[i + 10] || "0", 10) || 0;
    const showAlways = fields[i + 11] === "#TRUE#";
    const hebLabel = fields[i + 12] || "";
    const engLabel = fields[i + 13] || "";
    const entryFontSize = parseInt(fields[i + 14] || "0", 10) || fontSize;

    toladotEntries.push({
      index: entryIndex,
      subIndex,
      minutes,
      baseZman,
      isRelative,
      relativeBase,
      relativeType,
      relativeValue,
      isHighlight,
      isVisible,
      displayOrder,
      showAlways,
      hebrewLabel: isHex(hebLabel) ? decodeHexString(hebLabel) : hebLabel,
      englishLabel: isHex(engLabel) ? decodeHexString(engLabel) : engLabel,
      fontSize: entryFontSize,
    });
    i += 15;
  }

  return { zmanimDefs, toladotEntries };
}
