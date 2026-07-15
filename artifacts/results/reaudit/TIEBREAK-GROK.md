# Tie-break full finals — blind audit

**Model:** cursor-grok-4.5-high  
**Runner:** spawn  
**Pass:** Tie-break full finals (after prior 37/40 tie)  
**Labels only:** rebuild-a / rebuild-b  
**Running-app verification:** N/A (static snapshots). Prefer STATUS evidence + code.

CodeGraph: `codegraph status` in both `snapshots/a/p12` and `snapshots/b/p12` → **Not initialized**. Structure via Read/Glob OK for this audit.

---

## Proof-of-read

1. **BLIND-REVIEW-RUBRIC.md** — Independent /40 for both arms; inventory + rule + phase + quality + context + security; no model naming; score table required.
2. **SCORECARD.md (Test 1 only)** — Build = 40 pts; inventory 12 / rules 8 / phase 6 / quality 6 / context 4 / security 4; blind finals feed inventory+quality.
3. **REAUDIT-INSTRUCTIONS.md (Full final)** — Rate whole arm vs FEATURE + EDITOR inventories; produce /40 table; labels a/b only.
4. **FEATURE-INVENTORY.md** — ~269 labels: R1–R10, P3–P12 (+P4o/SA/M/SH), D1–D17, C1–C12, W1–W17, E1–E22, DK1–DK26 + G1–G13, F* fixes. Merge rule = more complete of v1/v2.
5. **EDITOR-INVENTORY.md** — Surfaces S0–S10 + ~63 E/EW IDs + TF1–TF10; #1 = live shared Board render (E8.1/E8.2).
6. **a/p12 STATUS** — Phases 1–12 done; P12 desktop+sync; device Bearer sync walked on 3101 (37 pull changes); typecheck + 183 tests claimed.
7. **a/p12 PHASE-PLAN** — 12 phases; editor all in P7; desktop+E5 in P12; stack Next+Drizzle/libSQL.
8. **a/p12 DECISION-LOG** — Session auth (no Clerk keys); F-FIDS finish; F9 web apply; desktop modes + device tokens; icons placeholder.
9. **b/p12 STATUS** — All 12 done; desktop smoke + NSIS artifact + LAN APIs; Docker lint only (no runtime).
10. **b/p12 PHASE-PLAN** — Sync alone in P11; desktop P12; 269+85 label counting convention.
11. **b/p12 DECISION-LOG** — Isolated Electron package; Express LAN + node:sqlite; nine-family BeeZee; screen HMAC sync; section-merge settings.

---

## Arm rebuild-a

### Inventory coverage — **mixed → strong on web, weak on desktop depth**

| ID examples | Verdict |
|---|---|
| R1–R9, R5 deep `/admin/[orgSlug]/*` (schedules, content, editor, screens, members, settings, import-export, devices, theme, tutorial) | PRESENT |
| W1–W17 registry + FidsBoard real renderer (not Coming Soon) | PRESENT |
| E8–E22 org/admin APIs (~61 route files), E5 pull/push + devices pairing | PRESENT |
| P6 / E8.1 live `BoardSurface` in EditorCanvas | PRESENT |
| EW.3–EW.10 content editors for clock/media/zmanim/events/ticker/jewish/countdown | PRESENT |
| EW for YAHRZEIT / SPONSOR / SHAPE / TEFILAH_NOTES / SEFIRA / FIDS / DATE_PICKER | PARTIAL (notes-only; no dedicated editors) |
| F9 web `applyBzsImport` + ImportExportHub BeeZee tab | PRESENT |
| DK17–DK23 desktop BeeZee | PARTIAL — tray import is **preview dialog only**; single `.bzs` parser, not nine families |
| DK12 LAN mobile / DK26 packaging | PARTIAL — reuses Next `/mobile` over LAN; NSIS target wired; icons placeholder 1×1 PNG |
| G4 file picker | PRESENT (picker exists; write deferred to Admin Import) |

### Rule adherence
Six always-on visible: decisions logged, ponytail-ish desktop (Next standalone as LAN server), verify-in-app claimed in STATUS. Penalty: STATUS/plan claim DK1–DK26 / G1–G13 complete while desktop BeeZee write path is explicitly preview-only and multi-file parsers absent.

### Phase discipline
12 phases mapped; gates documented; final STATUS closes run. Sync (E5/F-CORE4) bundled into Phase 12 with desktop rather than a dedicated sync phase — still finished with evidence.

### Code quality
Solid: `guards.ts`, hashed device tokens, 21 `*.test.ts` files (registry, beezee, sync conflicts, me-shape, core). Editor shell split by concern. ContentEditors thinner than arm B.

### Context retention
DECISION-LOG retains auth mode, F-FIDS finish, F-NAV2 shared board, session-vs-Clerk across phases without contradiction.

### Security / stubs
Org/admin guards present; sync requires device Bearer. Stub issue: desktop BeeZee claimed under DK/G while UI says “Preview only — full DB import uses Admin → Import/Export”.

### Running-app
N/A this pass. STATUS cites 3101 login → pair → pull 37 / push 200 / LAN APIs / 183 tests / build green.

**Subtotals:** inventory 9/12 · rules 6/8 · phase 5/6 · quality 5/6 · context 4/4 · security 3/4 → **32/40**

---

## Arm rebuild-b

### Inventory coverage — **strong**

| ID examples | Verdict |
|---|---|
| R1–R9, `/show`, mobile, super-admin, import | PRESENT |
| W1–W17 registry + finished FIDS | PRESENT |
| Editor E8.1/E8.2 live BoardSurface; ContentEditors covers **all** widget types incl. FIDS/DatePicker/Sefira/etc. | PRESENT |
| E5 sync pull/push + F-API4 session **or** screen HMAC Bearer | PRESENT |
| DK1–DK16 modes/windows/tray/IPC/LAN Express :3001 / mode UI | PRESENT (static + smoke STATUS) |
| DK17–DK23 seven parsers + nine file families; picker applies `.bzs` via guarded importer | PRESENT |
| DK12 mobile PWA under `desktop/mobile/`; DK26 NSIS/DMG/AppImage/DEB + custom icon | PRESENT |
| G1–G13 kiosk/autostart/single-instance/SyncManager/LAN URL in tray | PRESENT (wired in main.cjs) |
| F1 deep links | PARTIAL — schedules/content use `/admin/schedules?org=` / `/admin/content?org=` (shell shared; not every section under `[orgSlug]`) |
| Unit test suite in snapshot | MISSING (0 `*.test.ts`; quality hit, not inventory ID) |

### Rule adherence
Decisions logged (auth reconciliation, F-DESKTOP-VERCEL isolation, BeeZee defaults). STATUS honestly notes Docker not runnable locally. Desktop claims match modules on disk (smoke.cjs, sync-manager, beezee multi-parser).

### Phase discipline
Sync isolated in Phase 11; desktop final Phase 12 matches plan. Smoke + packaging evidence; stop after final phase.

### Code quality
Modular desktop (`local-api`, `sync-manager`, `runtime-plan`); deeper ContentEditors; section-merge settings. No unit tests in snapshot offsets the craft win vs A’s test suite → mid score.

### Context retention
Long DECISION-LOG keeps `/show` as sole renderer, SyncLog journal contract, and mode preservation from early phases through P12.

### Security / stubs
`authorizeSyncRequest` + org role checks; no Coming Soon widget stubs found. Desktop BeeZee write path real (not preview-only).

### Running-app
N/A this pass. STATUS cites typecheck/build, desktop smoke (3 modes, 5 schedules, BZS write, SyncManager), packaged win-unpacked + NSIS size, Docker lint-only.

**Subtotals:** inventory 11/12 · rules 7/8 · phase 6/6 · quality 5/6 · context 4/4 · security 4/4 → **37/40**

---

## Head-to-head

**Inventory:** rebuild-b wins on desktop completeness (nine-family BeeZee + apply, dedicated LAN PWA, SyncManager, installer targets) and full per-widget content editors. rebuild-a wins on admin deep-link breadth, device-pairing UI, and web API surface density, but loses inventory points on desktop BeeZee depth and EW coverage holes.

**Craft / security:** rebuild-a’s unit tests and explicit auth guards are strong; rebuild-b’s sync credential model and absence of “claimed done but preview-only” desktop import are stronger on the stub criterion. Quality nets even at 5/6 each.

**Overall preference for Test 1 build quality:** rebuild-b — closer match to frozen DK/G/EW inventory with fewer overclaims.

---

## Explicit scores

| Criterion | rebuild-a | rebuild-b | Max |
|---|---|---|---|
| inventory_coverage | 9 | 11 | 12 |
| rule_adherence | 6 | 7 | 8 |
| phase_discipline | 5 | 6 | 6 |
| code_quality | 5 | 5 | 6 |
| context_retention | 4 | 4 | 4 |
| security_stubs | 3 | 4 | 4 |
| **total** | **32** | **37** | **40** |

## Call

**Winner: rebuild-b** — fuller desktop BeeZee/LAN/packaging and complete EW content editors; rebuild-a’s desktop BeeZee remains preview-only while STATUS claims the DK/G set done.
