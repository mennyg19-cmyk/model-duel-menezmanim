Model: glm-5.2-high | Runner: spawn | Full final reaudit | Arm: rebuild-b

# Blind final review — rebuild-b only

Rate this arm against FEATURE-INVENTORY + EDITOR-INVENTORY. rebuild-a is out of scope and marked N/A. No model identity was guessed.

## Proof-of-read

- **REAUDIT-INSTRUCTIONS / SCORECARD / BLIND-REVIEW-RUBRIC:** Test 1 weights (inventory 12, rules 8, phase 6, quality 6, context 4, security 4 = 40). Deliverable is the rubric score table for one arm; static evidence preferred, running app optional.
- **FEATURE-INVENTORY:** 10 routes, 17 models, 12 core caps, 17 widgets, 22 API groups, 26 desktop features + 13 gaps, full F* to-fix list. v1 is the parity reference for editor/BZS/PDF.
- **EDITOR-INVENTORY:** Old editor ~4,660 lines/16 components; ledger of 63 E0/E/EW IDs + 10 TF + 11 surfaces (S0–S10, S3W) = 85 editor labels. Live render + Wix interaction layer were the two big losses to recover.
- **STATUS.md (p12):** Claims R10, DK1–DK26, G1–G13, F-DESKTOP-* complete; typecheck + standalone build green; desktop smoke (3 modes, 5 schedules, 2 announcements, zmanim 200, PWA 200, 9 BeeZee families, 1 BZS record); packaged win-unpacked `/show/demo/main` 200, LAN `/health` 200, `/api/schedule` 5, single-instance lock exercised; NSIS installer built (172 MB). Docker container startup NOT exercised (no Docker/Podman/nerdctl installed).
- **PHASE-PLAN.md:** 12 phases, each with IDs + observable done-when; Phase 12 maps the desktop set. Coverage convention (inclusive ranges, P4area, S3W) yields 269 feature + 85 editor labels, each in one phase.
- **DECISION-LOG.md:** ~30 entries Phase 2→12, each with decision/why/reversible. Consistent thread: flat `/api/me`, 32 zman types, one shared board path, isolated Electron package, node:sqlite LAN, durable sync inbox, HMAC screen credentials, self-host session adapter, finished FIDS, one CSV helper, HTML print-to-PDF, SVG screenshot.
- **Spot-check tree (admin/show/sync/desktop/import/auth):** Routes and API folders present and wired; `src/widgets` has all 17 families with real renderers; `src/admin/editor` split into shell/canvas/panels/geometry/interaction/state; `desktop/src` has main/local-api/beezee/sync-manager/db/runtime-plan; root `package.json` carries no Electron/electron-builder/better-sqlite3.

## Arm rebuild-b

### Inventory coverage summary — STRONG

Every claimed ID family is represented by real code, not placeholders.

- **Routes R1–R10 PRESENT:** `app/page.tsx`, `app/login/[[...login]]` + `sso-callback`, `app/register/[[...register]]` + `sso-callback`, `app/onboarding/page.tsx`, `app/admin/[orgSlug]/page.tsx` (+ `screens`, `members`, `settings`, `editor/[[...styleId]]`, `content/notes`, `import`), `app/admin/super/page.tsx`, `app/mobile/page.tsx`, `app/show/[orgSlug]/[screenId]/page.tsx`, desktop two-window app (`desktop/src/main.cjs`), Docker target (`docker/`).
- **Widgets W1–W17 PRESENT:** `src/widgets/registry.ts` registers all 17 with zod schemas + real renderers — `FidsBoard` is a working split-flap board with `statusFor` (UPCOMING/NOW/DEPARTED) and flip animation, not "Coming Soon" (F-FIDS resolved); `DatePicker` (W17) present; `SefiraCounter` (W15), `SponsorDisplay` (W11), `ShapeDivider` (W13), `TefilahNotes` (W14) all present.
- **API E1–E22 PRESENT:** `me`, `onboarding`, `zmanim`, `calendar`, `sync/pull|push`, `webhooks/clerk`, `invites/[token]` + `pending`, `org/[orgId]/{schedules,announcements,memorials,sponsors,media(+ordering),screens,styles,groups,members,invites,lock,settings,notes,import,export,editor/shared-data}`, `admin/{orgs(+data/plan/status),clone,reseed-demo,users,notes}`, `auth/{login,logout,register}`, `display/[orgSlug]/[screenId]` + `heartbeat`.
- **Desktop DK1–DK26 + G1–G13 PRESENT:** `main.cjs` — single-instance lock, tray (owns lifetime on Win/Linux), Ctrl+Shift+A global shortcut, kiosk/fullscreen + frame toggle, autostart via `setLoginItemSettings`, two windows (1920×1080 display, 1200×800 admin), 7-method IPC bridge, BeeZee file/folder picker; `local-api.cjs` — Express on 3001 with `/health`, `/api/schedule`, `/api/announcements`, `/api/zmanim/:date` (proxied to shared engine), `/mobile` PWA; `beezee.cjs` — 7 parsers (bzs/settings/rules/calendar/style/yrz/rtf) + background/media classification = 9 families, 500-file/10 MiB guards, `applyBzsThroughWeb`; `sync-manager.cjs` — hybrid push/pull with cursor, durable inbox; `db.cjs` — `node:sqlite`, `DesktopImport` + `DesktopSyncInbox` tables, inbox merge overlay; `runtime-plan.cjs` for fully-local/hybrid/display-only; `docker/` for self-host.
- **Fixes F\* PRESENT:** F-NAV2 (one render path — `/show` and editor both build `DisplaySnapshot` via `buildDisplaySnapshot`/`buildEditorSnapshot` into `<Board>`), F-FIDS (real renderer), F-ME-SHAPE (flat `/api/me`), F9 (real BZS parse, not filename-only), F-DESKTOP-VERCEL (desktop deps isolated; root lockfile clean), F-DESKTOP-COUPLING/WIRING (separate package, wired modes), F7 (section-merge settings PUT), F8 (`Intl.supportedValuesOf`), F-DUP-CSV (one `src/io/csv.ts`).
- **Editor S0–S10 + EW + TF PRESENT:** `shell/{EditorShell,EditorTopBar,EditorLeftPanel,EditorRightPanel}`, `canvas/{EditorCanvas,AddWidgetOverlay,AlignmentToolbar,SelectionLayer}`, `panels/{ObjectListPanel,PropertyPanel,PreviewPanel,StyleManagerPanel,SettingsPanel}`, `geometry/{align,snap,distribute,resize,rect}`, `interaction/{useEditorKeyboard,clipboard}`, `state/{editor-store,ui-store,StoreProvider}`, `ContentEditors`, `ZmanLimitEditor`, `themes`. Live WYSIWYG confirmed via `editor-snapshot.ts` feeding the same `DisplaySnapshot` shape as `/show`.

Minor PARTIAL: Docker/self-host target is built and linted but container startup was not exercised in-environment (tooling absent) — a verification gap, not a coverage gap.

### Rule adherence (six always-on)

Ponytail: decisions explicitly prefer platform/installed deps (node:sqlite over a native package, HTML print-to-PDF over a PDF lib, SVG screenshot over headless browser, tutorial without react-joyride), each reversibility noted. Clean-code: files split by concern, one render path, one CSV helper, zod schemas as single source. Workflow: STATUS carries running-app evidence (seeded smoke, packaged run, installer artifact) and a "stopped cleanly" note; phase gates respected. Codegraph: used for structural lookup. Git-discipline: overridden by experiment (orchestrator owns commits) — logged. Vocabulary: "rebuild" treated as preserve-every-feature. Anti-slop present in docs. Strong.

### Phase discipline / plan fidelity

12 phases, each with its own STATUS/PHASE-PLAN/DECISION-LOG and proof-of-read. Phase 12 STATUS enumerates claimed IDs and matches the PHASE-PLAN mapping; done-when criteria are observable and backed by evidence (HTTP 200s, row counts, artifact byte size, single-instance behavior). No phase claims work beyond its gate. Discipline is high.

### Code quality (1–10) — 8

Clean concern split, typed schemas, timing-safe HMAC, transactional inbox writes, error messages that state expected state. Headers ("What's in this file") are a touch verbose and several widget renderers use inline styles (consistent within the widget layer, not rogue). No god files spotted in the editor. Deductions for verbose doc-headers style and inline-style density in widgets.

### Context retention (1–10) — 9

DECISION-LOG runs Phase 2→12 without contradiction; Phase 11 sync contract is explicitly reused in Phase 12 (`SyncManager` consumes the cursor protocol, `SyncLog` as append-only journal); earlier decisions (flat `/api/me`, 32 zman types, one board path) are honored in later phases. No re-derived or re-argued choices.

### Security / stubs (1–10) — 9

`requireOrgMember` enforces session + membership + role (write/admin) and resolves org by id-or-slug server-side; super-admin bypass is explicit. `authorizeSyncRequest` accepts either a session or an HMAC Bearer screen credential bound to a canonical org id AND an active screen, with expiry and `timingSafeEqual`; disabling a screen revokes it. Import preview/commit is role-guarded. No stub claimed done (FIDS finished, BZS real). Root web build is isolated from native desktop deps. Minor: dev-secret fallbacks for session/sync are documented but present (acceptable for an experiment arm without real keys).

### Running-app notes

Static review only — snapshot has no `node_modules`, so the app was not run by this reviewer. Per REAUDIT-INSTRUCTIONS, running-app verification is optional for snapshots. The arm's own STATUS records a seeded, exercised running app on port 3102 plus a packaged desktop run; I am scoring on static evidence and treating that recorded evidence as unverified-by-me. Docker container startup was not exercised by the arm either (tooling absent).

### Subtotals

- inventory_coverage: **11/12**
- rule_adherence: **7/8**
- phase_discipline: **6/6**
- code_quality: **5/6**
- context_retention: **4/4**
- security_stubs: **4/4**
- **arm_total: 37/40**

## Explicit scores table

| Criterion | rebuild-a | rebuild-b | Max |
|---|---|---|---|
| inventory_coverage | N/A | 11 | 12 |
| rule_adherence | N/A | 7 | 8 |
| phase_discipline | N/A | 6 | 6 |
| code_quality | N/A | 5 | 6 |
| context_retention | N/A | 4 | 4 |
| security_stubs | N/A | 4 | 4 |
| **total** | **N/A** | **37** | **40** |
