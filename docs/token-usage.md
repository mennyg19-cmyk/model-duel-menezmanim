# Token usage — what we have (and don’t)

## Short answer

We now have **windowed totals from Cursor’s 2026-07-15 usage CSV**, aligned to experiment git timestamps.

**See the full breakdown:** [`token-usage-from-csv.md`](token-usage-from-csv.md)

### Test 1 build only (scaffold → blind finals)

| Builder | Total tokens (incl. cache) | Output tokens | Cursor $ | CSV events |
|---|---:|---:|---:|---:|
| Fable high | 7.7M | 76k | **~$14** | 1 (aggregated) |
| Sol high | 73.4M | 179k | **~$49** | 6 |

Sol ≈ **9.5×** Fable on Total, ≈ **2.3×** on Output, ≈ **3.5×** on Cursor dollars — even though Sol’s **per-token** list price is lower (~$5/$30 vs Fable ~$10/$50 per MTok).

Volume beat the unit discount on this job.

## Caveats (still true)

- Cursor **Total** is inflated by cache reads; prefer **Output** for “how much the model wrote.”
- Fable’s whole rebuild is **one CSV line** — coarse billing, not one phase.
- Orchestrator + reviewers are separate (and large).
- Same-day Opus / medium-tier rows were excluded from contestant build totals.

## If we re-run

Log per spawn: model slug, phase, start/end time, plus paste usage for that window — or use streaming JSON where available. Don’t rely on a single daily CSV alone.
