# Batch 08 — Integrations (Corrective Re-Grade)

**Scope:** R-166 through R-187 (22 items). arm-01, arm-03, and arm-04 were re-graded from scratch against their TRUE recovered codebases (`/tmp/tomchei-work/true-arms/arm-0{1,3,4}/`), after discovering the original Pass A had silently graded arm-02's code under all three of those labels. arm-02, arm-05, and arm-06 scores are carried through byte-for-byte unchanged from the original `batch-08-integrations.json`.

## Changes vs original Pass A

**11 of 22 items changed winner** as a direct result of grading the true codebases. All 11 changes flow from the same root cause: the old data credited "arm-01" with arm-02's very strong, tightly-scoped Stripe/Shippo/media modules. Once arm-01's *own* (simpler, slightly less defensive) code was substituted in, arm-04's true codebase — which turns out to be exceptionally rigorous across payments, shipping, and geocoding, with heavy inline documentation of *why* each safety mechanism exists — takes over as the strongest arm for most of this batch.

| Item | Old winner | New winner | Why it changed |
|---|---|---|---|
| R-166 | arm-01 | **arm-04** | True arm-04 (`lib/payments/stripe-api.ts` + `local-gateway.ts`/`local-hosted.ts`) fails closed on a missing Stripe key and its offline stand-in posts a *signed* event through the real webhook route, exercising the same idempotency/signature path as production. True arm-01 is solid (9) but no longer uniquely best. |
| R-167 | arm-01 | **arm-04** | True arm-04's `webhook-service.ts` explicitly releases its idempotency claim on handler failure so a Stripe retry actually redoes the work — a subtlety not matched elsewhere. |
| R-168 | arm-01 | **arm-04** | `syncRefund()` books only the outstanding delta between Stripe's cumulative `amount_refunded` and what's already recorded — correct under repeated partial refunds without an embedded-list dependency. |
| R-170 | arm-01 | **arm-04** | True arm-01's `lib/stripe.ts` is a bare memoized client with no fail-closed guard of its own (the guard lives in the caller). arm-04's `getPaymentGateway()` is a real interface-backed singleton that fails closed itself. |
| R-173 | arm-01 | **arm-04** | True arm-04's Shippo wrapper validates every carrier response with zod; arm-01's is fetch-based without response-schema validation. Both are otherwise comparable. |
| R-174 | arm-01 | **arm-04** | arm-04's `combineParcelRates()` requires a service to cover *every* parcel in a multi-box shipment before it's eligible — a real correctness check the simpler per-parcel selectors (including true arm-01's) don't make. |
| R-175 | arm-01 | **arm-04** | arm-04 voids *all* already-bought labels for a box if a later parcel in the same shipment fails to buy — the most complete multi-parcel compensation logic found in any arm. |
| R-176 | arm-01 | **arm-04** | arm-04's tracking refresh has an explicit `allowTerminal` flag so tracking keeps working once the carrier already has the package, unlike buy/void which must stop; true arm-01 doesn't make this distinction. |
| R-177 | arm-01 | **arm-04** | Same shipping-module family as R-173/175/176 — arm-04's zod-validated `validateAddress()` edges out arm-01's functionally-equivalent but unvalidated version. |
| R-179 | arm-01 | **arm-04** | Both true arm-01 and arm-04 implement real Mapbox calls with deterministic offline fallbacks (arm-03, by contrast, has NO live Mapbox call at all — fixture-only, correctly downgraded to MISSING). arm-04 additionally distinguishes a genuine API *error* from a legitimate *not-found*, which arm-01 doesn't. |
| R-187 | arm-06 | **arm-03** | True arm-03's health route calls `getEnv()` *inside the request handler* on every call, not only relying on module-load-time validation as a side effect the way arm-01/02/04/06 all do — the most request-time-explicit of the six. |

The other 11 items (R-169, R-171, R-172, R-178, R-180, R-181, R-182, R-183, R-184, R-185, R-186) keep their original winning arm label — either because arm-06 (or arm-01, for R-181, where true arm-01's outbox sweep turns out to be excellent on its own merits) was already legitimately the strongest before the correction, or because the true arm-01/03/04 code, once fairly graded, still lands below the existing winner.

## Full scorecard

| ID | Item | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up |
|---|---|---|---|---|---|---|---|---|---|
| R-166 | Stripe hosted checkout session | 9 | 9 | 7 | 9 | 6 | 9 | **arm-04** | arm-01 |
| R-167 | Stripe payment webhook processing | 9 | 9 | 9 | 9 | 7 | 9 | **arm-04** | arm-06 |
| R-168 | Stripe refund synchronization | 9 | 9 | 9 | 9 | 6 | 8 | **arm-04** | arm-03 |
| R-169 | Stripe automatic safety refunds | 9 | 9 | 8 | 9 | 7 | 9 | **arm-06** | arm-04 |
| R-170 | Shared Stripe server client (lazy singleton) | 7 | 9 | 8 | 9 | 3 STUB | 9 | **arm-04** | arm-06 |
| R-171 | Resend email sender (SDK isolated) | 8 | 9 | 8 | 9 | 8 | 9 | **arm-06** | arm-04 |
| R-172 | Email log purge cron | 8 | 8 | 7 | 9 | 7 | 9 | **arm-06** | arm-04 |
| R-173 | Shippo SDK wrapper (rate/buy/void/track/validate) | 9 | 9 | 9 | 9 | 8 | 5 BROKEN | **arm-04** | arm-03 |
| R-174 | Shippo rate lookup + cheapest-rate selection | 9 | 9 | 9 | 9 | 8 | 1 BROKEN | **arm-04** | arm-01 |
| R-175 | Shippo label failure compensation | 9 | 9 | 9 | 9 | 8 | 2 BROKEN | **arm-04** | arm-01 |
| R-176 | Shippo tracking refresh | 8 | 8 | 8 | 9 | 7 | 2 BROKEN | **arm-04** | arm-01 |
| R-177 | Shippo address validation | 8 | 8 | 8 | 9 | 7 | 3 BROKEN | **arm-04** | arm-03 |
| R-178 | Idempotent email sending + test capture | 9 | 9 | 9 | 9 | 8 | 9 | **arm-06** | arm-04 |
| R-179 | Mapbox geocoding with cache | 9 | 8 | 3 MISSING | 9 | 6 | 5 | **arm-04** | arm-01 |
| R-180 | Vercel Blob media storage | 9 | 9 | 3 MISSING | 9 | 7 | 9 | **arm-06** | arm-04 |
| R-181 | Secured outbox integration sweep | 9 | 9 | 9 | 9 | 8 | 9 | **arm-01** | arm-06 |
| R-182 | Secured pickup-expiry operation | 9 | 9 | 9 | 9 | 8 | 9 | **arm-06** | arm-04 |
| R-183 | Typed optional-provider handling (Shippo/Mapbox) | 6 | 9 | 3 STUB | 9 | 3 STUB | 9 | **arm-06** | arm-04 |
| R-184 | UPS direct credentials declared, not implemented | 5 | 8 | 10 | 7 | 5 | 10 | **arm-06** | arm-03 |
| R-185 | Vercel Cron jobs (5) with secret auth | 8 | 8 | 8 | 8 | 8 | 8 | **arm-06** | arm-01 |
| R-186 | Nexternal legacy import pipeline + order-number repair | 8 | 9 | 8 | 9 | 1 MISSING | 9 | **arm-06** | arm-04 |
| R-187 | Health check (DB + env validation) | 6 | 6 | 8 | 7 | 5 | 7 | **arm-03** | arm-04 |

## Notes on the re-grade

- **arm-03's Mapbox and Vercel Blob gaps are real, not artifacts of mislabeling.** Its true `lib/address/geocode.ts` is explicitly commented "Deterministic offline geocoder (no external provider in P4)" with zero live Mapbox calls anywhere in the tree, and its true `lib/storefront/media.ts` is local-disk-only with an unactioned "swap to `@vercel/blob.put`" TODO. Both are correctly downgraded to `MISSING` (R-179, R-180) — these are the same class of finding the original Pass A used to flag arm-05's real gaps, just previously hidden behind arm-02's substituted code.
- **arm-03 independently converged on the same "declared, not implemented" UPS design as arm-06** (R-184): distinct `UPS_CLIENT_ID`/`UPS_CLIENT_SECRET` fields, explicitly commented as declaration-only and tagged to R-184, tied at the top score of 10. True arm-01 and arm-04, by contrast, only overload the working Shippo carrier-account slot, one of them (arm-04) at least documenting the conflation.
- **arm-04's true codebase is a standout across nearly the entire Stripe/Shippo/media stack**, consistently pairing a working feature with an explicit, commented rationale for *why* a particular ordering or check exists (e.g., cancel-before-refund in the safety-refund path, box-level label-void-all on multi-parcel purchase failure, error-vs-not-found disambiguation in geocoding). This is what drives 10 of the 11 winner changes.
- **arm-01's true codebase is competent and safe everywhere it was graded**, but it isn't the standout it was previously credited as being — most of its true modules (Stripe client, Shippo wrapper, tracking refresh) are simpler, single-mode implementations that score just below arm-04's more defensively engineered equivalents. Its one true win in this batch, R-181 (outbox sweep), is earned on its own merits: a single outbox drives both email and SMS with `FOR UPDATE SKIP LOCKED` claiming, lease-based stale-claim recovery, and campaign-completion tracking — the broadest design of the six arms for that item.

## Report

- **11 of 22 items (50%) had their winner change** as a direct result of grading arm-01/03/04's true codebases instead of the substituted arm-02 code.
- **Most interesting/impactful finding:** the correction reveals that arm-04 — previously invisible in this batch's winner column entirely — is actually the strongest arm for the Stripe/Shippo/media integration surface, winning 10 of the 22 items on the strength of consistently more defensive, well-reasoned implementations (fail-closed singletons, claim-and-release idempotency, multi-parcel-aware shipping compensation, zod-validated carrier responses, and an error-vs-not-found-aware geocoder). Meanwhile, the re-grade also confirms that arm-03's true build has two genuine, non-cosmetic gaps — no live Mapbox integration and no Vercel Blob integration at all, both previously masked by the mislabeling — while ironically also containing the batch's single most literal, best-in-class match to the "UPS declared but not implemented" requirement (R-184), tying arm-06 at a perfect 10. Arm-01's true build turns out to be solid but unremarkable across most of this batch, its one standout being a genuinely broad, dual-channel (email+SMS) outbox sweep implementation that holds up as the best of the six even under honest scrutiny.
