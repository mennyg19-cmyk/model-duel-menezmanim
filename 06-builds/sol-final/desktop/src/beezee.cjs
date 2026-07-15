const fs = require("node:fs");
const path = require("node:path");

const IMAGE_EXTENSIONS = new Set([".bmp", ".gif", ".jpg", ".jpeg", ".png", ".webp"]);
const MEDIA_EXTENSIONS = new Set([".avi", ".m4v", ".mov", ".mp3", ".mp4", ".mpeg", ".wav", ".wmv"]);

function decodeHexString(hex) {
  return hex
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseInt(part, 16))
    .filter((code) => !Number.isNaN(code))
    .map((code) => String.fromCharCode(code))
    .join("");
}

function parseCsvFields(content) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(field.trim());
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field.trim());
  return fields;
}

function parseBzs(content) {
  const fields = parseCsvFields(content.trim());
  const zmanimDefs = [];
  const toladotEntries = [];
  let index = 0;
  while (index + 3 < fields.length) {
    const definitionIndex = Number.parseInt(fields[index], 10);
    if (Number.isNaN(definitionIndex)) break;
    zmanimDefs.push({
      index: definitionIndex,
      degrees: Number.parseFloat(fields[index + 1]) || 0,
      hebrewLabel: decodeHexString(fields[index + 2] || ""),
      englishLabel: decodeHexString(fields[index + 3] || ""),
    });
    index += 4;
    if (definitionIndex >= 24) break;
  }
  while (index < fields.length && fields[index]) {
    const fallbackFontSize = Number.parseInt(fields[index + 1] || "0", 10) || 0;
    index += 2;
    const entryIndex = Number.parseInt(fields[index] || "", 10);
    if (Number.isNaN(entryIndex)) break;
    const hebrewLabel = fields[index + 12] || "";
    const englishLabel = fields[index + 13] || "";
    toladotEntries.push({
      index: entryIndex,
      subIndex: Number.parseInt(fields[index + 1] || "0", 10) || 0,
      minutes: Number.parseInt(fields[index + 2] || "0", 10) || 0,
      baseZman: Number.parseInt(fields[index + 3] || "0", 10) || 0,
      isRelative: fields[index + 4] === "#TRUE#",
      relativeBase: Number.parseInt(fields[index + 5] || "0", 10) || 0,
      relativeType: Number.parseInt(fields[index + 6] || "0", 10) || 0,
      relativeValue: Number.parseFloat(fields[index + 7] || "0") || 0,
      isHighlight: fields[index + 8] === "#TRUE#",
      isVisible: fields[index + 9] === "#TRUE#",
      displayOrder: Number.parseInt(fields[index + 10] || "0", 10) || 0,
      showAlways: fields[index + 11] === "#TRUE#",
      hebrewLabel: /^[0-9A-Fa-f\s]+$/.test(hebrewLabel) ? decodeHexString(hebrewLabel) : hebrewLabel,
      englishLabel: /^[0-9A-Fa-f\s]+$/.test(englishLabel) ? decodeHexString(englishLabel) : englishLabel,
      fontSize: Number.parseInt(fields[index + 14] || "0", 10) || fallbackFontSize,
    });
    index += 15;
  }
  return { zmanimDefs, toladotEntries };
}

function parseSettings(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith(";"))
      .map((line) => {
        const separator = line.search(/[=:]/);
        return separator < 0
          ? [line, true]
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

function parseRulesGroup(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const fields = line.split(/\t|,/).map((field) => field.trim());
      return { id: fields[0] || String(index), name: fields[1] || "", rules: fields.slice(2) };
    });
}

function parseCalendarFile(buffer) {
  const text = buffer.toString("utf8");
  const textEntries = text
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\d+)\D+(\d+)\s*$/))
    .filter(Boolean)
    .map((match) => ({ julianDay: Number(match[1]), groupId: Number(match[2]) }));
  if (textEntries.length) return textEntries;
  const entries = [];
  for (let offset = 0; offset + 7 < buffer.length; offset += 8) {
    entries.push({ julianDay: buffer.readInt32LE(offset), groupId: buffer.readInt32LE(offset + 4) });
  }
  return entries;
}

function parseStyleConfig(content) {
  try {
    return JSON.parse(content);
  } catch {
    return parseSettings(content);
  }
}

function parseYahrzeit(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const fields = parseCsvFields(line);
      return {
        hebrewName: fields[0] || "",
        englishName: fields[1] || "",
        hebrewMonth: Number(fields[2]) || null,
        hebrewDay: Number(fields[3]) || null,
        relationship: fields[4] || null,
      };
    });
}

function parseRtf(content) {
  return content
    .replace(/\\'([0-9a-fA-F]{2})/g, (_, value) => String.fromCharCode(Number.parseInt(value, 16)))
    .replace(/\\u(-?\d+)\??/g, (_, value) => String.fromCharCode(Number(value) & 0xffff))
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, "")
    .replace(/[{}]/g, "")
    .trim();
}

function classifyFile(filePath) {
  const filename = path.basename(filePath).toLowerCase();
  const extension = path.extname(filename);
  if (extension === ".bzs") return "bzs";
  if (filename === "setting.txt") return "settings";
  if (filename === "rulesgroupfile.dat") return "rulesGroup";
  if (filename === "calendarfile.dat") return "calendar";
  if (extension === ".styleconfig") return "style";
  if (extension === ".yrz") return "yahrzeit";
  if (extension === ".rtf") return "rtf";
  if (IMAGE_EXTENSIONS.has(extension)) return "background";
  if (MEDIA_EXTENSIONS.has(extension)) return "media";
  return null;
}

function listFiles(sourcePath) {
  const stat = fs.statSync(sourcePath);
  if (stat.isFile()) return [sourcePath];
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else files.push(entryPath);
      if (files.length > 500) throw new Error("BeeZee import is limited to 500 files");
    }
  };
  visit(sourcePath);
  return files;
}

function parseBeeZeePath(sourcePath) {
  const parsedFiles = [];
  let bzsContent = "";
  for (const filePath of listFiles(sourcePath)) {
    const kind = classifyFile(filePath);
    if (!kind) continue;
    const stat = fs.statSync(filePath);
    if (stat.size > 10 * 1024 * 1024) throw new Error(`BeeZee file exceeds 10 MiB: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString("utf8");
    let parsed;
    if (kind === "bzs") {
      bzsContent = content;
      parsed = parseBzs(content);
    } else if (kind === "settings") parsed = parseSettings(content);
    else if (kind === "rulesGroup") parsed = parseRulesGroup(content);
    else if (kind === "calendar") parsed = parseCalendarFile(buffer);
    else if (kind === "style") parsed = parseStyleConfig(content);
    else if (kind === "yahrzeit") parsed = parseYahrzeit(content);
    else if (kind === "rtf") parsed = parseRtf(content);
    else parsed = { filename: path.basename(filePath), bytes: stat.size };
    parsedFiles.push({ kind, filePath, parsed });
  }
  if (!parsedFiles.length) throw new Error("No supported BeeZee files found");
  const counts = parsedFiles.reduce((summary, file) => {
    summary[file.kind] = (summary[file.kind] || 0) + 1;
    return summary;
  }, {});
  return { sourcePath, counts, files: parsedFiles, bzsContent };
}

async function applyBzsThroughWeb(webOrigin, orgId, bzsContent) {
  if (!bzsContent) return null;
  const login = await fetch(`${webOrigin}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@demo.local" }),
  });
  if (!login.ok) throw new Error(`Local BeeZee login failed: HTTP ${login.status}`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("Local BeeZee login did not return a session cookie");

  const form = new FormData();
  form.set("category", "bezee");
  form.set("mode", "append");
  form.set("action", "commit");
  form.set("content", bzsContent);
  const response = await fetch(`${webOrigin}/api/org/${encodeURIComponent(orgId)}/import`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Local BeeZee import failed: HTTP ${response.status}`);
  return payload;
}

module.exports = {
  applyBzsThroughWeb,
  classifyFile,
  parseBzs,
  parseBeeZeePath,
  parseCalendarFile,
  parseRtf,
  parseRulesGroup,
  parseSettings,
  parseStyleConfig,
  parseYahrzeit,
};
