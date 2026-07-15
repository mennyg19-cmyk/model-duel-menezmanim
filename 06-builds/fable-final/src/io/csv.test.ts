import { describe, expect, it } from "vitest";
import { formatCsv, parseCsv } from "./csv";

describe("formatCsv", () => {
  it("writes a header, a BOM, and quotes only when needed", () => {
    const out = formatCsv(["name", "note"], [{ name: "Shacharit", note: "early, brisk" }]);
    expect(out.startsWith("\uFEFF")).toBe(true);
    expect(out).toContain("name,note");
    expect(out).toContain('Shacharit,"early, brisk"');
  });

  it("escapes embedded quotes by doubling them", () => {
    const out = formatCsv(["v"], [{ v: 'say "hi"' }]);
    expect(out).toContain('"say ""hi"""');
  });
});

describe("parseCsv", () => {
  it("round-trips values with commas, quotes, and newlines", () => {
    const rows = [{ a: "1", b: "x, y", c: 'q"q' }];
    const csv = formatCsv(["a", "b", "c"], rows);
    expect(parseCsv(csv)).toEqual(rows);
  });

  it("keeps newlines inside quoted fields", () => {
    const csv = 'a,b\r\n"line1\nline2",end';
    expect(parseCsv(csv)).toEqual([{ a: "line1\nline2", b: "end" }]);
  });

  it("ignores a trailing blank line", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([{ a: "1", b: "2" }]);
  });
});
