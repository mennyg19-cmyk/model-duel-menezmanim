# Test 1 Reaudit Verdict (GLM 5.2 single reviewer)

**Date:** 2026-07-15  
**Reviewer model (all gates + both finals):** `glm-5.2-high`  
**Method:** Restore each phase-complete commit into private audit snapshots, review with identical rubric; then full inventory audit of each P12 tree. Original Terra/Sonnet phase reviews retained under `phase-reviews-original/` as appendix only.

## Phone summary

Under a **single third-party reviewer**, the two finished builds look much closer than the original split-reviewer + dual-blind pass.

- **Full finals:** both **37/40** (identical category scores).
- **Phase averages (1–10 dims):** rebuild-b **8.65** vs rebuild-a **8.51** — slight edge to B.
- **Revised Test 1 call:** **tie on the full audit; phase trail breaks to rebuild-b by a hair.** Official revised Test 1 points: **rebuild-a 36.5 · rebuild-b 37** (full 37 each; −0.5 on A for weaker late-phase inventory mean, especially P11 i18n).

Tests 2–3 unchanged (identical cloned trees). Overall winner remains **Sol**.

## Why this reaudit

1. Original mid-build reviews used Terra for A and Sonnet for B (possible reviewer-ability bias).  
2. Loser tree was deleted before a single frozen full-inventory pass on both finals.  
3. Contestant prompt allowed harvesting old apps — Test 1 is **not** pure greenfield; noted again below.

## Full final scores (/40)

| Criterion | rebuild-a | rebuild-b | Max |
|---|---:|---:|---:|
| inventory_coverage | 11 | 11 | 12 |
| rule_adherence | 7 | 7 | 8 |
| phase_discipline | 6 | 6 | 6 |
| code_quality | 5 | 5 | 6 |
| context_retention | 4 | 4 | 4 |
| security_stubs | 4 | 4 | 4 |
| **total** | **37** | **37** | **40** |

Sources: `reaudit/FULL-A.md`, `reaudit/FULL-B.md`.

Note: identical full-table scores reduce discrimination; phase trail is the main differentiator in this pass.

### Later: Grok + Kimi on the same finals

| Reviewer | rebuild-a | rebuild-b | Call |
|---|---:|---:|---|
| Grok 4.5 | 32 | 37 | B |
| Kimi K2.7 | 33 | 29 | A |

Does **not** change official Test 1 points above. See `reaudit/TIEBREAK-*.md`.

## Phase-gate means (GLM, 1–10 each dim)

| Dimension | rebuild-a | rebuild-b |
|---|---:|---:|
| inventory_coverage | 8.42 | **8.75** |
| rule_adherence | 8.42 | **8.58** |
| plan_fidelity | 8.58 | **9.00** |
| context_retention | 9.08 | **9.17** |
| security | **8.67** | 8.58 |
| code_quality | **7.92** | 7.83 |
| **mean of dims** | 8.51 | **8.65** |

All 24 reports: `reaudit/phase-reviews/rebuild-{a|b}-phase-01.md` … `-12.md`.

Notable late-phase gaps (examples):
- A P11: F-I18N3 partial / hardcoded `t("en")` on dashboard (inventory 6).
- A P12: BeeZee types DK18–DK23 incomplete; SyncManager unused by main loop.
- B P09: F-I18N3 shell-only; truncated zman/display-name editors.
- B P12: strong desktop coverage; Docker runtime unexercised.

## Official revised Test 1 points

| Arm | Original Test 1 | Reaudit Test 1 |
|---|---:|---:|
| rebuild-a (Fable) | 26.5 | **36.5** |
| rebuild-b (Sol) | 31.0 | **37.0** |

## Greenfield caveat (unchanged)

`CONTESTANT-PROMPT.md` told both arms to harvest behavior from old apps. Sol’s DECISION-LOG records using v1/v2/prior rebuild. This reaudit **does not** make Test 1 a pure green-plate; it only equalizes the reviewer.

## Effect on overall scorecard

| Test | Fable | Sol |
|---|---:|---:|
| 1 (reaudit) | 36.5 | **37** |
| 2 (unchanged) | 10 | **16** |
| 3 (unchanged) | 26 | **29** |
| **Total /100** | **72.5** | **82** |

Original total was 62.5 vs 76. Reaudit raises both Test 1 scores and narrows the build gap; **Sol still wins overall**, driven mainly by detection (Test 2) and a slight fix-scope edge (Test 3).
