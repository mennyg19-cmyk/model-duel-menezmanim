# Phase 12 review — Desktop + sync (FINAL)

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 12

This is the final build phase for arm A. The claimed desktop/sync work is not ready to close: its Docker path is provably incompatible with the selected database driver, desktop BeeZee support is preview-only, and sync deletes cannot replicate.

## Meta

- Model (orchestrator-assigned): gpt-5.6-terra-high
- Arm reviewed: rebuild-a
- Phase number: 12
- Diff / files touched this phase: Phase commit `c1433ab` is present in the enclosing experiment repository. Review evidence focused on `desktop/**`, `app/api/sync/**`, `app/api/{zmanim/[date],schedule,announcements}/**`, `src/server/{sync-repo,sync-runner}.ts`, `src/core/sync/**`, schema, Docker files, and `next.config.ts`. No uncommitted or staged diff exists under `rebuild-a`; an unrelated untracked `../rebuild-b/src/io/` path exists.

## Proof-of-read

- `results/PHASE-REVIEW-RUBRIC.md` requires evidence or N/A for all 13 checks, explicit findings, and six 1–10 aggregation scores. It also requires review of running-app evidence and contestant git discipline.
- `rebuild-a/PHASE-PLAN.md` assigns Phase 12 exactly R10, DK1–DK26, G1–G13, E5/F-API4, F-CORE4, and the three desktop fixes. It requires the desktop scope/auth reconciliation to be surfaced before building.
- `rebuild-a/STATUS.md` marks Phase 12 and all phases complete, claims a separate Electron package, local APIs, device-token sync, durable logs, and successful web checks. Its recorded runtime evidence includes 183 tests and API calls on port 3101.
- `rebuild-a/DECISION-LOG.md` chooses local/display/hybrid plus Docker, device Bearer tokens for `/api/sync/*`, session auth for device CRUD/Docker, a Next standalone LAN child, self-contained paths, placeholder icons, and NSIS packaging.
- `inventory/FEATURE-INVENTORY.md` defines R10 as a native two-window local/offline/kiosk desktop app. Section 8 requires the three modes, a real local data path, full BeeZee import coverage, sync support, and fixes G1–G13; it specifically calls out F-CORE4 durable sync storage and F-API4 review.

## Checklist

1. **Inventory coverage** — **PARTIAL.**
   - **R10:** Electron is isolated in `desktop/` with display/admin windows, a local DB bootstrap, a LAN standalone server, tray controls, and packaging metadata. The claimed native desktop route exists but is not fully verified in Electron.
   - **DK1–DK16:** Mostly present in source: three modes, Docker compose, display/admin windows, shortcut, tray, persisted config, local DB path, IPC, standalone server, mode selector, and real local API routes. DK2 is nonfunctional (Finding 1).
   - **DK17–DK23:** **MISSING/STUB.** The only desktop importer accepts `.bzs`/`.txt`, parses one BZS format, and shows a preview dialog. It neither supports the required seven parsers/nine input types nor writes imported data to the local DB. `desktop/src/beezee.cjs` explicitly says it is unverified and does not write data.
   - **DK24/DK25:** **PARTIAL.** Protocol and `SyncClient` exist; Electron does a custom interval through `/api/sync/run` rather than wiring the claimed `SyncManager`.
   - **DK26:** **PARTIAL.** electron-builder has an NSIS target, but packaging was not run and bundled icons are only a README placeholder.
   - **G1–G4, G7–G9, G12–G13:** source-backed as present. **G5:** custom sync-update IPC emits from the custom loop. **G6:** partial because `SyncManager` remains unused. **G10/G11:** partial: placeholder icon note and unexercised NSIS configuration are not a shipped icon/installer.
   - **E5/F-API4:** present: pull/push/whoami require a hashed, revocable device Bearer token; admin device create/list/revoke is session role-guarded. Direct runtime check without a token returned 401.
   - **F-CORE4:** **PARTIAL.** `sync_logs` is written when incoming changes apply, but pull reads current rows by `updatedAt`, not the durable log. Deletes leave no tombstone for later pulls, so a delete cannot propagate to an offline peer (Finding 2).
   - **F-DESKTOP-COUPLING / F-DESKTOP-VERCEL:** present: the standalone preparation script uses rebuild-a-local paths and root `package.json` has no Electron dependency. **F-DESKTOP-WIRING:** partial because of the import/sync-manager/Docker gaps above.

2. **Running app** — **PARTIAL verification.** Started a temporary `npm run dev` server on port 3101, then stopped it. `GET /api/sync/pull?since=0` returned 401 without a token; `GET /api/schedule?org=demo`, `/api/announcements?org=demo`, and `/api/zmanim/2026-07-15?org=demo` each returned 200. Did not run Electron because it is a GUI package; did not verify authenticated pull/push end to end because creating a device token would mutate the test DB.

3. **No stubs** — **FAIL.** The desktop BeeZee control visibly says “preview” and does not import; the parser source labels itself unverified. Placeholder icon assets are also explicitly deferred. These are claimed desktop inventory work, not harmless developer scaffolding.

4. **Rule: ponytail** — **PARTIAL.** The separate desktop package and reuse of Next standalone are appropriately small. However, a second custom sync loop was added while `SyncManager` already exists, and the incomplete importer creates a user-facing control that cannot complete its advertised migration role.

5. **Rule: clean-code** — **PARTIAL.** Names, device-token hashing, zod request validation, and local API routes are clear. The desktop layer duplicates sync-client scheduling instead of using the existing client/manager pattern. More importantly, Docker declares Postgres while the whole schema/client is libSQL/SQLite-specific.

6. **Rule: workflow** — **PARTIAL.** STATUS contains a concrete verification list, and web typecheck/test/build evidence is reproducible. The final-phase completion claim conflicts with unverified desktop packaging, a broken Docker route, and explicitly preview-only BeeZee functionality. The finished-phase claim should not have been recorded.

7. **Rule: codegraph** — **N/A.** The project decision log records that no index exists and read/directory fallback is the selected approach. This review used targeted source inspection accordingly.

8. **Rule: git-discipline** — **PASS with attribution caveat.** The plan prohibits contestant git. The enclosing repository has an orchestrator-style Phase 12 commit (`c1433ab`) and no rebuild-a working-tree diff; this review cannot attribute that commit to the contestant, so it is not evidence of a contestant violation.

9. **Todos / PHASE-PLAN fidelity** — **PARTIAL.** The phase contains meaningful work for all named areas, including route auth, device management, durable-log writes, local feeds, Electron shell features, and package separation. It does not meet the plan's full DK1–DK26/G1–G13 claim because DK17–DK23 are absent, G6 is not actually wired, and DK2 cannot connect to its declared database.

10. **Context retention** — **PARTIAL.** Earlier decisions are followed for session auth, Bearer device tokens, standalone paths, and desktop isolation. The inventory's “take the more complete behavior” rule is not retained for BeeZee: a working multi-format desktop import was reduced to a non-persisting preview.

11. **Security** — **PARTIAL.** Good: tokens are generated randomly, only SHA-256 hashes are stored, revoked devices are rejected, and the admin device routes use org-role checks. No hardcoded production token was found. The Docker compose file hardcodes a production-looking `AUTH_SECRET: change-me-in-production`, and its database configuration is unusable; it must not be treated as deployable. The local LAN endpoints deliberately expose public org data, consistent with the desktop design, but were not separately access-reviewed.

12. **Code quality** — **5/10.** The web sync route/auth work is solid and the Electron shell covers several operational details. The final deliverable is held back by the nonfunctional Docker configuration, delete-unsafe sync design, unused sync abstraction, and importer gap.

13. **Findings**
   1. **HIGH — DK2 Docker cannot boot against its declared database.** `desktop/docker-compose.yml` sets `DATABASE_URL=postgresql://…`, while `src/db/client.ts` always constructs `@libsql/client`. A direct local probe returns `URL_SCHEME_NOT_SUPPORTED` for `postgresql:`. The Docker image also does not run migrations or seed data. This contradicts the claimed working Docker mode.
   2. **HIGH — F-CORE4 does not provide durable deletion sync.** `applyIncoming()` appends `sync_logs`, but `pullOrgChanges()` scans only extant table rows. After a deletion, no row or tombstone is returned to an offline peer, so delete replication fails. The durable log is audit-only rather than the sync feed.
   3. **HIGH — DK17–DK23 / primary desktop migration path is not implemented.** Desktop BeeZee handling is a `.bzs` preview with no DB write; it lacks the required parser/file-type coverage. This is explicitly called unverified in its source and cannot be marked complete.
   4. **MEDIUM — G6/DK25 is inaccurately claimed as wired.** `SyncManager` exists in `src/core/sync/client.ts` but Electron does not import or use it; `desktop/src/main.cjs` has a separate interval loop. The custom loop may operate, but it leaves the claimed manager unused and duplicates its concern.
   5. **MEDIUM — G10/G11 remain incomplete.** An NSIS target is configured, but no packaging evidence exists and the only bundled icon asset is a placeholder README. Status should not claim these gaps fully closed.

## Scores (1–10 each, for orchestrator aggregation)

- inventory_coverage: 4
- rule_adherence: 5
- plan_fidelity: 4
- context_retention: 5
- security: 6
- code_quality: 5
