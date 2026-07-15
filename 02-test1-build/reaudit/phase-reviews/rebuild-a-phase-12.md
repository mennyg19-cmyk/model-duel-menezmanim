Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 12 | Reaudit: true

# Phase review — rebuild-a, Phase 12 (Desktop + sync, FINAL)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 12 (FINAL)
- Diff / files touched this phase: new `desktop/` package (`package.json`, `src/main.cjs`, `preload.cjs`, `server.cjs`, `config.cjs`, `db-bootstrap.cjs`, `beezee.cjs`, `scripts/prepare-standalone.mjs`, `Dockerfile`, `docker-compose.yml`, `README.md`); new web routes `app/api/sync/{pull,push,run,whoami}/route.ts`, `app/api/org/[orgId]/devices/{route,[deviceId]/route}.ts`, `app/api/schedule/route.ts`, `app/api/announcements/route.ts`, `app/api/zmanim/[date]/route.ts`; new `app/admin/[orgSlug]/devices/page.tsx` + `src/admin/devices/DevicesClient.tsx`; new `src/server/sync-repo.ts`, `src/server/sync-runner.ts`; new schema tables `sync_logs` (D17), `sync_devices`; new `src/core/sync/{client,conflicts,protocol}.ts` + tests. p11 had no `desktop/`, no `sync-repo`, no sync/schedule/announcements API routes — all confirmed new this phase.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md**: single third-party reviewer, use PHASE-REVIEW-RUBRIC, focus on this phase only, static evidence preferred, running-app N/A OK, do not guess contestant model.
- **PHASE-REVIEW-RUBRIC.md**: 13-item checklist + 6 scores (1–10), fill every item with evidence or N/A+why.
- **FEATURE-INVENTORY.md**: §8 desktop registry DK1–DK26 + gaps G1–G13; three modes + Docker; sync pull/push (E5, F-API4); F-CORE4 durable D17; F-DESKTOP-COUPLING/WIRING/VERCEL; merge rule take-more-complete; open calls F-FIDS + desktop scope/auth.
- **PHASE-PLAN.md (p12)**: Phase 12 = R10, DK1–DK26, G1–G13, E5+F-API4, F-CORE4, F-DESKTOP-COUPLING/WIRING/VERCEL; desktop scope/auth reconciliation surfaced before build. Coverage check maps DK/G → 12.
- **STATUS.md (p12)**: claims R10, DK1–DK26, G1–G13, E5+F-API4, F-CORE4, F-DESKTOP-*; "All phases complete"; verification evidence walked 2026-07-15 (pair → token, pull 200/37 changes, push 200/0, local schedule/announcements/zmanim 200, devices page 200, sync/run 403 under session auth, typecheck clean, 183 tests, build green).
- **DECISION-LOG.md (p12)**: top entry "Phase 12 desktop scope/auth DECIDED" — ships local/display/hybrid + Docker; device Bearer token for sync, session cookie for admin device CRUD; Docker `AUTH_MODE=session`; LAN = Next standalone child not Express; `rebuild-a/desktop/` own package.json never a web dep; icons placeholder README + NSIS target; reversible.
- **a-p12.patch**: "PHASE 1 - no previous phase" — diff is the snapshot tree itself; reviewed via p12 tree + p11 absence checks instead.
- Spot-checked p12 tree incl. `desktop/` (all 6 CJS sources, Dockerfile, compose, prepare script), web `app/api/sync|schedule|announcements|zmanim/[date]`, devices page + client, `src/server/sync-*`, `src/core/sync/*`, schema tables, root + desktop `package.json`.

## Checklist

1. **Inventory coverage** — R10 PRESENT (Electron package at `desktop/`). DK1 PRESENT (local/display/hybrid modes drive launch), DK2 PRESENT (compose + Dockerfile, session auth), DK3 PRESENT (1920×1080 display window), DK4 PRESENT (1200×800 admin window + single-instance lock), DK5 PRESENT (tray menu; icon is a 1×1 data-URL placeholder — G10), DK6 PRESENT (`Ctrl+Shift+A` → admin), DK7 PRESENT (`config.json` in userData), DK8 PRESENT (local SQLite `file:` + bootstrap), DK9 PRESENT (preload bridge: getConfig/saveConfig/getDbPath/getMode/onSyncUpdate + bonus getLanUrl), DK10 PARTIAL — DECIDED deviation: Next standalone child replaces the inventory's Express server on port 3001 (DECISION-LOG; same real `/api/*` routes, resolves G8), DK11 PRESENT (`lanAddress()`), DK12 PARTIAL — `/mobile` served over LAN via tray "Open LAN mobile" but no PWA manifest/installability (G9), DK13 PRESENT (`/api/zmanim/[date]` proxies to engine-backed `/api/zmanim`), DK14 PRESENT (`/api/schedule?org=` real DB rows), DK15 PRESENT (`/api/announcements?org=` real DB rows — v1 returned empty; this is fuller), DK16 PRESENT (tray mode radio submenu), DK17 PARTIAL (`.bzs` parser ported + file picker, but picker→parser→summary dialog only; apply-to-DB deferred to web Phase 10; explicitly marked UNVERIFIED), DK18–DK23 MISSING (only `.bzs`/`.txt`; the other 8 BeeZee file types / 7 parsers not ported), DK24 PRESENT (4 conflict strategies in protocol + conflicts.ts), DK25 PRESENT (`SyncClient` + `SyncManager`), DK26 PRESENT (electron-builder NSIS target; icons placeholder). G1 kiosk PRESENT, G2 auto-start PRESENT (`setLoginItemSettings`), G3 single-instance PRESENT, G4 BZS file picker PRESENT, G5 sync-update IPC emit PRESENT (`emitSyncUpdate` + preload), G6 PARTIAL — `SyncManager` class built+tested but `main.cjs` hybrid loop reimplements its own tick via `/api/sync/run` instead of using the class, G7 mode drives launch PRESENT, G8 local APIs→DB PRESENT, G9 PARTIAL (LAN-served `/mobile`, no PWA), G10 icons placeholder PRESENT (README), G11 NSIS target PRESENT, G12 tray keep-alive PRESENT (`window-all-closed` stays when tray exists), G13 LAN URL in tray PRESENT (copy + open). E5 PRESENT + F-API4 PRESENT (device Bearer tokens, sha256-hashed). F-CORE4 PRESENT (durable `sync_logs` rows written on every apply). F-DESKTOP-COUPLING PRESENT (rebuild-a-local paths in `resolvePaths`/`prepare-standalone`). F-DESKTOP-WIRING PRESENT (modes/APIs/sync/IPC/kiosk/auto-start/single-instance all wired). F-DESKTOP-VERCEL PRESENT (root `package.json` has zero electron/better-sqlite3 deps; desktop owns them).

2. **Running app** — N/A (snapshot has no `node_modules` / no built `.next/standalone`); not run. Static evidence is strong: STATUS records a walked verification (pair → `mez_…` token, `whoami` → demo, pull 200/37, push 200/0, local feeds 200, devices page 200, `/api/sync/run` 403 under session auth, typecheck clean, 183 tests, build green). Code paths corroborate the claimed responses.

3. **No stubs** — no dead buttons marked done. `/api/schedule`, `/api/announcements`, `/api/zmanim/[date]` return real DB data (v1 returned empty). BeeZee picker is honestly labeled "preview only — full DB import uses Admin → Import/Export" and the parser file header says "UNVERIFIED (deferred by decision)" — not falsely claimed done. `SyncManager` is functional (tested) though not the path `main.cjs` uses. Tray "Open LAN mobile" hits a real route. The only "coming soon"-style item (icons) is explicitly a placeholder README per G10.

4. **Rule: ponytail** — shortest-diff respected: separate `desktop/` package isolates electron deps (no web bloat). CJS `beezee.cjs` is a deliberate byte-copy of the web TS parser (can't import TS from Electron CJS) — logged, not slop. No unrequested abstractions; `SyncClient`/`SyncManager` exist because the inventory names them (DK25). One mild redundancy: `main.cjs`'s `startSyncLoop` overlaps `SyncManager.tick` logic (could reuse the class). Ladder respected — stdlib `node:crypto`/`node:net`/`node:http` used for hashing, port probe, health check.

5. **Rule: clean-code** — naming clear (`authenticateDevice`, `belongsToOrg`, `pullOrgChanges`, `applyIncoming`, `runSyncCycle`). Error handling present (401 missing/revoked token, 400 bad payload, 403 non-local runner, 502 sync failure). One pattern per concern (zod for bodies, bearer helper duplicated across pull/push/whoami — minor, 3 call sites, borderline Rule-of-2 OK). No god files (`main.cjs` ~410 lines, single concern). Comments are explanatory non-obvious (the CJS "what's in this file" headers are slightly narratory but useful for the Electron/CJS port boundary). No swallowed errors.

6. **Rule: workflow** — expectation/verify discipline visible: STATUS walks 6 concrete checks with status codes/counts. Spec-gate product call (desktop scope/auth reconciliation) resolved via DECIDED entry before build, not invented silently. Open call F-FIDS was already settled in Phase 2. No speculative product inventing.

7. **Rule: codegraph** — N/A. No `.codegraph/` index in the experiment workspace; DECISION-LOG "codegraph skipped" recorded in Phase 1. Structural review done via Read + dir listing (literals/paths), acceptable per the hybrid rule.

8. **Rule: git-discipline** — contestant did NOT git. No `.git/` in snapshot; STATUS/DECISION-LOG attribute commits to the orchestrator. Correct.

9. **Todos / PHASE-PLAN fidelity** — Plan said: R10, DK1–DK26, G1–G13, E5+F-API4, F-CORE4, F-DESKTOP-COUPLING/WIRING/VERCEL, desktop scope/auth reconciliation. All addressed. Deviations are logged DECIDED (DK10 Next-standalone vs Express; DK17 BeeZee preview-only with full import in web Phase 10; Docker session auth). DK18–DK23 (non-`.bzs` BeeZee types) not ported — the only plan item with no coverage and no explicit deferral entry; minor gap given the importer is preview-only by decision.

10. **Context retention** — builds on Phase 1's harvested C12 sync protocol (`src/core/sync/protocol.ts` existed in p11) and extends it; reuses the existing `requireOrgRole` guard, `db`/schema, `authMode`/`AuthError`. New `sync_logs`/`sync_devices` tables added cleanly to the same schema. No contradiction of earlier phases. The flat-`isSuperAdmin`/session-auth choices from Phase 3 are respected (sync/run 403s under session auth).

11. **Security** — strong. Device tokens stored only as sha256 hashes (`tokenHash` unique); plaintext shown once at creation. `authenticateDevice` rejects revoked tokens and stamps `lastSeenAt`. `applyIncoming` enforces `belongsToOrg` per table and explicitly refuses to let a device touch the global `tukachinskyNotes` baseline; an upsert whose id collides with another org's existing row is refused (cross-org overwrite guard). `/api/sync/run` gated to `AUTH_MODE=local` (403 otherwise) so the cloud-exposed web app cannot be turned into a sync orchestrator. Push body zod-validated and filtered through `isSyncableTable`. Device CRUD behind `requireOrgRole("admin")`. Docker `AUTH_SECRET` is a placeholder `change-me-in-production` (example file — acceptable). LAN bind is configurable (`serveLan`) and guarded by `MENEZMANIM_LAN_GUARD`. No secrets committed.

12. **Code quality** — 8/10. Clean structure, real wiring, thoughtful security (cross-org collision guard, hashed tokens, baseline protection). Deductions: `SyncManager` class built+tested but not actually used by `main.cjs` (reimplemented loop — DRY miss + a tested-but-dead-in-prod path); `/api/zmanim/[date]` self-fetches `/api/zmanim` (extra internal round trip — could call the handler directly); `client.test.ts` is near-trivial (`toBeTruthy`); DK18–DK23 uncovered. CJS headers are slightly narratory but defensible at the TS/CJS boundary.

13. **Findings**
   1. DK18–DK23 (BeeZee file types beyond `.bzs`: `Setting.txt`, `RulesGroupFile.dat`, `CalendarFile.dat`, `.StyleConfig`, `.yrz`, `.rtf`, backgrounds, media) not ported; picker accepts only `.bzs`/`.txt`. No explicit DECISION-LOG deferral for these — the "preview-only" decision covers apply-to-DB but not the missing parsers.
   2. `SyncManager` (G6) is implemented and unit-tested but `main.cjs`'s `startSyncLoop` reimplements the cycle via `/api/sync/run` instead of consuming the class — library-only, slight DRY/redundancy.
   3. G9 mobile PWA: `/mobile` is served over LAN but no web manifest/install criteria were added, so "PWA" is overstated vs inventory DK12/G9.
   4. `/api/zmanim/[date]` (DK13) proxies via an internal `fetch` to `/api/zmanim` rather than sharing the handler — works, adds a round trip.
   5. `client.test.ts` is thin (build + allow-list assert only); `SyncClient.pull`/`push`/`whoami` paths untested.
   6. Minor: bearer-parse helper duplicated across pull/push/whoami (3 sites) — eligible for a tiny shared helper under Rule-of-2.

## Scores
- inventory_coverage: 8
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
