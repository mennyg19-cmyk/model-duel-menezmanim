# Contestant Prompt (identical for both arms)

You are rebuilding MenEZmanim from scratch into **your workspace folder only**.

## REQUIRED READING (do this first, in full, top to bottom)

1. `_experiment/inventory/FEATURE-INVENTORY.md` — frozen feature source of truth (WHAT to build)
2. `_experiment/inventory/EDITOR-INVENTORY.md` — editor/widget detail
3. Every file in your workspace `.cursor/rules/` — these are the ONLY rules you follow
4. This prompt file: `_experiment/results/CONTESTANT-PROMPT.md`

Open every deliverable with a **proof-of-read** block: 3–5 lines per required file in your own words (ID counts, route counts, key constraints). Missing or wrong counts = rejected; you will be re-spawned.

## Your workspace

- Build ONLY inside: `__WORKSPACE__`
- Do NOT touch the other rebuild folder, the parent app under `apps/`, or `_experiment/results/` except writing your own status files listed below.
- Reference old apps listed in the inventory for WHAT features do — harvest behavior, do not copy layout pixel-for-pixel.
- Ports for your arm (use these; do not conflict with the other arm):
  - Web: `__WEB_PORT__`
  - DB (if local Docker/sqld): `__DB_PORT__`

## Rules you follow

Only the six always-on rules in your `.cursor/rules/`. There is no rebuild-protocol, review-protocol, or subagents protocol for you. Do not invent ceremony beyond what those six rules + this prompt require.

## Git

**Do not run git.** The orchestrator commits and pushes. You write code and status files only.

## What to do

1. Read the inventories and rules (proof-of-read required).
2. Write `__WORKSPACE__/PHASE-PLAN.md`: your own phased build plan covering the full inventory. You choose phase boundaries. Every inventory ID must map to exactly one phase. Phases must be shippable increments that can be verified in a running app.
3. Write `__WORKSPACE__/STATUS.md` with: current phase, what's done, what's next.
4. Build **Phase 1 only**, then stop and update STATUS.md with:
   - Phase number completed
   - Inventory IDs claimed this phase
   - How to start the app (commands, ports)
   - Verification evidence (routes opened / what you saw)
5. When later resumed: continue the next unfinished phase only. Do not re-plan from scratch unless STATUS.md says the plan must change (log why in DECISION-LOG.md in your workspace). After each phase, stop again with STATUS.md updated the same way.

## Definition of done per phase

- Code for that phase's inventory IDs is implemented (no stubs, no "coming soon" as done).
- App runs locally on your assigned ports with seeded data sufficient to exercise the phase.
- You walked the phase checklist in the running app and recorded evidence in STATUS.md.
- Typecheck/build for your workspace succeeds (or you document exact failures blocking you).

## Deliverables (paths)

- `__WORKSPACE__/PHASE-PLAN.md`
- `__WORKSPACE__/STATUS.md`
- `__WORKSPACE__/DECISION-LOG.md` (any judgment calls)
- The app itself under `__WORKSPACE__/`

## Final reply (≤10 lines)

Paths written, proof-of-read headline counts, phase completed, how to run the app. No sycophancy, no essay.
