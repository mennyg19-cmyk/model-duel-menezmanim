# Builds — Test 1 finals (before Test 2/3 clone)

These are the **finished rebuild trees after Phase 12**, restored from the experiment git commits — **before** the winner was copied over the loser for Tests 2–3.

| Folder | Model | Arm | Provenance commit |
|---|---|---|---|
| [fable-final/](fable-final/) | `claude-fable-5-thinking-high` | rebuild-a | `c1433ab` |
| [sol-final/](sol-final/) | `gpt-5.6-sol-high` | rebuild-b | `9a3eece` |

## What’s included

- Full app source: `app/`, `src/`, `desktop/`, configs, lockfiles, `STATUS.md`, `PHASE-PLAN.md`, `DECISION-LOG.md`
- Workspace `.cursor/rules` as shipped to each contestant

## What’s excluded

- `node_modules`, `.next`, build outputs
- `.env` / secrets (only `.env.example` if present)
- `.codegraph` indexes
- The later Test 2/3 bugged + fixed clones (those are not these trees)

## How to run (rough)

Each arm is a Next.js app; ports used in the experiment were **3101 (Fable)** and **3102 (Sol)**. Exact commands are in each tree’s `STATUS.md` / `README.md`. Expect to `npm install`, set env from `.env.example`, and seed as documented there.

## Token usage

Per-build totals recovered from Cursor’s 2026-07-15 usage CSV, aligned to git timestamps: [../docs/token-usage-from-csv.md](../docs/token-usage-from-csv.md).
