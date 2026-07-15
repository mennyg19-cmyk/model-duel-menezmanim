import { describe, expect, it } from "vitest";
import { meResponse } from "./me";
import type { Actor } from "./model";

const actor: Actor = {
  userId: "u1",
  clerkUserId: "c1",
  email: "a@b.com",
  name: "Tester",
  isSuperAdmin: true,
  memberships: [{ orgId: "o1", orgSlug: "demo", role: "owner" }],
};

describe("/api/me contract (F-ME-SHAPE)", () => {
  it("exposes isSuperAdmin at the top level", () => {
    const res = meResponse(actor);
    expect(res.isSuperAdmin).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(res, "isSuperAdmin")).toBe(true);
  });

  it("does not nest the flag under user/actor", () => {
    const res = meResponse(actor) as unknown as Record<string, unknown>;
    expect(res.user).toBeUndefined();
    expect(res.actor).toBeUndefined();
  });

  it("keeps memberships as a top-level array", () => {
    const res = meResponse(actor);
    expect(Array.isArray(res.memberships)).toBe(true);
    expect(res.memberships[0]?.role).toBe("owner");
  });
});
