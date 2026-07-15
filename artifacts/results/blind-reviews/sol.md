Model: gpt-5.6-sol-high | Runner: spawn | Blind final Test 1

### Proof-of-read

**Rubric and scorecard**
- Read `BLIND-REVIEW-RUBRIC.md` and `SCORECARD.md` in full.
- Test 1 is worth 40 points across inventory, six-rule adherence, phase discipline, code quality, context retention, and security/stubs.
- Running behavior and source evidence outrank arm-written status claims.

**Frozen inventories**
- Read `FEATURE-INVENTORY.md` in full: R1–R10, P/SA/M/SH surfaces, D1–D17, C1–C12, W1–W17, E1–E22, DK1–DK26, G1–G13, and all F fixes.
- Read `EDITOR-INVENTORY.md` in full: S0–S10, E0/E1–E10, EW.1–EW.11, and TF1–TF10.
- The decisive editor requirement is live editing through the same renderer as `/show`; a backend-only feature or labeled-box placeholder does not count as complete.

**rebuild-a documents**
- Read `STATUS.md`, `PHASE-PLAN.md`, and `DECISION-LOG.md` in full.
- The plan maps the complete ledger once across 12 phases and records reversible decisions for FIDS, auth, imports, sync, and desktop.
- STATUS marks every phase complete, including DK1–DK26 and G1–G13; source checks contradict some final claims.

**rebuild-b documents**
- Read `STATUS.md`, `PHASE-PLAN.md`, and `DECISION-LOG.md` in full.
- The plan explicitly counts and assigns the frozen feature/editor labels across 12 observable phases.
- STATUS records stronger packaged-desktop evidence, but its all-complete claim still coexists with inventory and security gaps.

**Code, runtime, and discipline evidence**
- Spot-checked admin/editor, `/show`, sync, desktop, import/export, and auth in both arms; refreshed rebuild-b's stale CodeGraph index before structural checks.
- Ran both apps: rebuild-a on 3101 and rebuild-b on 3102; checked public display, zmanim, auth gates, login, admin/import access where responsive, and anonymous sync rejection.
- Skimmed selected phase reviews for phases 2, 7, 10, 11, and 12 as discipline signals only; their prior scores were not reused. Both reviewer-started servers were stopped.

### Arm rebuild-a

**Inventory coverage summary: mixed**
- **PRESENT — C1–C12 / D1–D17 / E3–E4:** the schema and calculation/calendar foundation are substantial, seeded, and exercised by public APIs.
- **PRESENT — R8 / SH.1–SH.10 / W1–W17:** `/show` and editor use `BoardSurface`; FIDS is implemented rather than “coming soon.”
- **PRESENT — P3–P5:** dashboard, schedules, groups, content, media, and merged daily-note paths have real UI/API implementations.
- **PARTIAL — P6 / E18 / editor ledger:** live WYSIWYG and strong geometry exist, but save did not enforce lock ownership; rulers, smart resize guides, picker IDs, theme application, Hebrew preview, and several widget controls were incomplete.
- **PARTIAL — P10.1 / P10.3 / P10.5:** import/export works at the API level, but column mapping, visible sample preview, group-filter UI, and the paired file flow are incomplete.
- **MISSING/STUB — P10.4 / F-SCREENSHOT:** SVG export draws object rectangles and names, not the rendered current display.
- **PARTIAL — P11 / F-I18N3:** tutorial and locale infrastructure exist, but required cross-page targets and broad string/theme coverage do not.
- **MISSING/STUB — DK17–DK23:** desktop BeeZee is explicitly preview-only, handles one parser family, and does not write the local DB.
- **PARTIAL/BROKEN — DK2, DK24–DK26, F-CORE4:** Docker declares Postgres against a libSQL client, desktop bypasses the claimed SyncManager, packaging/icons were not proven, and deletes are absent from the pull feed.

**Rule adherence (six always-on)**
- Ponytail and clean-code are mixed: shared board/schedule-rule paths and focused editor modules are good; the second desktop sync loop and placeholder export/import paths are not smallest complete solutions.
- Workflow adherence is weak at gates. STATUS repeatedly marks full inventory complete despite source-labeled preview behavior, a broken Docker path, and incomplete editor/tutorial/import controls.
- Vocabulary/rebuild scope was understood in the phase map but not fully delivered. No attributable contestant git breach was found. CodeGraph was unavailable in this arm and direct inspection was the documented fallback.

**Phase discipline / plan fidelity**
- The 12-phase ledger is clear, complete, and ordered; decisions are recorded newest-first.
- Execution crossed phase gates after material items remained partial, including an editor review failure and final desktop features that source code itself labels unverified.
- Final STATUS is therefore useful as a work log but unreliable as a completion ledger.

**Code quality: 6/10**
- Strong shared rendering, transactional style persistence, typed guards, geometry tests, password hashing, and centralized CSV/domain helpers.
- Docked for mismatched picker contracts, advisory locking, stale contradictory comments, duplicate sync orchestration, broken Docker/database coupling, and placeholder screenshot/desktop import behavior.

**Context retention: 7/10**
- Earlier board contracts, FIDS decision, org guards, shared renderer, and canonical schedule-rule editor survive later phases.
- Desktop BeeZee parity and durable delete sync were dropped while still being reported complete, and the desktop bypassed the earlier SyncManager design.

**Security / stubs: 4/10**
- Password authentication, HMAC sessions, org/admin guards, hashed revocable device tokens, request validation, and anonymous sync rejection are solid.
- Stored rich text uses bypassable regex sanitization; public heartbeat is forgeable; screenshot and desktop BeeZee are user-visible stubs; Docker ships an unusable/default-secret path; sync cannot propagate deletes.

**Running-app notes**
- Verified `/` 200, `/show/demo` 200, public zmanim 200, anonymous admin 307, password login 200, authenticated dashboard/import pages 200, and anonymous sync pull 401.
- `/show/demo/main` and `/api/display/demo/main` returned 404 against the current seed, despite `main` being the documented canonical seeded screen.
- Server on 3101 was stopped after checks.

**Subtotals:** inventory_coverage **8/12**, rule_adherence **5/8**, phase_discipline **3/6**, code_quality **4/6**, context_retention **3/4**, security_stubs **2/4** → **arm_total 25/40**

### Arm rebuild-b

**Inventory coverage summary: strong**
- **PRESENT — C1–C12 / D1–D17 / E3–E5:** broad engine, schema, calendar, durable sync journal, bounded push/pull, and all four conflict strategies are implemented.
- **PRESENT — R8 / SH.1–SH.10 / W1–W17:** public display, date override, live refresh, widget registry, and editor share `BoardSurface`.
- **PRESENT — P6 / editor E0–E10:** full-screen live editor, selection geometry, panels, state memory, appearance data, style rules, and dedicated widget editors are materially complete.
- **PRESENT — R5–R7 / P3–P9 / SA.1–SA.9:** routed admin, screens, members, settings, mobile, and super-admin surfaces have real handlers and persistence.
- **PARTIAL — P2.3 / P4o.2:** OAuth remains a labeled callback placeholder, and onboarding accepts coordinates rather than doing address-to-location resolution.
- **PARTIAL — P9.7:** the settings UI exposes display-name overrides for only a subset of zman types, not every zman and tefilah item.
- **PARTIAL — P10.1 / P10.5:** column-mapping logic is server-only and the required paired Groups+Events flow is split into separate imports.
- **MISSING/STUB — P10.4 / F-SCREENSHOT:** the “screenshot” is an SVG of labeled rectangles, not the live board.
- **PRESENT/PARTIAL — R10 / DK1–DK26 / G1–G13:** desktop packaging, three modes, real SQLite/LAN APIs, PWA, nine BeeZee families, installer path, and wiring are strong; DK25 cloud sync remains unverified end to end.

**Rule adherence (six always-on)**
- Ponytail and clean-code are generally strong: platform SQLite, isolated desktop dependencies, one board renderer, one CSV helper, and focused modules.
- Workflow and security gates were not respected when the arm advanced after a live-confirmed account-takeover flaw; the current CSV parser also retains its known phantom trailing-column bug.
- The rebuild scope is much closer to the frozen ledger than rebuild-a. No attributable contestant git breach was found, and CodeGraph discipline was present once the index was refreshed.

**Phase discipline / plan fidelity**
- The phase plan is unusually explicit, maps the complete ledger, and records concrete per-phase runtime evidence.
- Most later-phase claims reproduce, especially editor, sync, and packaged desktop work.
- Discipline is still capped by advancing beyond the broken auth gate and by marking screenshot, import-wizard, and paired-CSV gaps complete.

**Code quality: 8/10**
- Strong module boundaries, shared contracts, Electron security defaults, durable sync validation, clear errors, and independently reproducible desktop behavior.
- Docked for passwordless identity, duplicate style-write guarantees, a known common-case CSV parser defect, subset-only settings controls, and a fake screenshot export.

**Context retention: 9/10**
- Later phases consistently reuse the shared renderer, session/org patterns, import route, sync credential contract, and schema fields.
- Desktop consumes prior web/import/sync paths instead of rebuilding them. The main contradiction is shipping self-host mode on top of the already-broken local auth boundary.

**Security / stubs: 3/10**
- Org/admin guards, sync allowlists and bounds, screen-scoped credentials, Electron isolation, and read-only LAN APIs are good.
- Login grants a session from email alone, while registration can take over an existing account; this is a critical primary-boundary failure and also affects self-host mode.
- The screenshot remains a user-visible stub, default secrets are permitted, and one unlocked style-write route bypasses edit-lock enforcement.

**Running-app notes**
- Verified `/` 200, `/show/demo/main` 200, public zmanim 200, anonymous admin 307, email-only login 200, and anonymous sync pull 401.
- An authenticated admin fetch did not finish before the reviewer timeout during the fresh dev-server run; prior phase evidence independently exercised the same route, so this is recorded as a runtime blocker rather than scored as a missing route.
- Server on 3102 and its remaining listener were stopped after checks.

**Subtotals:** inventory_coverage **10/12**, rule_adherence **6/8**, phase_discipline **4/6**, code_quality **5/6**, context_retention **4/4**, security_stubs **1/4** → **arm_total 30/40**

### Head-to-head

rebuild-b is stronger on inventory coverage. Its editor, admin breadth, sync protocol, and desktop/LAN/package work are more complete and more consistently connected end to end. rebuild-a has a sound shared board foundation and stronger password authentication, but its final desktop claims materially exceed the code: BeeZee is preview-only, Docker cannot use its configured database, and deletion sync is incomplete.

On craft, rebuild-b is the stronger implementation. On security, rebuild-a is stronger at the primary login boundary, while both retain serious issues. Overall Test 1 build-quality preference is rebuild-b, but its passwordless account-takeover path is a release blocker, not a minor deduction.

### Explicit scores table

| Criterion | rebuild-a | rebuild-b | Max |
|---|---:|---:|---:|
| inventory_coverage | 8 | 10 | 12 |
| rule_adherence | 5 | 6 | 8 |
| phase_discipline | 3 | 4 | 6 |
| code_quality | 4 | 5 | 6 |
| context_retention | 3 | 4 | 4 |
| security_stubs | 2 | 1 | 4 |
| **total** | **25** | **30** | **40** |
