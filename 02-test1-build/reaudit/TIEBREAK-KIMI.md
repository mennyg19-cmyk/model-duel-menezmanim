# Tie-break full finals — rebuild-a vs rebuild-b

**Model:** kimi-k2.7-code | **Runner:** spawn | **Tie-break full finals

---

## Proof-of-read

- **BLIND-REVIEW-RUBRIC.md + SCORECARD.md (Test 1):** 40-point Test 1 split across 6 criteria; independent scoring, no model guessing, both arms scored together.
- **REAUDIT-INSTRUCTIONS.md:** Full final review rates each arm against both inventories; static evidence preferred over running app; no anchoring on prior scores.
- **FEATURE-INVENTORY.md + EDITOR-INVENTORY.md:** 269 feature labels plus 85 editor labels; W1–W17 must be end-to-end wired, E8.1 live render is the #1 editor requirement, F-NAV2 requires one shared board render path.
- **Arm A STATUS.md / PHASE-PLAN.md / DECISION-LOG.md:** 12 phases, every inventory ID mapped to exactly one phase, final phase covers R10 + DK1–DK26 + G1–G13 + E5/F-API4 + F-CORE4, decision log is newest-first with reversible defaults.
- **Arm B STATUS.md / PHASE-PLAN.md / DECISION-LOG.md:** 12 phases, all inventory IDs claimed, final phase covers R10 + DK1–DK26 + G1–G13 + F-DESKTOP-* fixes, detailed desktop smoke evidence, decision log covers auth/BeeZee/sync reconciliation.

---

## Arm rebuild-a

### Inventory coverage summary

Strong overall, with most IDs claimed and present.

- **PRESENT:** R8/R9 public board, W1–W17 registry (including W16 FIDS board finished, not a stub), R10 + DK1–DK26 desktop package, P6/P6.1–P6.16 editor surfaces, E5 sync pull/push + device-pairing UI, P3/P3.1–P3.7 dashboard + quick-add + live preview, P4/P4.1–P4.8 schedules, P5/P5.1–P5.6 content hub, P7–P9, P10/P10.1–P10.6 import/export, P11 tutorial, P12 admin theme picker.
- **PARTIAL:** F9 BeeZee (web parses + applies; desktop picker only previews, no DB write), F10 PDF (HTML print-to-PDF only, no binary PDF), P6.14 board themes stored in localStorage only, P11 tutorial is a custom overlay instead of react-joyride.
- **MISSING:** none major; the README is stale at Phase 1–2.

### Rule adherence notes

Follows the phase plan and decision-log discipline. Uses Vitest for tests and keeps the app runnable. However, the README is stale (still describing Phase 1–2), and the UI uses extensive inline styles (`style={{...}}`) which conflicts with F-I18N3 and the clean-code rule against inline styles. Middleware is a pass-through (`return NextResponse.next()`), relying on route handlers for auth.

### Phase discipline / plan fidelity

All 12 phases are mapped and completed. STATUS.md lists concrete verification evidence (login, sync pull, LAN data, typecheck, tests, build). DECISION-LOG.md records every product decision with reversible defaults.

### Code quality (1–10): 7

Positive: 21 test files covering core engine, sync, auth, widgets, CSV, BeeZee, and editor geometry; a dedicated `src/auth/` module with guards, org access, and super-admin checks; the editor uses shared board render path (F-NAV2). Negative: stale README, inline styles throughout, and some questionable choices (e.g., `SelectionLayer` in EditorCanvas receives `scale={1}` while arm B passes the real scale).

### Context retention (1–10): 7

Decision log is comprehensive and ordered. The build did not drop earlier features. The only drift is the README, which was not updated after Phase 2.

### Security / stubs (1–10): 7

Auth guards verify org membership and roles in route handlers. Super-admin endpoints are protected. Desktop BeeZee import is preview-only, so it cannot accidentally mutate the database. The main weakness is the middleware not enforcing auth, leaving all protection to route handlers.

### Running-app verification

N/A — static snapshot audit. STATUS.md claims evidence on port 3101.

### Subtotals

| Criterion | Score | Max |
|---|---|---|
| inventory_coverage | 11 | 12 |
| rule_adherence | 6 | 8 |
| phase_discipline | 5 | 6 |
| code_quality | 5 | 6 |
| context_retention | 3 | 4 |
| security_stubs | 3 | 4 |
| **total** | **33** | **40** |

---

## Arm rebuild-b

### Inventory coverage summary

Strong overall, but with notable gaps around device pairing and testing.

- **PRESENT:** R8/R9 public board, W1–W17 registry (including W16 FIDS), R10 + DK1–DK26 desktop package with mobile LAN PWA, P6 editor surfaces, E5 sync pull/push with screen credentials, P3 dashboard, P4/P4.1–P4.8 schedules, P5 content hub, P7–P9, P10/P10.1–P10.6 import/export, P11 tutorial, P12 admin theme picker.
- **PARTIAL:** F9 BeeZee (desktop applies through the web API using a hardcoded demo login), F-API4 device credentials (screen-token auth exists but no `/admin/[orgSlug]/devices` pairing UI), P10.6 JSON imports (limited categories), P11 tutorial uses a custom overlay.
- **MISSING:** zero test files and no test script in `package.json`; this is a significant gap for a rebuild that claims every phase complete.

### Rule adherence notes

Uses CSS classes and shared CSS variables (good for F-I18N3). Middleware actually verifies session tokens and redirects unauthenticated users for `/admin` and `/onboarding`. README is current. However, the project has no tests at all, violating the testing-protocol expectation that code and tests ship together. The desktop BeeZee import hardcodes `owner@demo.local` to obtain a session cookie, which is a trust-boundary violation.

### Phase discipline / plan fidelity

All 12 phases are mapped and completed. STATUS.md provides detailed desktop smoke evidence (3 modes, 5 schedules, 2 announcements, zmanim 200, PWA 200, 9 BeeZee families, NSIS installer built). DECISION-LOG.md is thorough and well-structured.

### Code quality (1–10): 5

Positive: clean domain layer (`src/domain/*`), CSS-class-based UI, modular desktop code (db.cjs, local-api.cjs, sync-manager.cjs, runtime-plan.cjs). Negative: no tests, hardcoded desktop credentials, a typo in the import category (`"bezee"` instead of `"beezee"`), and `package.json` pins TypeScript `6.0.3` which does not exist (likely a hallucinated or mis-typed version).

### Context retention (1–10): 8

README is current and accurately reflects the final Phase 12 state. Decision log preserves all major choices with rationale and reversibility notes.

### Security / stubs (1–10): 5

Middleware and route handlers enforce auth, and sync screen credentials are cryptographically signed. The desktop BeeZee flow is the critical flaw: it logs in as `owner@demo.local` to call the web import API, meaning an untrusted local process can impersonate a demo owner. This fails the trust-boundary audit.

### Running-app verification

N/A — static snapshot audit. STATUS.md claims evidence on port 3102.

### Subtotals

| Criterion | Score | Max |
|---|---|---|
| inventory_coverage | 10 | 12 |
| rule_adherence | 5 | 8 |
| phase_discipline | 5 | 6 |
| code_quality | 3 | 6 |
| context_retention | 4 | 4 |
| security_stubs | 2 | 4 |
| **total** | **29** | **40** |

---

## Head-to-head

**Inventory:** Arm A covers slightly more surface. It ships a dedicated device-pairing UI/API (`/admin/[orgSlug]/devices`, `app/api/org/[orgId]/devices/*`) and a full test suite, while arm B has screen credentials but no visible pairing flow. Both arms register all 17 widgets and finish the FIDS board (W16), so the inventory gap is small but favors A.

**Craft / security:** Arm B has better UI discipline (CSS classes, current README, middleware auth) and a more modular desktop package. Arm A wins on security and verification: it has route guards, no hardcoded credentials, and a real test suite. Arm B's hardcoded `owner@demo.local` login inside the desktop BeeZee importer is a concrete trust-boundary failure that arm A avoids by keeping desktop BeeZee preview-only.

**Overall:** Arm A is the stronger Test 1 build. The presence of tests and the absence of a hardcoded credential path outweigh arm B's UI polish and README currency.

---

## Explicit scores table

| Criterion | rebuild-a | rebuild-b | Max |
|---|---|---|---|
| inventory_coverage | 11 | 10 | 12 |
| rule_adherence | 6 | 5 | 8 |
| phase_discipline | 5 | 5 | 6 |
| code_quality | 5 | 3 | 6 |
| context_retention | 3 | 4 | 4 |
| security_stubs | 3 | 2 | 4 |
| **total** | **33** | **29** | **40** |

---

## Call

**rebuild-a wins the full audit, 33–29.** The decisive differences are rebuild-a's test suite and safer trust boundary (no hardcoded demo-owner login in the desktop importer), while rebuild-b has better UI/CSS discipline and a current README but cannot overcome the zero-test gap and the desktop BeeZee credential shortcut.
