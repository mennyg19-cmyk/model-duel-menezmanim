import { describe, expect, it } from "vitest";
import { SyncClient } from "./client";
import { SYNCABLE_TABLES } from "./protocol";

describe("SyncClient / protocol (DK24/DK25)", () => {
  it("exposes syncable table allow-list", () => {
    expect(SYNCABLE_TABLES).toContain("screens");
    expect(SYNCABLE_TABLES).toContain("minyanSchedules");
  });

  it("builds with base URL + token", () => {
    const client = new SyncClient("http://localhost:3101", "mez_test");
    expect(client).toBeTruthy();
  });
});
