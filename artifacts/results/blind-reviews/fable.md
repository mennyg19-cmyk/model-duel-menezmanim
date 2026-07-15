Model: claude-fable-5-thinking-high | Runner: spawn | Blind final Test 1

# Blind final review — Test 1 (build quality)

## Proof-of-read

**SCORECARD.md + BLIND-REVIEW-RUBRIC.md** — Test 1 is 40 pts: inventory_coverage/12, rule_adherence/8, phase_discipline/6, code_quality/6, context_retention/4, security_stubs/4. Blind reviews feed inventory + quality; phase-review history feeds discipline/context/security. Tie-break is fewer regressions. Rated both arms independently; no model guessing.

**FEATURE-INVENTORY.md** — 10 routes (R1–R10), admin sections P3–P12 + P4o/SA/M/SH, 17 models D1–D17, core C1–C12 (calculations exact, 32 zman types, 10 authorities, 35 groups), 17 widgets W1–W17 (stub = FAIL), 22 API groups E1–E22 with trust boundaries, desktop DK1–DK26 + G1–G13, and the F* fix list (F-NAV2 one render path, F9 real BZS parse, F-ME-SHAPE flat /api/me locked with a test, F-API4 sync auth, F-CORE4 durable sync).

**EDITOR-INVENTORY.md** — surfaces S0–S10, 63 E0/E/EW feature IDs, TF1–TF10. #1 requirement: the edit surface renders real widgets through the same path as the live board (E8.1/E8.2); then Wix interaction layer (8-way resize, snap guides, multi-select, align/distribute), tabbed property panel with memory, pickers, per-widget content editors, full-screen shell E0.1–E0.9.

**Arm docs** — rebuild-a: STATUS (all 12 phases complete; 183 tests, typecheck/build green, sync/device evidence on 3101), PHASE-PLAN (12 phases, explicit coverage map, each ID in exactly one phase), DECISION-LOG (~30 terse DECIDED entries, newest-first). rebuild-b: STATUS (all 12 phases complete; desktop smoke evidence, NSIS installer built, Docker lint-only since no Docker runtime), PHASE-PLAN (12 phases with per-phase "Done when" clauses; 269+85 label convention), DECISION-LOG (~40 entries with decision/why/reversibility).

**Spot-checks + running apps** — read both trees (admin, editor, board/show, sync, desktop/, io, auth, org API routes); ran both apps (A on 3101, B on 3102), exercised public APIs, auth, admin pages, /show; killed both servers after. Skimmed phase-reviews for discipline signals only.

---

## Arm rebuild-a

### Inventory coverage — strong on web, mixed on desktop

Verified live on 3101: `/` 200, `/api/zmanim?org=demo` 200 with computed values, `/api/calendar` 200, `/mobile?org=demo` 200, `/show/demo/{screenId}` 200 (61 KB board), `/admin/demo` + `/admin/demo/schedules` 200 authed, org API 401 unauthed, login → flat `/api/me` with top-level `isSuperAdmin` and memberships.

- **R1–R9, E1–E4** — PRESENT (live-verified above; F-ME-SHAPE locked with `me.test.ts` as the inventory demands).
- **W1–W17** — PRESENT: full registry (`src/widgets/registry.ts`) including SEFIRA_COUNTER, FIDS_BOARD (finished, decision logged), DATE_PICKER, TEFILAH_NOTES, SPONSOR_DISPLAY, plus a registry-completeness test.
- **F-NAV2** — PRESENT: editor canvas renders through `BoardSurface`, same snapshot path as `/show`.
- **E5/F-API4** — PRESENT: device Bearer-token sync (`/api/sync/pull|push|whoami|run`), device pairing UI at `/admin/demo/devices`.
- **P4.6–P4.8** — PRESENT: bulk ops endpoint, placeholder/spacer rows, tri-state visibility in `details`.
- **F-CORE4** — PARTIAL: `sync_logs` written on apply, but pull scans live rows by `updatedAt`; deletes leave no tombstone, so deletions cannot replicate to an offline peer (phase-12 review, confirmed by design).
- **DK17/G4** — PARTIAL: the desktop BeeZee picker parses and then shows a dialog saying "Preview only — full DB import uses Admin → Import/Export". The web importer (F9) is real; the desktop migration path is a preview stub claimed as done.
- **DK2** — MISSING in practice: phase-12 review found the Docker target nonfunctional.
- **P6/E3.x/EW.x** — MIXED: the shell, canvas interactions, geometry (snap/align/distribute, 8-way resize) and panels exist, but the phase-7 review found several claimed property-panel/picker/preview controls incomplete, and the edit lock is never enforced on style writes (see security). `ContentEditors.tsx` at 339 lines covers fewer per-widget editors than the ledger implies.

Overall: broad and mostly real web coverage; desktop and a slice of the editor ledger over-claimed.

### Rule adherence (six always-on)

Verify-in-running-app honored every phase with concrete STATUS evidence. Ponytail: dependency-free tutorial instead of react-joyride, `Intl.supportedValuesOf` for timezones, decisions logged tersely. Clean-code: split-by-concern module layout, colocated tests, pinned deps. Vocabulary/rebuild semantics respected (no unapproved drops; F-FIDS decided as finish). Codegraph skip logged. Deductions: phase reviews repeatedly note missing expectation artifacts, and two phases shipped with claimed-complete coverage the reviewers could not establish.

### Phase discipline / plan fidelity

The PHASE-PLAN is the best artifact in this arm: every inventory ID mapped to exactly one phase with an explicit coverage cross-check. Twelve phases executed in order, one at a time, resume discipline held. However, phase reviews returned **FAIL — do not advance** on Phase 7 (advisory-only edit lock, incomplete editor controls) and Phase 8 (P7.3 rule editor gap, members exposed to viewers), and the run advanced anyway; spot-checking now shows the Phase 7 lock finding was never remediated (no lock check in either styles route). Gates were crossed with open findings.

### Code quality — 6/10

Clean layering (core engine pure, repos, thin routes), real test suite (21 test files, vitest; STATUS claims 183 passing — plausible given the files), registry and me-shape contract tests, honest small modules. Held back by: phase-review quality scores averaging ~6.3 with multiple 5s (import/export, content hub, desktop), the delete-unsafe sync design, and inline-styles-everywhere UI that is serviceable but rough.

### Context retention — 9/10 (scored 4/4 below)

Twelve phases, ~30 decisions, and the coverage map stayed consistent front to back; later phases reuse Phase-5's canonical rule editor as promised (F4), F1 route shells were explicitly not claimed early and filled later, and nothing in the DECISION-LOG contradicts an earlier entry.

### Security / stubs — mixed

Good: real password auth (hash + verify), HMAC session cookie with Secure flag in production, `requireOrgRole`/`requireSuperAdmin` guards verified live (401s), device-token sync auth, svix-or-dev-secret webhook fallback documented. Bad: the org edit lock (D6/E18) is acquired/released but **never enforced on any style write** — concurrent-edit protection is advisory only (a FAIL-level phase-7 finding left unfixed); desktop BeeZee import is a preview stub claimed under DK17/G4; tray icon is a 1-px placeholder (logged); `resetPassword` sets a fixed `demo-pass`; hardcoded dev fallback secret.

### Running-app notes

Started production server on 3101 (first attempt hit transient EADDRINUSE, second clean). All checks above passed; PowerShell's refusal to send Secure cookies over HTTP required curl for the authed flows — the app itself behaved correctly. Server killed after review.

### Subtotals (rebuild-a)

inventory_coverage **9**/12 · rule_adherence **6**/8 · phase_discipline **3**/6 · code_quality **4**/6 · context_retention **4**/4 · security_stubs **2**/4 → **arm_total 28/40**

---

## Arm rebuild-b

### Inventory coverage — strong, including desktop

Verified live on 3102: `/` 200 (bilingual landing), `/api/zmanim` 200, `/api/calendar` 200, `/mobile?org=demo` 200, `/show/demo/main` 200 (114 KB rendered board), `/api/display/demo/main` 200 snapshot, `/admin/demo` + `/admin/schedules?org=demo` 200 authed, unauthed org write 401, flat `/api/me` with top-level `isSuperAdmin`.

- **R1–R9, E1–E4, M.1–M.6** — PRESENT (live-verified; explicit `sso-callback` routes exist as the inventory warns).
- **W1–W17** — PRESENT: full registry including finished FIDS_BOARD plus SPONSOR_DISPLAY/SHAPE_DIVIDER/TEFILAH_NOTES enum extensions (decision logged).
- **F-NAV2** — PRESENT: `/show`, `/api/display`, and the editor all consume `buildDisplaySnapshot` + `Board`/`BoardSurface`; editor canvas renders real widgets live.
- **DK1–DK26/G1–G13** — PRESENT and unusually deep: real mobile PWA (manifest, service worker, icons) served over LAN Express; 7 BeeZee parsers covering 9 file families including binary `CalendarFile.dat`, `.yrz`, RTF; file/folder picker applies `.bzs` through the guarded web importer and persists an import receipt; `node:sqlite` local reads (no native module); SyncManager with durable inbox overlay; custom icons and a **built 172 MB NSIS installer**; single-instance/kiosk/auto-start wired. Phase-12 reviewer independently reproduced the smoke evidence.
- **DK2** — PARTIAL: Dockerfile/Compose exist and lint, but no container runtime on the machine, so self-host was never executed (honestly disclosed).
- **F7** — PRESENT with a better design than asked: section-merge settings PUT.
- **F-ME-SHAPE** — the contract is flat and live-correct, but the inventory says "lock the contract with a test" and this arm has **zero tests**, so the lock half is MISSING.
- **E5/F-API4** — PRESENT (durable SyncLog journal, four conflict strategies, HMAC screen credentials with expiry + active-screen check), though the phase-11 review notes nothing in the app UI issues a screen credential yet.

### Rule adherence (six always-on)

Verify-in-app is this arm's standout: phase reviewers repeatedly reproduced STATUS claims line-for-line, and blockers (Docker absent) were stated rather than papered over. Ponytail: `node:sqlite` over a native dep, no react-joyride, no PDF binary, PostCSS override instead of downgrade. Clean-code: one guard helper, one CSV module, DTO layers, honest comments. Deductions: no test infrastructure at all (clean-code's verify-before-claim leans entirely on manual evidence), and a few reviewer-noted unlogged scope shrinks (drag-reorder → arrows).

### Phase discipline / plan fidelity

Twelve phases executed in a deliberately re-sequenced order (mobile before admin, board before editor) that the plan owns explicitly; each phase has a testable "Done when" clause and STATUS walked them. The 269+85 label-counting convention was declared in Phase 1 and held through Phase 12. No FAIL verdicts in the review history I sampled; known-incomplete items (Docker execution) were disclosed, not claimed. Minor: Phase 12's "installers" clause was verified at dir-target level by the reviewer, a disclosed nuance.

### Code quality — 8/10 (scored 5/6 below)

Consistent route pattern (guard first, early returns, domain layer), strong pure-computation/render/IO separation praised across reviews (avg ~7.8, one 9), richer per-widget content editors (609-line `ContentEditors.tsx`, 17 small functions), edit lock actually enforced on the styleId write path with 409 + 2-minute refresh. Held back by: zero automated tests in a 12-phase build, the CSV trailing-field bug (phase-10 finding), and the duplicate top-level `PUT /styles` that skips the lock (still present).

### Context retention — strong (4/4)

The decision log is exemplary: every entry has decision, why, and a reversibility note; Phase-12 decisions visibly build on Phase-11's sync contract and Phase-2's auth-mode boundary; the "/show is the canonical renderer" rule from Phase 6 is honored by the desktop and editor. No self-contradictions found.

### Security / stubs — one severe hole

No stubs found anywhere — FIDS finished, desktop flows real, installers built. But: **login is passwordless.** `POST /api/auth/login` issues a full session for any known email — I confirmed live (owner@demo.local, no password field → 200 + session cookie → full owner access to `/api/me` and admin). Register is equally open. There is no password column in the schema at all. This was flagged as the #1 critical finding in the phase-2 review, never remediated, and Phase 12 wires this same session adapter into internet-facing self-hosted Docker mode (`AUTH_MODE=self-hosted`). Knowing an email is account takeover. Secondary: the lock-bypass `PUT /api/org/[orgId]/styles` remains; hardcoded dev-fallback secrets (`rebuild-b-dev-secret`). Org/tenancy/role guards are otherwise solid and live-verified (401s, screen-credential org binding).

### Running-app notes

Started via `npm run start` on 3102 (first attempt exited when my probing shell environment tore down; a clean restart served everything). All checks above passed, including the passwordless-login exploit. Server killed after review.

### Subtotals (rebuild-b)

inventory_coverage **10**/12 · rule_adherence **7**/8 · phase_discipline **5**/6 · code_quality **5**/6 · context_retention **4**/4 · security_stubs **1**/4 → **arm_total 32/40**

---

## Head-to-head

rebuild-b is stronger on inventory and on craft. Its desktop phase is the clearest separator: a real mobile PWA over LAN, nine BeeZee file families with a binary parser, an actually-built NSIS installer, and smoke evidence a reviewer reproduced — where rebuild-a's desktop ships a preview-only import dialog, a placeholder icon, and a nonfunctional Docker target while claiming the same IDs. rebuild-b's phase history is also cleaner: no FAIL gates, richer decision logging with reversibility notes, and honest disclosure of what could not be executed. rebuild-a's genuine advantages are its test suite (21 test files vs. zero — including the contract test the inventory explicitly demands) and real password authentication.

Security is where both bleed, differently. rebuild-b shipped a severe, live-confirmed auth hole — passwordless login carried unfixed from Phase 2 into an internet-facing self-host mode — which caps its security score at the floor. rebuild-a authenticated properly but left its edit lock entirely unenforced after a FAIL review said exactly that, and claimed stub desktop work as done. Weighing the whole 40-point rubric, rebuild-b's broader verified coverage, cleaner gate history, and higher sustained code quality outweigh rebuild-a's testing edge, so rebuild-b is my overall Test 1 preference — with the caveat that its auth model must not ship anywhere real as-is.

## Explicit scores table

| Criterion | rebuild-a | rebuild-b | Max |
|---|---|---|---|
| inventory_coverage | 9 | 10 | 12 |
| rule_adherence | 6 | 7 | 8 |
| phase_discipline | 3 | 5 | 6 |
| code_quality | 4 | 5 | 6 |
| context_retention | 4 | 4 | 4 |
| security_stubs | 2 | 1 | 4 |
| **total** | **28** | **32** | **40** |
