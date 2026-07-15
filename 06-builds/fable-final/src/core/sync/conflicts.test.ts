import { describe, expect, it } from "vitest";
import { resolveConflict } from "./conflicts";

const newer = { updatedAt: 2000 };
const older = { updatedAt: 1000 };

describe("resolveConflict", () => {
  it("applies any change the receiver has never seen", () => {
    expect(resolveConflict("server-wins", newer, undefined)).toBe("apply");
    expect(resolveConflict("last-write-wins", older, undefined)).toBe("apply");
  });

  it("last-write-wins keeps the newer side and breaks ties toward existing", () => {
    expect(resolveConflict("last-write-wins", newer, older)).toBe("apply");
    expect(resolveConflict("last-write-wins", older, newer)).toBe("keep");
    expect(resolveConflict("last-write-wins", { updatedAt: 5 }, { updatedAt: 5 })).toBe("keep");
  });

  it("server-wins and client-wins ignore timestamps", () => {
    expect(resolveConflict("server-wins", newer, older)).toBe("keep");
    expect(resolveConflict("client-wins", older, newer)).toBe("apply");
  });

  it("manual defers to a human", () => {
    expect(resolveConflict("manual", newer, older)).toBe("defer");
  });
});
