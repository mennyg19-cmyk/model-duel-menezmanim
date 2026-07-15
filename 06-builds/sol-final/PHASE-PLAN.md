# Proof of read

## `CONTESTANT-PROMPT.md`
- Work is confined to `D:\Projects\Others\MenEZmanim\_experiment\rebuild-b`; the other arm, parent app, and results folder are read-only.
- Arm B uses web port 3102 and reserves local database port 8102. Git belongs to the orchestrator.
- Each phase must run with seeded data, be checked in the running app, be recorded in `STATUS.md`, and stop before the next phase.

## `FEATURE-INVENTORY.md`
- The source of truth has 10 routes, 17 data models, 12 core capabilities, 17 widgets, 22 API groups, 26 desktop features, and 13 desktop gaps.
- Expanding inclusive ranges and counting section aliases gives 269 labeled inventory IDs; behavior comes from v1, v2, and the prior rebuild without copying their layouts.
- Calculations must retain their exact outcomes, org/admin writes need server-side authorization, and editor preview, public display, and desktop must share one board renderer.

## `EDITOR-INVENTORY.md`
- The old editor had about 4,660 lines across 16 components; the newer 900-line editor kept about 20% and lost live editing plus the Wix-style interaction layer.
- Its ledger has 63 `E0`/`E`/`EW` feature IDs and 10 `TF` fixes; with 11 numbered surfaces plus `S3W`, this plan tracks 85 editor labels.
- The target is a full-screen editor with a live shared renderer, floating panels, fit/fill/custom zoom, deep appearance controls, and purpose-built widget editors.

## `.cursor/rules/workflow.mdc`
- Read before editing, make the smallest complete change, keep the README current, and record business judgments rather than hiding them.
- A phase needs observable expectations before work and running-app evidence afterward; a successful response alone is not verification.
- PowerShell commands containing variables belong in a script file, command output stays concise, and a server started for testing must be stopped.

## `.cursor/rules/vocabulary.mdc`
- “Rebuild” preserves every feature while replacing the structure; it is not a pixel copy or a narrow tidy.
- Command words have fixed scopes, and load-on-demand protocols apply only when their named activity is available and requested.
- The contestant prompt narrows this run to the six local always-on rules, so no absent rebuild or review protocol is invented.

## `.cursor/rules/git-discipline.mdc`
- Work normally belongs on a task branch with one logical change per commit and fast checks before each commit.
- PowerShell commit messages use repeated `-m` flags, never a Bash heredoc.
- This experiment overrides normal commit behavior: no git command is run because the orchestrator owns commits and pushes.

## `.cursor/rules/codegraph.mdc`
- Structural lookup starts with CodeGraph status; a healthy index replaces symbol grep and directory discovery.
- CodeGraph handles symbols, callers, imports, and impact, while direct reads remain valid for known files, markdown, and literals.
- The empty arm was initialized once; read-only reference apps are not modified merely to add indexes.

## `.cursor/rules/ponytail.mdc`
- Use the first simple approach that works: platform features and installed dependencies before adding code or packages.
- Do not add speculative abstractions or drop awkward rebuild features without approval; explicit scope, security, and tests are never cut.
- Communication and project prose stay direct, short, and free of stock AI phrasing.

## `.cursor/rules/clean-code.mdc`
- New abstractions need two real uses; files split by concern, not to meet an arbitrary line count.
- Names state intent, errors explain the failed and expected states, and comments cover only non-obvious constraints.
- The project keeps one pattern per concern and verifies third-party APIs rather than relying on memory.

# Coverage convention

Ranges below are inclusive. A parent label such as `P4` and each child such as `P4.1` are separate labels. `P4area` is retained as the onboarding heading alias, and `S3W` is retained as the editor widget-editor subsection. This produces 269 feature labels plus 85 editor labels, and every label appears in exactly one phase.

# Build phases

## Phase 1 — Bilingual marketing entry

**IDs:** `R1`; `P1`, `P1.1–P1.4`; `F-I18N1`.

Build the responsive landing page, header navigation, feature explanation, and working login/register calls to action. English and Hebrew are first-class seeded locale records, with a visible locale switch and correct page direction.

**Done when:** `/` opens on port 3102, the locale switch changes all applicable copy and direction, feature cards render from seed content, and the login/register links target the Phase 2 paths.

## Phase 2 — Identity, tenancy, and onboarding

**IDs:** `R2–R4`; `P2`, `P2.1–P2.3`; `P4area`, `P4o`, `P4o.1–P4o.6`; `D1`, `D3–D5`; `E1`, `E2`, `E6`, `E7`; `F-ME-SHAPE`, `F-DB-DRIFT`.

Add the canonical schema foundation, Clerk login/register/OAuth callback, flat `/api/me` contract, invitations, pending approval, and the full organization onboarding flow with default seed records.

**Done when:** a new user can sign up, create or join an organization, see pending approval where required, and reach the authenticated area with server-derived membership.

## Phase 3 — Zmanim, calendar, and mobile

**IDs:** `R7`; `M.1–M.6`; `D9–D11`; `C1–C7`, `C10`, `C11`; `E3`, `E4`; `F-CORE-TZ`, `F-CORE1`, `F-CORE2`, `F-C2-TUK`, `F-API3`, `F-DUP-DATEMATH`, `F-I18N2`.

Port the exact calculation and calendar behavior, 32 zman types, 10 authorities, 35 default groups, shared date math, org-timezone handling, and the complete congregant mobile view.

**Done when:** seeded Jerusalem data produces checked zmanim/calendar output and `/mobile?org=demo` supports grouping, NOW/NEXT states, announcements, and date navigation.

## Phase 4 — Schedules and groups

**IDs:** `P4`, `P4.1–P4.8`; `E8`, `E15`; `F3`.

Build schedule and group CRUD, computed and fixed times, all advanced detail fields, tri-state visibility, reorder, duplicate, bulk actions, placeholders, and the compact group-aware workspace.

**Done when:** an admin can create, compute, group, reorder, duplicate, bulk-move, and delete seeded schedules with persisted results.

## Phase 5 — Content hub and daily notes

**IDs:** `P5`, `P5.1–P5.6`; `D12–D16`; `E9–E12`, `E22`; `F5`, `F-DB3`.

Build announcements, memorials including relationship, sponsors, media ordering/upload, visibility controls, and the global-plus-org Tukachinsky note merge.

**Done when:** every content type can be managed from seeded records and the merged notes response proves add, override, and hide behavior.

## Phase 6 — Public board and widget registry

**IDs:** `R8`, `R9`; `SH.1–SH.10`; `W1–W17`; `D2`, `D7`, `D8`; `C8`, `C9`; `E13`, `E14`; `F-NAV2`, `F-CORE3`, `F-FIDS`.

Build the shared board renderer, breakpoint-aware style resolution, scheduling, all 17 widget families, date override, prefetch, heartbeat, scaling, kiosk cache, and the demo redirect. Finish W16 rather than preserving its placeholder.

**Done when:** `/show/demo/main` renders every seeded widget through the production renderer, W16 is functional, W17 changes board data, and responsive/mobile behavior is observable.

## Phase 7 — Full visual editor

**Feature IDs:** `P6`, `P6.1–P6.16`; `D6`; `E18`; `F4`.

**Editor surfaces:** `S0–S10`, including `S3W`.

**Editor feature IDs:** `E0.1–E0.9`; `E1.1–E1.10`; `E2.1–E2.4`; `E3.1–E3.9`; `EW.1–EW.11`; `E4.1–E4.3`; `E5.1–E5.4`; `E6.1–E6.3`; `E7.1–E7.2`; `E8.1–E8.2`; `E9.1–E9.2`; `E10.1–E10.4`; `TF1–TF10`.

Build the full-screen live WYSIWYG editor on the Phase 6 renderer: canvas interactions, floating panels, tools, style management, pickers, rule editors, locks, undo/redo, clipboard, themes, preview date, and all purpose-built widget editors.

**Done when:** a seeded board can be edited live and saved through every editor surface, then matches preview and `/show` without a second render path.

## Phase 8 — Admin shell, dashboard, screens, and styles

**IDs:** `R5`; `P3`, `P3.1–P3.7`; `P7`, `P7.1–P7.9`; `F1`, `F2`, `F6`, `F-NAV1`.

Build real admin routes, client-side org switching, dashboard statistics and quick-add flows, embedded preview, screen/style management, custom resolutions, breakpoint schedules, thumbnails, URLs, heartbeat, and mismatch warnings.

**Done when:** each admin section deep-links correctly and dashboard/screen actions open the correct seeded public display rather than `/display`.

## Phase 9 — Members, settings, tutorial, and admin themes

**IDs:** `P8`, `P8.1–P8.5`; `P9`, `P9.1–P9.7`; `P11`, `P12`; `E16`, `E17`; `F7`, `F8`, `F-I18N3`.

Build owner/admin member controls, invitations, coherent settings persistence, real timezone selection, display names, kiosk preferences, guided tutorial chapters, and persisted admin themes using the shared design system.

**Done when:** role guards hold, settings do not clobber one another, every tutorial target is reachable, and theme/locale changes survive reload.

## Phase 10 — Import/export and super-admin

**IDs:** `R6`; `P10`, `P10.1–P10.6`; `SA.1–SA.9`; `E19–E21`; `F9–F12`, `F-DUP-CSV`, `F-SCREENSHOT`, `F-API5`.

Build CSV/JSON/ICS/BZS imports, bilingual multi-week CSV/PDF and screenshot exports, one CSV implementation, and all guarded super-admin organization, cloning, reseed, user, plan, status, data, and baseline-note operations.

**Done when:** sample files round-trip with previews and errors, exports open correctly, and authorization tests prove org and super-admin boundaries.

## Phase 11 — Durable offline sync

**IDs:** `D17`; `C12`; `E5`; `F-CORE4`, `F-API4`.

Replace the in-memory sync store with durable logs, define the screen/device credential boundary, and implement pull/push plus all four conflict strategies.

**Done when:** a seeded offline change survives restart, syncs in both directions, and each conflict strategy has observable evidence.

## Phase 12 — Desktop, LAN, and self-hosting

**IDs:** `R10`; `DK1–DK26`; `G1–G13`; `F-DESKTOP-COUPLING`, `F-DESKTOP-WIRING`, `F-DESKTOP-VERCEL`.

Ship all three desktop modes, two-window UX, tray/shortcut/config/IPC, local SQLite and APIs, LAN mobile hosting, BeeZee parsers and file picker, sync wiring, kiosk/autostart/single-instance behavior, icons/installers, and an isolated Docker deployment.

**Done when:** packaged desktop installers exercise local, hybrid, and display-only flows; LAN clients receive real local data; BeeZee import works; and web/Docker builds do not compile native desktop dependencies.
