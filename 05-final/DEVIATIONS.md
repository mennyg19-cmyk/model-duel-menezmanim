# Deviations log

Logged when the run diverges from the locked plan (resume failures, slug rejects, port remaps, etc.).

## [2026-07-15] Grok + Kimi tie-break on P12 finals
**What happened:** GLM full finals tied 37–37; user asked for a second neutral.
**Fix:** Spawned `cursor-grok-4.5-high` and `kimi-k2.7-code` on both P12 snapshots (no GLM FULL-* anchoring). Grok: A 32 / B 37 (B wins). Kimi: A 33 / B 29 (A wins). Official Test 1 unchanged (GLM 36.5/37). Wrote `reaudit/TIEBREAK-*.md`; experiment pack moved toward public `model-duel-menezmanim` repo.
**Status:** DECIDED

## [2026-07-15] GLM 5.2 single-reviewer reaudit of Test 1
**What happened:** User flagged (1) Terra vs Sonnet split mid-build reviewers, (2) no single full-inventory pass before deleting the loser, (3) prompt allowed reference-app harvest (not greenfield).
**Fix:** Extracted all 24 phase-complete commits to `_experiment/audit/snapshots/`; GLM 5.2 reviewed every gate + both finals. Wrote `TEST1-REAUDIT.md`; amended `FINAL-REPORT.md`. Official Test 1 now 36.5 vs 37 (was 26.5 vs 31). Tests 2–3 unchanged. Greenfield issue documented, not re-run.
**Status:** DECIDED

## [2026-07-15] B Phase 7 Sol resource_exhausted mid-editor
**What happened:** Contestant B (`fc07a246`, gpt-5.6-sol-high) failed with `[resource_exhausted]` while building Phase 7 visual editor. STATUS still said Phase 7 not started; partial WIP existed under `src/admin/` and editor/lock APIs.
**Fix:** Fresh Sol high spawn to finish Phase 7 from WIP (not a full restart). Logged; A Phase 9 continues in parallel.
**Status:** DECIDED

## [2026-07-15] A Phase 6 Terra review resource_exhausted
**What happened:** Reviewer `8dab56cb` (gpt-5.6-terra-high) for rebuild-a Phase 6 failed with `[resource_exhausted]`.
**Fix:** Re-spawned fresh Terra high reviewer (`dffb9d02`) with a tighter prompt. Do not resume A Phase 7 until the report exists.
**Status:** DECIDED

## [2026-07-15] Phase review via explore+readonly cannot write artifacts
**What happened:** First B Phase 1 reviewer spawned as `explore` + `readonly: true`. Ask-mode blocked writing `phase-reviews/rebuild-b-phase-01.md` and starting the app.
**Fix:** Re-spawned as `generalPurpose` (writable) with instruction: no app code edits; report file only. Future phase reviews use generalPurpose, not explore/readonly.
**Status:** DECIDED
