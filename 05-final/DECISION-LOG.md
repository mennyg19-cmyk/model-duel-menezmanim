# Experiment Decision Log

Newest first.

## [2026-07-15] Orchestrator and model tiers
**What I had to decide:** Who runs the experiment; which contestant/reviewer slugs.
**Options I considered:** Fable/Sol as orchestrator (biased); Composer 2.5; Grok 4.5 high.
**What I chose:** Orchestrator = cursor-grok-4.5-high. Contestants = claude-fable-5-thinking-high + gpt-5.6-sol-high. Phase reviewers = gpt-5.6-terra-high (reviews A/Fable) + claude-sonnet-5-thinking-high (reviews B/Sol).
**Why:** Third-party orchestrator avoids self-scoring. Matched high tiers for contestants. Everyday cross-family for mid-build reviews per plan.
**Status:** DECIDED

## [2026-07-15] Git ownership
**What I had to decide:** Who commits in a shared parent repo with two parallel builds.
**Options I considered:** Each contestant commits; orchestrator only; separate repos.
**What I chose:** Contestants never run git. Orchestrator commits+pushes `_experiment/` after each gate.
**Why:** Two agents on one index would conflict; phone visibility needs reliable pushes.
**Status:** DECIDED
