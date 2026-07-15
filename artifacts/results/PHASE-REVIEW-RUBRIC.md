# Phase review checklist (for reviewers)

Fill every item with evidence or `N/A` + why. Write the full report to the path given in your spawn prompt.

## Meta
- Model (orchestrator-assigned):
- Arm reviewed (rebuild-a or rebuild-b):
- Phase number:
- Diff / files touched this phase:

## Proof-of-read
Summarize REQUIRED READING paths (3–5 lines each).

## Checklist

1. **Inventory coverage** — which inventory IDs this phase claimed; PRESENT / PARTIAL / STUB / MISSING with evidence
2. **Running app** — could you verify? commands, ports, what you opened/saw (or blocker)
3. **No stubs** — dead buttons, empty handlers, "coming soon" marked done?
4. **Rule: ponytail** — YAGNI, shortest diff, no unrequested abstractions?
5. **Rule: clean-code** — naming, error handling, one pattern per concern, god files?
6. **Rule: workflow** — expectation/verify discipline visible? speculative product inventing?
7. **Rule: codegraph** — structural lookup discipline if applicable
8. **Rule: git-discipline** — contestant must NOT git; flag if they did
9. **Todos / PHASE-PLAN fidelity** — did they do what their plan said for this phase?
10. **Context retention** — contradicted earlier phases or dropped prior work?
11. **Security** — secrets, auth/trust boundary issues, unsafe input handling?
12. **Code quality** — overall craft score 1–10 + why
13. **Findings** — numbered list or `zero findings`

## Scores (1–10 each, for orchestrator aggregation)
- inventory_coverage:
- rule_adherence:
- plan_fidelity:
- context_retention:
- security:
- code_quality:
