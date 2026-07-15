# GLM reaudit rubric (single third-party reviewer)

Model for ALL reviews in this pass: **glm-5.2-high** (or the Cursor slug for GLM 5.2).
Do NOT guess which contestant model built which arm. Labels are rebuild-a / rebuild-b only.

## Phase review

Use `PHASE-REVIEW-RUBRIC.md` checklist + scores.
Focus on **this phase only**: claimed IDs in STATUS/PHASE-PLAN at the snapshot, evidence in the snapshot tree + phase diff.
Running-app verification is optional (snapshots have no node_modules); prefer static evidence; say N/A if not run.

## Full final review

Rate the entire arm against FEATURE-INVENTORY + EDITOR-INVENTORY.
Produce the BLIND-REVIEW-RUBRIC score table (/40) for that arm only (one arm per full review spawn).
