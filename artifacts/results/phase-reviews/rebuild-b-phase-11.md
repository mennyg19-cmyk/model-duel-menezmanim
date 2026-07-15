# Phase review: rebuild-b, Phase 11

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 11

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 11 — Durable offline sync
- Diff / files touched this phase (per STATUS.md / code read): `app/api/sync/pull/route.ts`, `app/api/sync/push/route.ts`, `src/core/sync/types.ts`, `src/core/sync/server.ts`, `src/core/sync/client.ts`, `src/server/sync-auth.ts`, `prisma/schema.prisma` (`SyncLog` model + `Screen.lastSeenAt` predates this phase), `prisma/seed.ts` (offline seed record), `.env.example` (`SYNC_DEVICE_SECRET`).

## Proof-of-read

**`PHASE-REVIEW-RUBRIC.md`** — Reviewer fills every checklist item with evidence or a justified `N/A`, writes the full report to the path the spawn prompt gives, and closes with 1–10 scores for orchestrator aggregation across six dimensions (inventory coverage, rule adherence, plan fidelity, context retention, security, code quality).

**`PHASE-PLAN.md` (Phase 11 section)** — Claims `D17`, `C12`, `E5`, `F-CORE4`, `F-API4`. Scope is: replace the in-memory sync store with a durable log, define the screen/device credential boundary, and implement pull/push with all four conflict strategies (last-write-wins, server-wins, client-wins, manual). Done-when: a seeded offline change survives a restart, syncs both directions, and each conflict strategy is observable. Phase 12 (desktop/LAN) is explicitly out of scope for this phase.

**`STATUS.md`** — Contestant marks Phase 11 complete, claims all five IDs, and lists: a Prisma-backed append-only `SyncLog` with server-receipt cursor pagination, GET/POST sync routes with bounded batches and an allowlisted table set, all four conflict strategies, session-or-screen-credential auth that rejects inactive/mismatched screens, a seeded `offline-seed-001` durable row, and a documented `SYNC_DEVICE_SECRET`. Verification evidence section claims typecheck/build passed, pre-restart pull/push/conflict behavior, trust-boundary checks (401/200/403), and post-restart durability (8 entries).

**`DECISION-LOG.md`** (Phase 11 entries) — Three dated decisions: (1) `SyncLog` is an append-only transport journal, not a per-device state store — domain-table application is explicitly deferred to a future desktop adapter; (2) sync accepts either a server session or an HMAC-signed, org/screen-scoped, expiring Bearer credential, with a documented fallback secret; (3) conflict strategies compare a `baseTimestamp` against the latest durable row, with a 5-minute future-clock guard. Each entry states the why and marks itself reversible toward Phase 12 needs (per-device acks, rotatable credentials).

**`FEATURE-INVENTORY.md`** (Phase 11 IDs) — `D17` `SyncLog` needs org/table/record/operation/data/timestamp/synced fields. `C12`/`F-CORE4` require the offline sync protocol (SyncMessage/Batch/Response, all four conflict strategies) backed by durable storage instead of the old in-memory `SyncServer`. `E5`/`F-API4` require GET pull + POST push with the client/screen-token trust boundary reviewed rather than assumed.

**Phase 11 code** (`app/api/sync/**`, `src/core/sync/**`, `src/server/sync-auth.ts`, schema, seed, `.env.example`) — Read in full; see checklist below for what it actually does.

## Checklist

**1. Inventory coverage**

| ID | Status | Evidence |
|---|---|---|
| D17 (`SyncLog`) | PRESENT | `prisma/schema.prisma:354-369` has orgId/tableName/recordId/operation/data/timestamp/synced plus an added `clientTimestamp`, matching the model spec and enabling last-write-wins comparisons. |
| C12 (conflict strategies) | PRESENT | `src/core/sync/server.ts` `pushChange` implements last-write-wins, server-wins, client-wins, and manual. Verified live: pushed a "conflict-test-1" record, then a stale-`baseTimestamp` older change under `last-write-wins` returned `server-kept`; a newer one returned `applied`; `server-wins` returned `server-kept` even for a newer client change; `client-wins` returned `applied` even for a stale one; `manual` returned a durable `operation="conflict"` row embedding both versions. |
| E5 (pull/push) | PRESENT | `GET /api/sync/pull`, `POST /api/sync/push` both live and exercised (see "Running app" below). |
| F-CORE4 (durable storage) | PRESENT | `DurableSyncServer` is 100% Prisma-backed, no in-memory `Map`/array. Verified by restarting the dev server and re-pulling: all 9 entries (seed + my test pushes) survived. |
| F-API4 (credential boundary review) | PARTIAL | Verification side is solid (see Security below), but there is no admin UI or API route anywhere in the app that calls `createScreenCredential` — it is exported from `sync-auth.ts` and never imported elsewhere. A real screen/device has no way to obtain a credential short of someone hand-signing one out-of-band. The "boundary" is reviewed and enforced, but not yet operable end-to-end. |

**2. Running app** — Verified directly. Ran `npm run db:setup` then `npm run dev` (port 3102). Signed my own session/screen tokens with the app's own HMAC scheme (same `SESSION_SECRET`/`SYNC_DEVICE_SECRET` values from `.env`) since there's no UI to obtain a screen credential (see F-API4 above), then drove the API with curl:
- Anonymous `GET /api/sync/pull` → 401.
- Valid screen credential → 200, returned the seeded `offline-seed-001` row.
- Screen credential with mismatched `X-Screen-Id` → 403; expired screen credential → 401.
- Screen credential `POST /api/sync/push` → 200 (screens can push, by design — this is the offline-device use case).
- All four conflict strategies exercised as in the checklist row above.
- Non-allowlisted table (`User`) → 400 `"tableName is not syncable"`.
- Killed the dev server (taskkill), restarted it, pulled again: all 9 durable rows (seed + every test push, including the manual conflict record) were still there. Confirms restart durability.
- `npm run typecheck` → clean, no errors.
- Stopped the server afterward (port 3102 confirmed free).

**3. No stubs** — None found in this phase's code. Pull, push, all four strategies, and the trust boundary all execute real logic against real storage. The one incompleteness (no credential-issuance endpoint) is a missing integration point, not a stub/fake handler.

**4. Rule: ponytail** — Good adherence. HMAC-signed stateless tokens via Node's built-in `crypto` (no JWT library added); base64url cursor encoding is a few lines, no pagination framework. No speculative abstractions — one `DurableSyncServer` class, one `SyncClient`, no factory/strategy-pattern ceremony for the four conflict strategies (a `switch`-shaped `if` chain is proportional to four cases).

**5. Rule: clean-code** — Names are intention-revealing (`pushChange`, `isConflictStrategy`, `decodeCursor`). Error messages state what's wrong (`"changes[0].timestamp cannot be more than five minutes in the future"`). One error-handling pattern throughout (validate → throw with message → route catches → JSON error). No dead code inside the sync module itself. Minor knock: `createScreenCredential` is unused dead-ish code from the app's perspective (exported, zero call sites) — see finding 1.

**6. Rule: workflow** — Expectation/verify discipline is visible and matches what I could reproduce independently: STATUS.md's claimed pre/post-restart evidence (seeded pull true, `server-kept`/`server-kept`/`applied`/`manual` statuses, 401/200/403 trust-boundary results, 8 durable entries post-restart) lines up with what running the app produced for me (I got 9 because I added one more test row before restarting). No speculative product invention — scope stayed inside D17/C12/E5/F-CORE4/F-API4 and explicitly deferred domain-table application and credential issuance UI to Phase 12, logged as such.

**7. Rule: codegraph** — N/A for this review — no codegraph MCP session or index was available to me, and I have no way to confirm what the contestant's own session used. Not scorable either way.

**8. Rule: git-discipline** — No violation. `git log` shows commits exist for each phase (owned by the orchestrator per `CONTESTANT-PROMPT.md`), and `git status` inside `rebuild-b` shows no stray unstaged changes attributable to this phase's work.

**9. Todos / PHASE-PLAN fidelity** — Matches the plan closely. "Replace the in-memory sync store with durable logs" — done. "Define the screen/device credential boundary" — done on the verification side, not on the issuance side (finding 1). "Implement pull/push plus all four conflict strategies" — done and verified live. Done-when criteria (survive restart, sync both directions, each strategy observable) all reproduced independently.

**10. Context retention** — Consistent with earlier phases. Reuses the Phase 2 local-session auth (`getSessionUser`) rather than inventing a new auth path, keeps to the established Prisma/SQLite pattern, and the decision log correctly cites the older F-API4 problem statement ("Clerk-protected today, needs screen-token review") and updates it for the local-session-based reality decided in Phase 2. No contradictions with prior phases spotted.

**11. Security**
- Every write is authorized: session pushes require `owner`/`admin`/`editor` role via `WRITE_ROLES`; screen credentials are verified with `timingSafeEqual` (constant-time), scoped to one org + one active screen, and re-checked against the live `Screen` row (deactivating a screen kills its credential).
- orgId from the request is resolved server-side to a canonical org record, not trusted blindly, before any authorization decision.
- Table allowlist (`SYNCABLE_TABLES`) blocks writes to non-domain models (verified: `User` table rejected with 400).
- Size/count bounds on push (`MAX_CHANGES=100`, 256 KiB/change) and a 5-minute future-clock guard on client timestamps, both verified live.
- Two notes, both already flagged as reversible in DECISION-LOG rather than hidden: (a) the screen-credential secret falls back to a hardcoded dev string if `SYNC_DEVICE_SECRET`/`SESSION_SECRET` are unset — fine for local dev, must not ship to a real deployment without the env var set (the `.env.example` placeholder makes this visible, not silent); (b) screen credentials are stateless bearer tokens — the only revocation path is deactivating that screen or rotating the shared secret for everyone, there's no per-token revocation list. Both are named, reversible design choices, not oversights.

**12. Code quality — 8/10.** Clean, proportional implementation. Cursor encoding, HMAC signing, and conflict resolution are all straightforward and readable. The one deduction is the disconnect between `createScreenCredential` existing and nothing in the app calling it — a real operator cannot yet get a screen onto sync without external tooling.

**13. Findings**
1. **No credential-issuance path.** `createScreenCredential` (`src/server/sync-auth.ts:25`) is exported but has zero call sites anywhere in the app — no admin route or UI action generates a screen credential. The verification side of F-API4 is solid and independently confirmed; the issuance side isn't wired up yet. I had to hand-sign tokens with the app's own HMAC scheme to test the boundary at all. Given DECISION-LOG already flags "reversible to persisted, rotatable device credentials in Phase 12," this may be an intentional phase-boundary cut — but it isn't explicitly logged as a Phase 11 scope reduction, so flagging for the orchestrator to confirm it's an accepted gap rather than a miss.
2. **Seed's offline-timestamp is a hardcoded absolute date**, not computed relative to `Date.now()` (`prisma/seed.ts:631`: `new Date("2026-07-15T08:00:00.000Z")`). STATUS.md's "a day-old offline change" claim only holds when the app is seeded/run on or after 2026-07-15; re-seeding on a different date would silently change what "day-old" means (or put it in the future). Cosmetic, not a functional defect today — confirmed the row itself pulls and persists correctly regardless.

No other findings — implementation matches its stated scope, is independently verifiable, and degrades gracefully at its boundaries (400s and 401/403s are informative, not generic 500s, except for the one intentionally-generic 500 on unexpected push failure).

## Scores (1–10 each)
- inventory_coverage: 8
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
