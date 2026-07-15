// === What's in this file ===
// The one rule for settling a row that changed on BOTH the cloud and a device since
// they last talked (C12). Pure and tested — no DB — so the server and the desktop
// client agree on who wins.
//
// resolveConflict(strategy, incoming, existing) -- decides whether the INCOMING
//   change (the one being pushed/pulled) should overwrite the EXISTING row:
//     last-write-wins -> the newer updatedAt wins (ties keep existing, no churn)
//     server-wins     -> existing (the receiver's) row always wins
//     client-wins     -> the incoming row always wins
//     manual          -> don't auto-apply; flag it for a person to settle
//   "existing" is undefined when the receiver has never seen the row (always apply).

import type { ConflictStrategy, SyncChange } from "./protocol";

export type ConflictOutcome = "apply" | "keep" | "defer";

export function resolveConflict(
  strategy: ConflictStrategy,
  incoming: Pick<SyncChange, "updatedAt">,
  existing: { updatedAt: number } | undefined,
): ConflictOutcome {
  if (!existing) return "apply"; // brand-new row on this side — no conflict
  switch (strategy) {
    case "client-wins":
      return "apply";
    case "server-wins":
      return "keep";
    case "manual":
      return "defer";
    case "last-write-wins":
    default:
      return incoming.updatedAt > existing.updatedAt ? "apply" : "keep";
  }
}
