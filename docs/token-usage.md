# Token usage — what we have (and don’t)

## Short answer

**We do not have reliable per-build token totals for Fable vs Sol from this experiment.**

The orchestrator never recorded input/output tokens per contestant spawn. Cursor’s agent transcripts for this run also don’t store token counters in the JSONL we kept. So there is no number we can honestly put next to “Fable build cost X tokens / Sol build cost Y tokens” without new data from Cursor’s usage dashboard.

## What Cursor can give you

1. Open **https://cursor.com/dashboard/usage**
2. Export CSV for **2026-07-15** (experiment day)
3. Filter rows by model:
   - Fable arm → slug containing `fable` (or the display name Cursor used that day)
   - Sol arm → slug containing `sol` / `gpt-5.6`
4. Sum `input_tokens` + `output_tokens` (+ cache columns if present)

**Caveats when attributing:**

- Mid-build **reviewers** (Terra, Sonnet) and the **orchestrator** (Grok) also burned tokens that day — don’t dump the whole day on the contestants.
- Sol had a **fresh spawn mid Phase 7** after `resource_exhausted` — that may appear as multiple sessions.
- Test 2 detection + Test 3 fix runs were **additional** Fable/Sol usage after Test 1.
- Dashboard rows are per request / turn, not labeled “rebuild-a Phase 7,” so matching is by **time window + model**, not arm folder.

If you export that CSV into this repo (don’t commit secrets/session cookies), we can help sum Test-1-only windows.

## Weak size proxies (not tokens)

Rough tree size of the published P12 finals (source only, no `node_modules`):

| Arm | Files | Bytes (approx) |
|---|---:|---:|
| Fable final | ~287 | ~1.6 MB |
| Sol final | ~243 | ~1.5 MB |

File/byte counts measure **code shipped**, not **tokens spent thinking**. A smaller tree can still cost more tokens (more retries, longer context, more tool loops).

## If we re-run

Log per spawn: model slug, phase, start/end time, and paste Cursor usage for that window — or use headless/CLI streaming JSON where available. That is the only clean way to publish per-build token tables next time.
