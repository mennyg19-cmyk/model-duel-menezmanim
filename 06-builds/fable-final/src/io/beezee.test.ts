import { describe, expect, it } from "vitest";
import { parseBzs } from "./beezee";

// These cover the ported parser's mechanics (hex decode, field walking). They do
// NOT assert real-customer correctness — the mapping onto our schema is the
// deferred, unverified part (see DECISION-LOG: BeeZee = defer).
describe("parseBzs", () => {
  it("decodes hex-encoded English labels in the zmanim-def block", () => {
    // groups of 4: index, degrees, hebrewHex, englishHex
    const result = parseBzs("5,0,,48 69,6,16.1,,54 7A 61 69 73");
    expect(result.zmanimDefs[0]).toMatchObject({ index: 5, degrees: 0, englishLabel: "Hi" });
    expect(result.zmanimDefs[1]).toMatchObject({ index: 6, degrees: 16.1, englishLabel: "Tzais" });
  });

  it("returns empty lists for empty input without throwing", () => {
    expect(parseBzs("")).toEqual({ zmanimDefs: [], toladotEntries: [] });
  });
});
