// === What's in this file ===
// A CommonJS copy of the web app's BeeZee (.bzs) parser so the desktop file-picker
// (G4) can read a customer's BeeZee export locally without importing the web's TS.
// It is byte-for-byte the same logic as apps/web/src/io/beezee.ts.
//
// IMPORTANT — UNVERIFIED (deferred by decision): this faithfully reproduces v1's
// logic but has NOT been checked against real .bzs files or mapped onto our schema.
// The desktop wires the picker -> parser -> a summary dialog only; it does NOT write
// the result to the database yet. See DECISION-LOG (BeeZee = defer) / inventory F9.
//
// parseBzs(content) -- { zmanimDefs, toladotEntries } from the file's text.

function decodeHexString(hex) {
  const parts = hex.trim().split(/\s+/);
  let result = "";
  for (const part of parts) {
    const code = parseInt(part, 16);
    if (!Number.isNaN(code)) result += String.fromCharCode(code);
  }
  return result;
}

function parseCsvField(content, pos) {
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

const isHex = (s) => /^[0-9A-Fa-f\s]+$/.test(s.trim());

function parseBzs(content) {
  const text = content.trim();
  const pos = { index: 0 };
  const fields = [];
  while (pos.index < text.length) fields.push(parseCsvField(text, pos));

  const zmanimDefs = [];
  const toladotEntries = [];

  let i = 0;
  while (i + 3 < fields.length) {
    const index = parseInt(fields[i], 10);
    if (Number.isNaN(index)) break;
    const degrees = parseFloat(fields[i + 1]) || 0;
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
    i += 2;
    const entryIndex = parseInt(fields[i] || "", 10);
    if (Number.isNaN(entryIndex)) break;
    toladotEntries.push({
      index: entryIndex,
      subIndex: parseInt(fields[i + 1] || "0", 10) || 0,
      minutes: parseInt(fields[i + 2] || "0", 10) || 0,
      baseZman: parseInt(fields[i + 3] || "0", 10) || 0,
      isRelative: fields[i + 4] === "#TRUE#",
      hebrewLabel: isHex(fields[i + 12] || "") ? decodeHexString(fields[i + 12] || "") : fields[i + 12] || "",
      englishLabel: isHex(fields[i + 13] || "") ? decodeHexString(fields[i + 13] || "") : fields[i + 13] || "",
    });
    i += 15;
  }

  return { zmanimDefs, toladotEntries };
}

module.exports = { parseBzs };
