Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 11 | Reaudit: true

# Phase review — rebuild-b Phase 11 (Durable offline sync)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 11
- Diff / files touched this phase: `app/api/sync/pull/route.ts` (+28), `app/api/sync/push/route.ts` (+115), `src/core/sync/{server,client,types}.ts` (+326), `src/server/sync-auth.ts` (+117), `prisma/schema.prisma` (+2 SyncLog model), `prisma/seed.ts` (+17 offline-seed-001), `.env.example` (+1), `src/core/index.ts` (+2), `STATUS.md`/`DECISION-LOG.md`/`run-state.md`/`README.md` docs. 666 insertions, 34 deletions.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, do NOT guess contestant model; phase review uses `PHASE-REVIEW-RUBRIC.md`, focus on this phase only, running-app optional (N/A OK).
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + 6 scores (1–10); evidence or `N/A` + why for every item.
- `FEATURE-INVENTORY.md` (Phase 11 IDs): `D17` = `SyncLog` (org/table/record/operation/data/timestamp/synced); `C12` = SyncMessage/Batch/Response + polling + 4 conflict strategies (lww/server-wins/client-wins/manual), `F-CORE4` durable store; `E5` = GET pull + POST push; `F-API4` = reviewed screen/device credential boundary, never trust client org id.
- `snapshots/b/p11/PHASE-PLAN.md`: Phase 11 claims `D17; C12; E5; F-CORE4; F-API4`; replace in-memory store with durable logs, define screen/device boundary, pull/push + 4 conflict strategies; done = seeded offline change survives restart, two-way sync, observable per-strategy evidence; Phase 12 excluded.
- `snapshots/b/p11/STATUS.md`: claims completed; evidence = typecheck/build pass, strategies returned `server-kept, server-kept, applied, manual`, manual conflict persisted, 401/200/403 trust boundary, post-restart pull 200 with 8 durable entries, server stopped before Phase 12.
- `snapshots/b/p11/DECISION-LOG.md`: three Phase 11 decisions — append-only `SyncLog` journal with server-receipt cursor + separate client timestamp; session-or-HMAC-screen-credential auth (canonical-org/screen scoped, 1-year expiry, `SYNC_DEVICE_SECRET`); conflict strategies via `baseTimestamp` + 5-min future-clock guard.
- `diffs/b-p11.patch`: pointer to snapshot tree at commit `b56a06c`; verified via `git show b56a06c` against rebuild-b repo (14 files, +666/-34).

## Checklist

1. **Inventory coverage** — Claimed: `D17`, `C12`, `E5`, `F-CORE4`, `F-API4`. All PRESENT.
   - `D17`/`F-CORE4`: `prisma/schema.prisma` adds `model SyncLog` (id/orgId/tableName/recordId/operation/data/timestamp/clientTimestamp?/synced + `Organization` relation, cascade delete). `DurableSyncServer` persists every accepted envelope; append-only (no in-place mutation except `synced` flag). Seed inserts `offline-seed-001` and STATUS shows it survived a production restart (8 durable entries post-restart). PRESENT.
   - `C12`: `types.ts` defines `ConflictStrategy` (4 const), `SyncChange`/`SyncMessage`/`SyncBatch`/`SyncLogEntry`/`SyncPullResponse`/`SyncPushResponse`/`SyncPushResult`/`SyncResponse`. `client.ts` is a polling `SyncClient` (cursor, `start`/`stop`/`pull`/`push`, `isPulling` guard, error callback). `server.ts` implements all four strategies with observable statuses (`applied`/`server-kept`/`manual`). PRESENT.
   - `E5`: `app/api/sync/pull/route.ts` (GET) + `app/api/sync/push/route.ts` (POST). Build output lists both routes. PRESENT.
   - `F-API4`: `src/server/sync-auth.ts` — HMAC Bearer screen credential bound to org+screen+expiry, requires active screen, `timingSafeEqual`; session path checks membership + role; org id is server-derived (`access.orgId`) and overrides any client-supplied `orgId` in the push body. PRESENT.

2. **Running app** — N/A. Snapshot has no `node_modules`; per reaudit instructions static evidence is preferred. STATUS records typecheck/build pass plus running-app evidence (strategy outputs, 401/200/403, post-restart survival). Static review of the committed code corroborates every claimed behavior.

3. **No stubs** — None. All four conflict strategies are fully implemented with distinct observable statuses. No dead buttons, no "coming soon". The only deliberate limitation is heterogeneous domain-table application deferred to the Phase 12 desktop adapter — logged as a reversible decision in DECISION-LOG, not marked done here.

4. **Rule: ponytail** — Clean. No new dependency added; reuses Prisma + Node `crypto`. Shortest working diff (666 lines for a durable journal + auth + 4 strategies + client + types + seed + docs). No speculative abstractions: `SyncBatch`/`SyncMessage` types exist but the push route uses a leaner inline envelope — minor, not bloat. `src/core/index.ts` re-exports `sync/client` + `sync/types` but deliberately NOT `sync/server` (Prisma-coupled), keeping core importable by the desktop client later. Good ladder discipline.

5. **Rule: clean-code** — Strong. Names state intent (`DurableSyncServer`, `authorizeSyncRequest`, `verifyScreenCredential`, `parseChange`). One error-handling pattern (throw in `parseChange`, caught at route boundary → 400 with message). One data path. Files split by concern (types/client/server/auth/routes) and all under 180 lines. Error messages state expected state (`"changes[${index}].tableName is not syncable"`, `"Screen sync requires Bearer credential and X-Screen-Id"`). Minor smell: `src/core/sync/server.ts` imports `../../db/client` (Prisma), so core reaches into the db layer — mitigated by not re-exporting it from `core/index.ts`, but the file would more naturally live under `src/server/`. Not a failure.

6. **Rule: workflow** — Expectation/verify discipline visible. STATUS records observable evidence per strategy and per trust-boundary branch, plus a real restart test (the F-CORE4 durability gate). No speculative product inventing; the one scope call (domain-table application stays in the desktop adapter) is logged as a reversible decision, not silently dropped. Phase stopped before Phase 12.

7. **Rule: codegraph** — N/A for this phase. New-feature addition, no structural lookup against existing symbols required. Contestant notes the arm was indexed once; no grep-for-symbol violation observed in the diff.

8. **Rule: git-discipline** — Contestant did NOT git. Commit `b56a06c` is authored by the orchestrator (Menny). No `git` invocation in the phase diff. Compliant with the experiment override.

9. **Todos / PHASE-PLAN fidelity** — Did what the plan said: durable logs (✓), screen/device credential boundary (✓), pull/push (✓), all four conflict strategies (✓), restart survival (✓). No scope creep, no shrinkage.

10. **Context retention** — Builds cleanly on Phase 10 (which left `/api/sync/*` absent by design). STATUS explicitly carries prior state forward. No contradiction of earlier phases; reuses existing `getSessionUser`, `prisma`, `Organization`/`Screen` models. The `syncLog` relation added to `Organization` is additive.

11. **Security** — Solid trust boundary. HMAC-SHA256 with `timingSafeEqual`; credential payload signed + expiry-checked + org/screen-bound; inactive screen rejects (403); mismatched screen header 403; anonymous 401; write roles enforced (owner/admin/editor); org id server-derived and overrides client body. Input bounds: 1–100 changes, 256 KiB per change, allowlisted `SYNCABLE_TABLES`, recordId length cap, ISO-8601 validation, 5-min future-clock guard. Findings (minor, non-blocking):
    - **F1:** `credentialSecret()` falls back to a hard-coded `"rebuild-b-sync-dev-secret"` when neither `SYNC_DEVICE_SECRET` nor `SESSION_SECRET` is set. Documented in `.env.example`, acceptable for the experiment, but a production deploy that forgets the env var would silently sign with a public constant. Worth a fail-closed startup check.
    - **F2:** `pull` marks every returned row `synced: true` as a side effect of delivery. With multiple devices pulling, the first reader marks rows "synced" for all others, so `synced` semantically means "delivered to some client" not "acknowledged by this client." Matches the append-only journal decision and is reversible, but the column name oversells the guarantee.
    - **F3:** `last-write-wins` compares the incoming client timestamp against `latest.clientTimestamp ?? latest.timestamp`. When the prior row has no `clientTimestamp` (e.g. a server-seeded row), it falls back to the server receipt timestamp, which can make a legitimately newer offline client change lose to a seeded row. Edge case; logged as reversible to server sequence numbers.

12. **Code quality** — 8/10. Clean separation, real auth, bounded input, observable strategies, durable persistence verified by restart. Loses two points for: the core→db coupling in `server.ts` (layering), the `synced` semantic stretch, and the dev-secret fallback. None block the phase gate.

13. **Findings**
    1. (security, minor) `credentialSecret()` hard-coded dev fallback — fail-closed on missing secret in production.
    2. (semantics, minor) `pull` marks rows `synced=true` on delivery to any client; rename or scope per-device if per-device ack is ever needed.
    3. (correctness, minor) `last-write-wins` falls back to server timestamp when prior row lacks `clientTimestamp`; a newer offline change could lose to a seeded row. Reversible to server sequence numbers (already noted in DECISION-LOG).
    4. (layering, minor) `src/core/sync/server.ts` imports Prisma (`../../db/client`); move to `src/server/` to keep core db-free, or keep but stop the index re-export (already done) — document the carve-out.

## Scores
- inventory_coverage: 10
- rule_adherence: 9
- plan_fidelity: 10
- context_retention: 10
- security: 9
- code_quality: 8
