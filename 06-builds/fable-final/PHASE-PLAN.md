# PHASE-PLAN — Rebuild arm A

## Proof-of-read

**CONTESTANT-PROMPT.md** — Build only inside `_experiment/rebuild-a`; web port 3101, DB port 8101; no git (orchestrator commits). Five tasks: read, PHASE-PLAN covering every inventory ID (each ID in exactly one phase), STATUS + DECISION-LOG, build Phase 1 only with seeded data + running-app evidence, stop. Done per phase = no stubs, app runs seeded, checklist walked with evidence, typecheck/build green. Only the six always-on rules apply — no rebuild/review/subagent protocols.

**FEATURE-INVENTORY.md** — 10 routes (R1–R10, R10 = Electron desktop), 10 admin sections (P3–P12) + onboarding (P4o.1–.6) + super-admin (SA.1–.9) + mobile (M.1–.6) + display (SH.1–.10), 17 data models (D1–D17), 12 core capabilities (C1–C12, calculations preserved EXACTLY, 32 zman types / 10 authorities / 35 default groups), 17 widgets (W1–W17, end-to-end wired or FAIL), 22 API groups (E1–E22), 26 desktop features (DK1–DK26) + 13 gaps (G1–G13), 36 fix items (F*). Merge rule: take the more complete of v1/v2; open product calls: F-FIDS, desktop scope/auth.

**EDITOR-INVENTORY.md** — 11 editor surfaces (S0–S10), 63 feature IDs (E0.1–E0.9 shell, E1.1–E1.10 canvas, E2.1–E2.4 object panel, E3.1–E3.9 property panel, EW.1–EW.11 per-widget editors, E4.1–.3 toolbars, E5.1–.4 pickers, E6.1–.3 styles/screens, E7.1–.2 preview, E8.1–.2 live render, E9.1–.2 UI memory, E10.1–.4 data model), 10 structural fixes (TF1–TF10). #1 item: edit surface renders real widgets via the same path as the live board (E8.1/E8.2). Old editor ≈4,660 lines / 16 components; the too-simple rebuild hit ~20%.

**.cursor/rules/ (6 files)** — workflow (spec gate, gate discipline, expectation files, PowerShell script-file rule, verify in running app), vocabulary (exact command scoping), ponytail (ladder/YAGNI, anti-slop, never auto-drop inventory items), clean-code (rule of 2, naming, one pattern per concern, pinned deps), git-discipline (N/A — no git this run), codegraph (no index in this empty workspace; init is skipped — reference trees are read-only, logged in DECISION-LOG).

## Stack (Phase 1 decision, details in DECISION-LOG)

Next.js App Router + TypeScript; Drizzle ORM on libSQL (local `file:` DB — no Docker, port 8101 unused unless sqld is needed later); kosher-zmanim + Luxon for the engine. Core engine and schema harvested from the parent rebuild's tested port (read-only reference) — the inventory says calculations must not change and names that port a keep.

## Phases — every inventory ID maps to exactly one phase

### Phase 1 — Foundation: schema, core engine, public compute APIs (THIS BUILD)
- **D1–D17** — full 17-table schema, single source of truth (+ **F-DB-DRIFT**).
- **C1–C12** — the whole core engine (zmanim, 32 zman types, 10 authorities, refraction, Maaseh Nisim, Tukachinsky tables/profile/notes-content, calendar+tefilah rules, scheduler, style engine, 35 default groups, supporting utils, sync protocol code). Fixes riding along in the harvested port: **F-DUP-DATEMATH** (shared calendar-utils), **F-CORE-TZ** (Luxon org-timezone resolution), **F-CORE1** (single Tukachinsky degree source), **F-CORE2** (5783 fallback), **F-C2-TUK** (32 types incl. Tuk candle/havdalah).
- **E3** `/api/zmanim`, **E4** `/api/calendar` (public, org-aware, engine-computed — **F-API3**).
- Seed script: demo org with location, groups, minyanim, content — evidence base for every later phase.
- Verify: app runs on 3101; both APIs return computed values for the seeded org; core test suite + typecheck green.

### Phase 2 — Public display board
**R8**, **R9**, **SH.1–SH.10**, **W1–W17** (each widget editor-shape + renderer; **F-FIDS** decision surfaced to user), **F-NAV2** (one shared render path), **F-CORE3** (one-time assignedStyleId migration), internal display-snapshot endpoint.

### Phase 3 — Auth, landing, onboarding
**R1** (P1.1–P1.4), **R2**, **R3** (P2.1–P2.3), **R4** (P4o.1–P4o.6), **E1** (+**F-ME-SHAPE**), **E2**, **E6**, **E7**.

### Phase 4 — Admin shell + dashboard
**R5** (+**F1** real routes, **F2** client org switch), **P3** (P3.1–P3.7, **F-NAV1**), **P12** admin theme picker.

### Phase 5 — Schedules admin
**P4** (P4.1–P4.8), **E8**, **E15**, **F3** (dead files never recreated), **F4** (one canonical rule editor).

### Phase 6 — Content hub
**P5** (P5.1–P5.6), **E9–E12**, **E22**, **F5** (relationship field UI), **F-DB3** (OP6 hybrid notes).

### Phase 7 — Visual editor (the centerpiece)
**P6** (P6.1–P6.16), **E14**, **E18** (edit lock, D6 flow); full editor inventory: **S0–S10**, **E0.1–E0.9**, **E1.1–E1.10**, **E2.1–E2.4**, **E3.1–E3.9**, **EW.1–EW.11**, **E4.1–E4.3**, **E5.1–E5.4**, **E6.1–E6.3**, **E7.1–E7.2**, **E8.1–E8.2**, **E9.1–E9.2**, **E10.1–E10.4**, **TF1–TF10**.

### Phase 8 — Screens, members, settings
**P7** (P7.1–P7.9, **F6**), **E13**; **P8** (P8.1–P8.5), **E16**, **E17**; **P9** (P9.1–P9.7, **F7**, **F8**).

### Phase 9 — Mobile + super-admin
**R7** (M.1–M.6), **R6** (SA.1–SA.9), **E20**, **E21**, **F11**, **F12**, **F-API5** (org+admin API audit).

### Phase 10 — Import/export
**P10** (P10.1–P10.6), **E19**, **F9** (real BZS parse path), **F10** (PDF from v1 HTML generator), **F-DUP-CSV**, **F-SCREENSHOT**.

### Phase 11 — i18n + tutorial
**P11**, **F-I18N1**, **F-I18N2**, **F-I18N3**.

### Phase 12 — Desktop + sync
**R10**, **DK1–DK26**, **G1–G13**, **E5** (+**F-API4**), **F-CORE4** (durable sync store, D17 flow), **F-DESKTOP-COUPLING**, **F-DESKTOP-WIRING**, **F-DESKTOP-VERCEL**. Desktop scope/auth reconciliation surfaced to user before build.

## Coverage check

R1–R10 → phases 3,3,3,3,4,9,9,2,2,12 · P1/P2/P4o → 3 · P3 → 4 · P4 → 5 · P5 → 6 · P6 → 7 · P7/P8/P9 → 8 · P10 → 10 · P11 → 11 · P12 → 4 · SA → 9 · M → 9 · SH → 2 · W1–W17 → 2 · D1–D17 → 1 · C1–C12 → 1 · E1–E22 → 3,3,1,1,12,3,3,5,6,6,6,6,8,7,5,8,8,7,10,9,9,6 · DK/G → 12 · editor S/E/EW/TF → 7 · F items → as listed above (each named in exactly one phase).
