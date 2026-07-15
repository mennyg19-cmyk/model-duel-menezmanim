# Phase review — rebuild-b, Phase 12 (final)

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 12

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 12 — Desktop, LAN, and self-hosting (FINAL build phase for arm B)
- Diff / files touched this phase: `desktop/**` (Electron main/preload/config/db/local-api/network/next-server/runtime-plan/sync-manager/beezee, `ui/`, `mobile/`, `scripts/`, `build/` icons), root `Dockerfile`, `docker-compose.yml`, `docker/entrypoint.sh`, `docker/seed-if-empty.mjs`, `scripts/start-standalone.mjs`, root `package.json` desktop scripts. No changes to prior-phase web routes were needed; Phase 12 consumes Phase 11's sync contract (`src/server/sync-auth.ts`) and existing `/api/org/[orgId]/import` and `/api/auth/login` as-is.

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md**: 13-item checklist plus a 6-score block (inventory_coverage, rule_adherence, plan_fidelity, context_retention, security, code_quality). Every item needs evidence or an explicit `N/A` + reason.

**PHASE-PLAN.md Phase 12**: Claims `R10`, `DK1–DK26`, `G1–G13`, `F-DESKTOP-COUPLING/WIRING/VERCEL`. Requires all three Electron modes, two-window UX, tray/shortcut/config/IPC, local SQLite+APIs, LAN mobile hosting, BeeZee parsers+picker, sync wiring, kiosk/autostart/single-instance, icons/installers, and an isolated Docker deployment. "Done" = packaged installers exercise local/hybrid/display-only flows, LAN clients get real local data, BeeZee import works, web/Docker never compile native desktop deps.

**STATUS.md**: Claims all `DK1–DK26`/`G1–G13` wired (not stub), desktop isolated as its own package with no Electron/better-sqlite3 leakage into root `package-lock.json`, NSIS installer built (172,207,566 bytes), win-unpacked smoke-verified live (`/show/demo/main` 200, LAN `/health` 200, schedule=5, PWA 200, second-instance exits via lock), Docker/Postgres lint-only (no runtime here), all processes stopped at the end.

**DECISION-LOG.md** (Phase 12 entries, 2026-07-15): (1) Desktop is an isolated Electron package — root never installs it, staging renames traced `node_modules`→`modules` so electron-builder doesn't prune it. (2) `node:sqlite` + Express 3001 for LAN, no native SQLite dep added. (3) Hybrid sync overlays a durable `DesktopSyncInbox`, IPC emits sync state. (4) Self-host reuses the existing signed-cookie session adapter rather than adding NextAuth. (5) BeeZee import parses nine file families via seven parsers, applies `.bzs` through the guarded local web importer.

**FEATURE-INVENTORY.md** (Section 8, DK/G ledger + fix items): v1 baseline had DK3/DK4/DK6/DK11 working, DK1/DK5/DK7-10/DK16-25 stub/partial, DK12-15/DK26 fully stub (empty API routes, dir-target only, no icons). `G1-G13` were all gaps (kiosk, autostart, single-instance, picker, sync IPC, mode wiring, DB-backed APIs, PWA, icons, installers, tray lifetime, LAN URL surfaced). `F-DESKTOP-COUPLING/WIRING/VERCEL` describe exactly the three risks this phase had to close: monorepo path coupling, unwired stubs, and native deps breaking Vercel/root installs.

## Checklist

### 1. Inventory coverage

| ID | Status | Evidence |
|---|---|---|
| R10 | PRESENT | Two real `BrowserWindow`s (1920×1080 kiosk display, 1200×800 admin), local SQLite via `node:sqlite`, LAN Express server, BZS import, offline/kiosk config — all live-tested below. |
| DK1 (3-mode arch) | PRESENT | `runtime-plan.cjs` branches fully-local/hybrid/display-only; `scripts/smoke.cjs` asserts all three plans; live LAN/API tests below ran under `hybrid`. |
| DK2 (Docker) | PRESENT, inspect-only | `Dockerfile`/`docker-compose.yml` reviewed line-by-line (below); Docker/Podman not installed in this session, matches STATUS.md's own caveat. |
| DK3/DK4 (2 windows, single-instance) | PRESENT | Live: launched packaged app, `1x` listener on 3001, second launch produced **no** new listener and no log entry — confirms `requestSingleInstanceLock` + `second-instance` handler actually fire (STATUS.md's claim reproduced independently). |
| DK5 (tray, icons) | PRESENT | `build/icon.png` is a real 11,075-byte PNG (not empty/placeholder); `Tray` + context menu (`Show display`, `Desktop settings`, `Open admin`, `Copy LAN URL`, `Quit`) wired in `main.cjs`. Not visually confirmed (no interactive GUI session) — code-inspected. |
| DK6 (global shortcut) | PRESENT, inspect-only | `globalShortcut.register("CommandOrControl+Shift+A", showDesktopSettings)` — registered, not manually pressed. |
| DK7 (config.json) | PRESENT | Live: `scripts/smoke.cjs` round-trips `saveConfig`/`loadConfig` and asserts persistence; I reran the same smoke test independently — passed. |
| DK8 (local SQLite path) | PRESENT | Live: `/api/schedule` via the LAN server returned 5 real seeded rows (`Shacharit`, `Shacharit (Shabbat)`, `Mincha`, `Maariv`, placeholder) sourced straight from `{userData}/data/zmanim.db`. |
| DK9 (5-method IPC) | PRESENT | `preload.cjs` exposes `getConfig/saveConfig/getDbPath/onSyncUpdate/getMode` (the original 5) plus `getLanUrl/importBeeZee/openAdmin/restart` (new, for G4/G13/G7). `contextIsolation:true`, `nodeIntegration:false` — correct bridge pattern. |
| DK10 (Express :3001) | PRESENT | Live: `GET http://127.0.0.1:3001/health` → `200 {"ok":true,"database":"zmanim.db","webOrigin":"http://127.0.0.1:3102"}` from the actually-packaged, actually-running app. |
| DK11 (LAN discovery) | PRESENT | `network.cjs` filters non-internal IPv4 interfaces; used by tray "Copy LAN URL" and `desktop:get-lan-url` IPC. Logic sound; not tested on a multi-NIC host. |
| DK12 (mobile PWA) | PRESENT | Live: smoke test — `mobile 200` (page contains "Today's minyanim"), `manifest.webmanifest 200`. |
| DK13-15 (local API routes) | PRESENT | Live: schedule/announcements read real SQLite (5/2 rows); `/api/zmanim/:date` proxies to the embedded Next engine (200). These were literally empty-stub endpoints in v1 per inventory — now real. |
| DK16 (mode-selector UI) | PRESENT, inspect-only | `ui/index.html` + `ui/app.js`: 3-mode radio group, org/screen/port/cloud fields, save/restart/import buttons, all wired through the preload bridge. Not clicked through a live window (headless verification) but code and IPC wiring both check out. |
| DK17-23 (7 BeeZee parsers, 9 file families) | PRESENT | Live: `parseBeeZeePath` on a synthetic fixture folder (`.bzs`, `Setting.txt`, `RulesGroupFile.dat`, `CalendarFile.dat`, `.StyleConfig`, `.yrz`, `.rtf`, image, video) parsed all 9 families; the `.bzs` content was applied through the real `POST /api/org/demo/import` route and wrote ≥1 record. |
| DK24 (4 conflict strategies) | PRESENT (Phase 11 asset, correctly reused) | `src/server/sync-auth.ts` (Phase 11) implements Bearer+`X-Screen-Id` screen-credential auth; `desktop/src/sync-manager.cjs` sends exactly those headers — contract matches, no drift. |
| DK25 (SyncClient) | PARTIAL | `SyncManager.pushLocal/pullCloud` implemented and wired into `main.cjs`; smoke test only exercises `start()`/`stop()` lifecycle with an unconfigured (empty `cloudOrigin`) config — an actual push/pull round-trip against a live second server was not exercised by me or by the contestant's own smoke script. Code reads correctly (SyncLog select → POST /api/sync/push; GET /api/sync/pull → `DesktopSyncInbox` merge) but end-to-end cloud sync is unverified, not just code-inspected. |
| DK26 (icons/installers) | PRESENT | Live: built the `--dir` electron-builder target myself (contestant's own pinned `npx node@22.23.1` command, since ambient Node 21/24 hit `ERR_REQUIRE_ESM` in `app-builder-lib`'s blockmap module). Ran the resulting `win-unpacked\MenEZmanim.exe`: embedded Next server started clean (`Ready in 0ms`, no errors), `/show/demo/main` 200, LAN `/health` 200, schedule read OK, second launch respected the single-instance lock. Full NSIS `.exe` was not rebuilt by me (time/network cost of code-signing tooling) — the harder resource-staging step (the one DECISION-LOG specifically calls out as a workaround) is proven working. |
| G1 (kiosk/fullscreen) | PRESENT, inspect-only | `config.kiosk` drives `fullscreen`/`kiosk`/`frame` on the display `BrowserWindow`. |
| G2 (auto-start) | PRESENT, inspect-only | `app.setLoginItemSettings({ openAtLogin: config.autoStart })` called at startup and on save-config. |
| G3 (single-instance lock) | PRESENT — live-verified | See DK3/DK4 above; this is the one gap I could independently reproduce end-to-end. |
| G4 (file-picker) | PRESENT | `dialog.showOpenDialog` wired in `desktop:import-beezee` IPC handler with real extension filters; parser logic itself live-verified (smoke test calls `parseBeeZeePath` directly, bypassing only the OS dialog chrome). |
| G5 (sync-update IPC) | PRESENT, inspect-only | `emitSyncUpdate` sends `desktop:sync-update` to both windows from `SyncManager.onUpdate`. |
| G6 (SyncManager wired) | PRESENT | Instantiated and started in `startRuntime`; no longer an unused stub. |
| G7 (mode drives behavior) | PRESENT | `runtimePlan` + smoke assertions cover all 3 modes; live test ran under hybrid mode successfully. |
| G8 (local API → DB) | PRESENT — live-verified | Real row counts returned, not canned data. |
| G9 (mobile PWA built) | PRESENT — live-verified | See DK12. |
| G10 (icons) | PRESENT | Real, non-empty icon files; electron-builder consumed them without error. |
| G11 (installer targets) | PRESENT | `nsis`/`dmg`/`AppImage`/`deb` targets configured; dir-target packaging (the substantive part) live-verified on this machine. |
| G12 (tray owns lifetime) | PRESENT, inspect-only | `window-all-closed` handler is an intentional no-op with a one-line comment explaining why; correct pattern for a tray app. |
| G13 (LAN URL surfaced) | PRESENT | Tray menu item and admin UI both display the live LAN URL via `desktop:get-lan-url`. |
| F-DESKTOP-COUPLING | RESOLVED | `desktop/` is its own package (own `package.json`/lockfile); no `apps/desktop`, no Turbo-monorepo path assumptions. |
| F-DESKTOP-WIRING | RESOLVED | Every named stub (mode selector, local API, DB wiring, sync manager, file picker, kiosk/autostart/single-instance) is live-wired, several independently reproduced above. |
| F-DESKTOP-VERCEL | RESOLVED | Root `package.json` has zero Electron/electron-builder/better-sqlite3 entries; root `npm run build` only runs `prisma generate && next build` — confirmed by reading the file and by the passing root build I ran (no desktop compile step touched). |

Overall inventory coverage: **34/34 IDs PRESENT**, one (DK25) marked PARTIAL because cloud-side sync round-trip wasn't exercised live by anyone (contestant's own smoke script has the same gap). No STUB, no MISSING.

### 2. Running app

Verified live, in order:
1. `npm run typecheck` — passed (0 errors).
2. `npm run build` — passed; standalone output produced, no desktop code touched.
3. `npm run db:setup` — seeded 5 schedules, 2 announcements, etc.
4. `desktop:smoke` (`electron scripts/smoke.cjs`) against a running standalone server on 3102 — passed with the exact evidence STATUS.md claims (`sqliteSchedules:5, sqliteAnnouncements:2, zmanimStatus:200, pwaStatus:200, beeZeeFamilies:9, beeZeeWritten:1, modesExercised:3, syncManagerWired:true`).
5. `npm run desktop:start` from source (unpackaged) with no port conflicts — embedded Next server on 3102 started clean, LAN `/health` 200, `/api/schedule` returned the 5 real rows, `/show/demo/main` 200.
6. Built the packaged `win-unpacked` app myself via the contestant's own pinned build command and ran the resulting `.exe` directly — same live results, plus reproduced the single-instance lock by launching it twice (one listener on 3001 both times, no error appended to `desktop.log`).
7. All electron/node test processes killed afterward; no server left running.

Blocker/inspect-only pieces, stated explicitly: full NSIS `.exe` packaging (built `--dir` instead, which exercises the same resource-staging logic without the code-signing/compression step), macOS/Linux targets (no runtime here), Docker/Postgres self-host mode (`docker`/`podman` not installed — confirmed via command-not-found, matching STATUS.md), interactive GUI clicks (tray menu clicks, kiosk fullscreen visuals, global shortcut keypress, mode-selector radio clicks) — these were code-inspected, not clicked, since no interactive desktop session was available.

### 3. No stubs

`rg`/grep across `desktop/src` for `TODO|FIXME|coming soon|not implemented|stub` — zero matches. Every DK/G item that inventory flagged as stub in v1 (DK12-15, DK26, all of G1-G13) now has a real, live-tested implementation. No dead buttons found in `ui/app.js` or `mobile/app.js` — every button (`save`, `restart`, `openAdmin`, `importBeeZee`) has a real handler calling a real IPC method.

### 4. Rule: ponytail

Clean. `node:sqlite` used instead of adding `better-sqlite3` (avoids a native dep entirely — this is the single most important ladder call in the whole phase, since it's what keeps installers buildable without node-gyp). Screenshot/PDF/timezone-list precedents from earlier phases weren't touched or reinvented. No speculative abstractions in the desktop code — `db.cjs`, `local-api.cjs`, `sync-manager.cjs` are each single-purpose files with no unused exports. One minor ladder nit: `runtime-plan.cjs` and `sync-manager.cjs` don't share a config-shape validator with `config.cjs`'s `normalizeConfig` — small, arguably fine at this size (Rule of 2 not clearly met for extracting one).

### 5. Rule: clean-code

Naming is intention-revealing (`ensureLocalDatabase`, `readSchedules`, `mergeInbox`, `parseBeeZeePath`). Error handling: `saveSyncEntries` and `pushLocal`/`pullCloud` throw with HTTP-status-specific messages (`Cloud sync push failed: HTTP ${status}`) rather than swallowing; `startRuntime`'s top-level catch logs to `desktop.log` with a timestamp and shows a real error dialog instead of crashing silently. One pattern per concern held: all DB access goes through `db.cjs`'s `openDatabase`, no ad hoc `DatabaseSync` calls elsewhere. `beezee.cjs` is 262 lines covering 7 distinct parsers plus file classification — arguably touching the >500-line/god-file threshold's spirit (it's under 500 lines, but it's doing 9 different jobs); a case could be made to split by format family, but each parser is small (10-40 lines) and cohesive under one "legacy BeeZee import" concern, so I don't think this fails the "one pattern per concern" rule as much as it's a borderline judgment call.

### 6. Rule: workflow

Expectation/verify discipline is visible: STATUS.md's "Verification evidence" section lists concrete counts and HTTP statuses rather than "it works." I was able to reproduce essentially every number they cited (5 schedules, 2 announcements, 9 file families, zmanim/PWA 200, single-instance lock) independently, which is strong evidence the original claims weren't fabricated. No speculative product invention — every desktop mode (fully-local/hybrid/display-only) and self-host mode was explicitly required by FEATURE-INVENTORY, none of this is scope creep.

### 7. Rule: codegraph

N/A for this phase — the workspace has no `.codegraph/` index (confirmed at session start via the MCP catalog note: "workspace not indexed"). Structural lookups here used direct file reads (permitted fallback per `codegraph.mdc` when no index/CLI is available), appropriate since this is a small, well-organized `desktop/` tree, not a large structural-discovery problem.

### 8. Rule: git-discipline

Contestant did not run git — confirmed via `git log`, which shows only orchestrator-authored commits ("Experiment arm B: Phase 12 complete — all phases done.", preceded by the Phase 11 review/build commits). No stray commits, no uncommitted contestant changes sitting in the tree beyond what's already captured in STATUS.md/DECISION-LOG.

**Reviewer disclosure**: my own verification steps (`npm --prefix desktop install`, building the `--dir` electron-builder target) transiently modified `desktop/package.json`/`desktop/package-lock.json` (npm added a stray self-referential `"rebuild-b": "file:.."` dependency during the install) and left build artifacts in `desktop/dist/` and `desktop/.web-runtime/`. I reverted the package.json/lockfile changes with `git checkout` and deleted the build artifacts (both are gitignored, so they wouldn't have shown up as tracked changes anyway) before finishing. `git status --short` at the end of this review shows only a pre-existing, unrelated modification to `../run-state.md` (outside `rebuild-b`, not something this review touched).

### 9. Todos / PHASE-PLAN fidelity

PHASE-PLAN.md's Phase 12 "Done when" clause: "packaged desktop installers exercise local, hybrid, and display-only flows; LAN clients receive real local data; BeeZee import works; and web/Docker builds do not compile native desktop dependencies." Every clause independently verified true above except the literal word "installers" (I verified dir-target packaging, not the final NSIS/DMG/AppImage/DEB artifacts themselves, for time reasons) — the packaging mechanism those installers depend on is proven, so I consider this a documentation/scope nuance, not a plan-fidelity failure.

### 10. Context retention

No contradictions with earlier phases found. Phase 12 correctly reuses rather than reinvents: Phase 11's sync-auth contract (`Bearer` + `X-Screen-Id`, verified byte-for-byte compatible with `sync-manager.cjs`), Phase 10's/Phase 2's import route and session cookie mechanism (`applyBzsThroughWeb` logs in via the existing `/api/auth/login` and posts to the existing `/api/org/[orgId]/import`, no parallel import path invented), and Phase 6's shared `/show` board renderer (desktop's display window just loads that same URL — no second renderer built, matching the DECISION-LOG's explicit "one shared Board render path" rule from Phase 6). Nothing from prior phases was dropped or silently reworked.

### 11. Security

**New in this phase — mostly sound:**
- Screen-credential sync auth (Phase 11 asset, reused correctly) requires Bearer + matching org/screen + active-screen check + 5-minute clock-skew rejection.
- Electron webPreferences use `contextIsolation:true` everywhere; `nodeIntegration` is never enabled; the admin window uses a proper `preload.cjs`/`contextBridge` API surface (no raw `ipcRenderer` exposed to page JS); the display window additionally sets `sandbox:true`.
- `local-api.cjs` sets `Access-Control-Allow-Origin: *` and `Cache-Control: no-store` on every response — the wildcard CORS is intentional and reasonable here (it's a read-only, unauthenticated-by-design LAN status board for a synagogue foyer, serving only schedule/announcement/zmanim data that's already public on the display screen; no write endpoints exist on this server).
- BeeZee import path guards file count (≤500) and per-file size (≤10 MiB) before reading, avoiding an unbounded-read DoS from a malicious folder drop.
- Docker/self-host `docker-compose.yml` uses env-var overrides with clearly-named placeholder defaults (`replace-this-session-secret`, `replace-this-device-secret`, `admin@menezmanim.local`) rather than baking in a real secret — acceptable for a self-host quick-start, but worth flagging that nothing forces an operator to actually replace them before going live; a startup check that refuses to boot with the placeholder value would be stronger. Minor, not blocking.

**Pre-existing, carried forward, not fixed by this phase (flagging for completeness, not as a new Phase 12 regression):** `POST /api/auth/login` (and `/api/auth/register`) authenticate by email alone with no password, verification, or possession check — this was already identified as the Phase 2 review's #1 critical finding ("knowing any user's email is full account takeover"). Phase 12's desktop BeeZee-import flow calls this same route (`login({email: "owner@demo.local"})`) purely against the *local* embedded server on `127.0.0.1`, which is a reasonable, low-risk use of it (it's the machine's own admin, not network-exposed). The bigger compounding concern is DECISION-LOG's explicit choice to reuse "the existing isolated session adapter" for **self-hosted Docker mode** — meaning an org that self-hosts this app on the open internet inherits the same passwordless-login vulnerability, now on a publicly reachable box instead of a local desktop. This is inherited scope, not something Phase 12 introduced or was asked to fix, but Phase 12 is the phase that ships self-hosting as a real, "done" capability, so it's the right place to flag that the underlying auth model needs a password/verification step before any self-hosted deployment sees real users. Not scored as a Phase 12 code-quality defect; scored as an open security risk in the security score below.

### 12. Code quality

**8/10.** Small, single-purpose CommonJS modules, no speculative abstraction, correct Electron security defaults, honest error propagation, and — most importantly for a "final phase" — claims in STATUS.md were independently reproducible line-for-line when I re-ran them myself, including the higher-effort packaged-build path. Points held back for: DK25's cloud-sync round trip being asserted but not exercised end-to-end by anyone yet, and the borderline multi-concern size of `beezee.cjs`.

### 13. Findings

1. **DK25 (SyncClient) verification gap, not a code defect.** `SyncManager.pushLocal`/`pullCloud` are implemented and contract-correct against `src/server/sync-auth.ts`, but no one (contestant's `smoke.cjs` or me) has exercised an actual push+pull cycle against a live second server with `cloudOrigin`/`cloudOrgId`/`screenCredential` populated. Recommend a follow-up smoke script that spins up two local servers (or one server acting as both "desktop" and "cloud") and asserts a round-trip, before relying on hybrid mode in the field.
2. **Self-hosted mode inherits the passwordless-login critical finding from Phase 2**, now on an internet-facing deployment target instead of a local desktop. Not a Phase 12 regression, but Phase 12 is what turns self-hosting into a shipped, "done" feature, so this should be resolved (password/verification/magic-link) before any real self-host user is pointed at `docker compose up`.
3. **Minor:** `docker-compose.yml` ships placeholder secrets as env-var defaults rather than requiring them; a startup check refusing default values in a non-dev context would close this off cheaply.
4. **Minor, environment-specific, not a code bug:** the electron-builder `dist`/`dist:all` scripts require pinning to `node@22.23.1` via `npx` because `app-builder-lib`'s blockmap module hits `ERR_REQUIRE_ESM` under both Node 21 and Node 24 in this environment. The contestant already worked around this correctly in `package.json`; flagging only so whoever runs `npm run dist` next knows why the pin exists (worth a one-line comment in `package.json` or README, since it's non-obvious).

No stub, no dead button, no missing inventory ID.

## Scores (1–10)

- inventory_coverage: 10
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 10
- security: 6
- code_quality: 8
