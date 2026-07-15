# Test 1 Verdict — Build quality

**Date:** 2026-07-15  
**Orchestrator:** cursor-grok-4.5-high  
**Model mapping:** withheld until FINAL-REPORT

## Phone summary

Both arms finished all 12 phases with full phase-review trails. Blind finals (fresh Fable + fresh Sol, each rating both arms) agree: **rebuild-b wins Test 1**. rebuild-a kept stronger password auth and a real test suite; rebuild-b won on inventory depth (desktop/LAN/BeeZee), cleaner gate history, and end-to-end craft — despite a severe passwordless-login hole.

## Blind final scores (/40)

| Reviewer | rebuild-a | rebuild-b | Source |
|---|---:|---:|---|
| Blind Sol | 25 | 30 | `blind-reviews/sol.md` |
| Blind Fable | 28 | 32 | `blind-reviews/fable.md` |
| **Mean (official)** | **26.5** | **31** | |

Both blind reviewers independently preferred rebuild-b.

### Criterion means (from the two blind tables)

| Criterion | rebuild-a | rebuild-b | Max |
|---|---:|---:|---:|
| inventory_coverage | 8.5 | 10 | 12 |
| rule_adherence | 5.5 | 6.5 | 8 |
| phase_discipline | 3 | 4.5 | 6 |
| code_quality | 4 | 5 | 6 |
| context_retention | 3.5 | 4 | 4 |
| security_stubs | 2 | 1 | 4 |

## Phase-review history (discipline / context / security signals)

- **rebuild-a:** Multiple FAIL gates recorded (notably editor lock unenforced, schedule/RBAC gaps, Phase 12 desktop stubs: BeeZee preview-only, Docker/libSQL mismatch, sync deletes). Strong mid-build web/test work; final desktop claims overreached.
- **rebuild-b:** No FAIL gates in the phase trail; Phase 12 scored very high on inventory with live packaged desktop evidence. Critical auth finding from Phase 2 (passwordless email login) never remediated and carried into self-host — capped security in both blind reviews.

Phase history supports the blind preference for B on discipline/coverage, and A on primary-auth security.

## Official Test 1 points (of 40)

| Arm | Points |
|---|---:|
| rebuild-a | **26.5** |
| rebuild-b | **31** |

**Test 1 winner: rebuild-b**

## Next

Clone rebuild-b over rebuild-a so both folders are identical; inject 9 seeded bugs; run Test 2 detection reviews.
