/** One CSV implementation (F-DUP-CSV) — parse + stringify with Excel UTF-8 BOM. */

const BOM = "\uFEFF";

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  const raw = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((line, index, all) => !(index === all.length - 1 && line === ""));
  if (lines.length === 0) return { headers: [], rows: [], errors: ["Empty CSV"] };

  const table = lines.map((line, lineIndex) => {
    try {
      return parseCsvLine(line);
    } catch (err) {
      errors.push(`Line ${lineIndex + 1}: ${err instanceof Error ? err.message : "parse error"}`);
      return [] as string[];
    }
  });

  const headers = table[0]!.map((h) => h.trim());
  if (headers.some((h) => !h)) errors.push("Header row has empty column names");

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < table.length; i++) {
    const cols = table[i]!;
    if (cols.every((c) => c.trim() === "")) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cols[index] ?? "").trim();
    });
    rows.push(row);
  }
  return { headers, rows, errors };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) {
      out.push("");
      break;
    }
    if (line[i] === '"') {
      i++;
      let value = "";
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          value += '"';
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i++;
          break;
        }
        value += line[i];
        i++;
      }
      out.push(value);
      if (line[i] === ",") i++;
      else if (i < line.length && line[i] !== undefined) {
        throw new Error("Expected comma after quoted field");
      }
      continue;
    }
    let value = "";
    while (i < line.length && line[i] !== ",") {
      value += line[i];
      i++;
    }
    out.push(value);
    if (line[i] === ",") i++;
  }
  return out;
}

export function stringifyCsv(headers: string[], rows: Array<Record<string, string | number | boolean | null | undefined>>, withBom = true): string {
  const lines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h])).join(",")),
  ];
  return `${withBom ? BOM : ""}${lines.join("\r\n")}\r\n`;
}

function escapeCsvField(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function mapColumns(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [target, source] of Object.entries(mapping)) {
      out[target] = row[source] ?? "";
    }
    return out;
  });
}
