# Phase-gate commit map for GLM reaudit
# Extract with: powershell -File .scratch/extract-audit-snapshots.ps1
# Arm path at each commit is the frozen tree AFTER that phase was coded.

## rebuild-a (Fable Test 1 builder)

| Phase | Commit | Subject |
|---|---|---|
| 1 | 9464f65 | Experiment arm A: Phase 1 foundation complete. |
| 2 | 86fa14e | Experiment: both arms Phase 2 complete. |
| 3 | fff8718 | Experiment arm A: Phase 3 auth and onboarding complete. |
| 4 | 10c6ea8 | Experiment: A Phase 4 admin shell; B Phase 3 zmanim/mobile. |
| 5 | 589a3e2 | Experiment arm A: Phase 5 schedules admin complete. |
| 6 | 97253b3 | Experiment: A Phase 6 content hub; B Phase 4 review; B on Phase 5. |
| 7 | c88b5ad | Experiment arm A: Phase 7 visual editor complete. |
| 8 | 1e490af | Experiment: A Phase 8 screens/members/settings; B P6 review; B on Phase 7. |
| 9 | 950f412 | Experiment arm A: Phase 9 mobile and super-admin; B P7 retry. |
| 10 | 0380784 | Experiment: A Phase 10 import/export; B Phase 8 admin shell. |
| 11 | dbc775f | Experiment arm A: Phase 11 i18n and tutorial complete. |
| 12 | c1433ab | Experiment arm A: Phase 12 complete — all phases done; B on Phase 10. |

## rebuild-b (Sol Test 1 builder)

| Phase | Commit | Subject |
|---|---|---|
| 1 | b266d74 | Experiment arm B: Phase 1 bilingual landing complete. |
| 2 | 86fa14e | Experiment: both arms Phase 2 complete. |
| 3 | 10c6ea8 | Experiment: A Phase 4 admin shell; B Phase 3 zmanim/mobile. |
| 4 | 178760b | Experiment arm B: Phase 4 schedules and groups complete. |
| 5 | eb0bb82 | Experiment arm B: Phase 5 content hub complete. |
| 6 | 74dc4a6 | Experiment arm B: Phase 6 public board and widgets complete. |
| 7 | 4fac952 | Experiment: B Phase 7 editor complete; A P9 review; A on Phase 10. |
| 8 | 0380784 | Experiment: A Phase 10 import/export; B Phase 8 admin shell. |
| 9 | 24134ce | Experiment arm B: Phase 9 members, settings, tutorial, themes. |
| 10 | f11f980 | Experiment arm B: Phase 10 — import/export and super-admin. |
| 11 | b56a06c | Experiment arm B: Phase 11 — durable offline sync. |
| 12 | 9a3eece | Experiment arm B: Phase 12 complete — all phases done. |

## Full finals (same as P12 trees)

- A final = c1433ab `_experiment/rebuild-a`
- B final = 9a3eece `_experiment/rebuild-b`
