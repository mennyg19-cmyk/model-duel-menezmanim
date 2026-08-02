# Batch 02 — Checkout flow + account/order lifecycle (R-032 … R-048)

**Corrective re-grade.** arm-01, arm-03, and arm-04 were re-scored from their
TRUE recovered codebases (`/tmp/tomchei-work/true-arms/arm-0{1,3,4}/`), not
the `arms/arm-0N/workspace` clone-cluster path (which silently held arm-02's
code under their names). arm-02, arm-05, arm-06 scores are copied through
byte-for-byte unchanged from the original Pass A file.

## Changes vs original Pass A

**5 of 17 items changed winner.** All five trace back to two genuine,
evidence-based findings in the true codebases — not coin-flip tie-breaks:

| Item | Old winner | New winner | Why |
|---|---|---|---|
| [R-034](#r-034) | arm-01 | **arm-04** | arm-04's `findCheckoutConflicts()` shares its stock-demand-counting function with `finalizeOrder()`'s inventory reservation — a checkout-time warning can never silently become a finalize-time shortfall. No other arm shares that function between preview and commit. |
| [R-043](#r-043) | arm-01 | **arm-04** | arm-01's TRUE `/account/addresses` page is genuinely **read-only** (no add/edit/delete UI) — the CRUD API only gets called from the checkout recipient dialog, never from the account page. The old (mislabeled) grading assumed full `AddressesManager` parity that the true build doesn't have. arm-04 has real add/edit/archive on the page itself. |
| [R-044](#r-044) | arm-01 | **arm-04** | arm-01's real production finalize path (Stripe webhook → `commitStripePayment`) **bypasses its own tested state-machine module entirely**, writing `status: 'FINALIZED'` directly instead of calling `assertOrderTransition()`. This is the *exact* architectural defect the original Pass A specifically penalized arm-05 for — it turns out arm-01's true build has the same flaw. arm-04's state machine (with a richer DRAFT/PLACED/CANCELLED/IN_FULFILLMENT/COMPLETED model) is used everywhere, with by far the most test coverage of the six arms. |
| [R-045](#r-045) | arm-01 | **arm-04** | Same root cause as R-044: arm-01's real finalize logic is a second, duplicated inline implementation inside `commitStripePayment()`; the tested, exported `finalizeOrder()` in `domain/order-engine.ts` is dead code in production (only called from test files and a smoke script). arm-04's `finalizeOrder()` is the single, well-documented, heavily-tested implementation used by both checkout and POS. |
| [R-047](#r-047) | arm-01 | **arm-04** | arm-04's draft reference is Crockford base32 **plus a checksum plus a spoken-letter-confusion correction table** (O→0, I/L→1) — objectively the most capable design of the six. arm-01's true code turned out to have only a plain zero-padded sequential number (`D-00000042`), not the "TOMCHEI D-XXXXXXXX" bank-transfer template the old (mislabeled) grading credited it with — that richer format belongs to arm-02's actual build. |

Two more items are worth flagging even though the **winner** didn't change:

- **R-036** (payment recalculation): winner stays arm-06, but the **runner-up**
  moves from arm-01 to arm-04 — arm-04's `recomputeOrderPaymentStatus()` takes
  a `SELECT ... FOR UPDATE` row lock before recounting, the most
  concurrency-rigorous of the six.
- **R-038** (account dashboard auth) and **R-040** (continue/pay/cancel a
  draft): arm-03's true build has real, previously-unknown weaknesses — a
  client-side-fetch auth check that mirrors arm-05's known flaw (R-038), and a
  literal disabled `"Pay (P5)"` stub button on the dashboard (R-040) — but in
  both cases arm-01/02/04/06 were already tied at the top score, so the winner
  doesn't move.

The remaining 10 items kept the same winner because arm-01/03/04's true
implementations turned out to be genuinely competitive (often part of a 4-6
way tie at the top score) — the original grading's *scores* were often
accidentally still reasonable even though they described the wrong code,
simply because all six arms independently built comparably solid versions of
these particular features.

---

## R-032 — Fulfillment/shipping selection + rate resolution + rules

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Real margin engine (shipping.ts/fulfillment-fees.ts), charge-highest-buy-cheapest, unit-tested. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01 (old evidence). |
| arm-03 | 9 | — | Independent build: margin.ts + bin-packing.ts + live Shippo resolution + zip blocking + Purim-day gating. |
| arm-04 | 9 | — | Multi-carton box-combination logic (combineParcelRates/planMargin) — more elaborate than the rest. |
| arm-05 | 6 | — | No live per-recipient rate preview before submit; blocked zips not visually disabled. |
| arm-06 | 9 | — | Live per-recipient Shippo quotes inline in the fulfillment dropdown, disabled state for blocked zips. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change — near 5-way tie, kept existing pick)*

## R-033 — Card + offline checkout

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Hosted Stripe + staff-only cash/check/comp with audit trail + recalculatePaymentStatus in-transaction. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 9 | — | Hosted session + postOfflinePayment/voidPayment with UNPAID/PARTIAL/PAID/OVERPAID and auto PLACED→PAID transition + email. |
| arm-04 | 9 | — | Distinct staff-gated post/void/**refund** operations — the most complete offline-payment surface. |
| arm-05 | 7 | — | Binary POSTED/VOIDED status only, no PARTIAL. |
| arm-06 | 9 | — | postPaymentTx/voidPaymentTx with full PARTIAL/PAID/OVERPAID/UNPAID recompute. |

**Winner: arm-06** · Runner-up: arm-01 · *(no change)*

## R-034 — Checkout stock + price validation

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Re-derives priced cart/fees fresh from DB every call; structured conflict on mismatch. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 9 | — | Fully-typed 8-way CheckoutConflict union — most granular taxonomy of the six. |
| arm-04 | **10** | — | **Shares its stock-counting function with finalize's inventory reservation** — checkout preview and commit can never disagree. |
| arm-05 | 7 | — | Correct but conflicts surface as one flat thrown string, not structured. |
| arm-06 | 9 | — | Structured priceConflicts[]/stockIssues[] report, backorder-aware. |

**Winner: arm-04** (changed from arm-01) · Runner-up: arm-01

## R-035 — Checkout success experience

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Dedicated success page, distinct "still confirming" vs paid state, cookie cleared once. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Real still-DRAFT error state, but a failed status fetch fails **open** into "Order placed. Thank you." — a real bug, though it never affects actual order state. |
| arm-04 | 9 | — | Dedicated confirmation page, distinct paid/awaiting/cancelled states server-side. |
| arm-05 | 2 | BROKEN, STUB | success_url points at a route that doesn't exist — 404 in production. |
| arm-06 | 9 | — | Success/processing/discarded states inline on /checkout keyed off order.status. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change — arm-03's newly-found bug doesn't move it off the bottom of the tie)*

## R-036 — Payment recalculation on order changes

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 8 | — | recalculatePaymentStatus() correct and transactional, but no OVERPAID branch. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 9 | — | UNPAID/PARTIAL/PAID/OVERPAID, staff-gated, auto-fires PAID transition + email. |
| arm-04 | 9 | — | `SELECT ... FOR UPDATE` row lock before recounting — most concurrency-rigorous of the six. |
| arm-05 | 5 | — | Status set inline per call site; enum has no PARTIAL at all. |
| arm-06 | 9 | — | Adds OVERPAID beyond the clone cluster's set; standalone exported recompute. |

**Winner: arm-06** · Runner-up: **arm-04** (changed from arm-01 — winner itself unchanged)

## R-037 — Checkout recipient/donation summary + live shipping + guest email + conflict UI

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Live-refetched quote on every choice change, structured conflict banner, guest contact inline. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 6 | — | Fees don't refresh live on fulfillment-method change — only on an explicit Pay/Refresh, visibly stale in between. |
| arm-04 | 9 | — | Server-action re-render pattern eliminates client staleness entirely; explicit isPayable gate with contextual reason. |
| arm-05 | 4 | — | No live fee breakdown pre-submit, no guest email field at all. |
| arm-06 | 9 | — | Live per-recipient Shippo quotes inline, structured price/stock conflict panel. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change — arm-04 is genuinely strong but not clearly ahead of the existing top tie; arm-03's newly-found staleness issue doesn't move the winner)*

## R-038 — Account dashboard + auth-gated nav

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Server-side auth check (no data ever rendered unauthenticated), persistent 3-link nav. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | **4** | — | Client-component page defers auth to a client fetch of /api/account — the same weakness the original grading flagged in arm-05 — and has no persistent account nav at all. |
| arm-04 | 9 | — | `requireSignedInCustomer()` does a real server-side redirect — the strictest gating of the six. |
| arm-05 | 4 | — | Same client-fetch weakness; no sub-nav. |
| arm-06 | 9 | — | `requireCustomer()` server-side, real 4-link nav + sign-out. |

**Winner: arm-01** · Runner-up: arm-06 · *(no winner change — arm-03 drops hard on new evidence, but 01/02/04/06 were already tied at the top)*

## R-039 — Customer order history + detail

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | History embedded in dashboard; ownership-scoped detail page, 404s uniformly. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 9 | — | Dashboard lists history; account/orders/[id] shows full detail breakdown — both genuinely present. |
| arm-04 | 9 | — | Dedicated list + detail pages, ownership enforced via session + query filter. |
| arm-05 | 3 | MISSING | History exists; no order-detail route anywhere in the app. |
| arm-06 | 9 | — | List + recipient-grouped detail with an "unassigned" section, ownership-checked. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change)*

## R-040 — Continue/pay/cancel a draft

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | "Continue and pay" link + CancelDraftButton, both wired end-to-end. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | **6** | **STUB** | Continue/Cancel work, but the dashboard's direct "Pay" action is a literal disabled `<span title="Checkout / pay ships in P5">Pay (P5)</span>` — an announced-but-unshipped feature. Paying is only reachable indirectly via the order builder. |
| arm-04 | 9 | — | cancelDraftAction wired to a real server action; tested including cross-customer rejection. |
| arm-05 | 3 | MISSING, STUB | discardOrder() has zero callers anywhere in the app. |
| arm-06 | 9 | — | Continue/Pay/Cancel all draft-status-gated and wired end-to-end. |

**Winner: arm-01** · Runner-up: arm-06 · *(no winner change — arm-03's disabled Pay stub is a real new finding, but doesn't unseat the existing top tie)*

## R-041 — Repeat a prior customer order

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Full per-line review (same/replacement/unmapped + price-smart fallback), reachable end-to-end. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | BFS chain walk + new draft seeded with candidates; re-queries DB per line. |
| arm-04 | 9 | — | Two-tick confirmation flow (readRepeatReview/confirmRepeat) before anything becomes a draft. |
| arm-05 | 7 | — | BFS chain walk, price-sorted candidates; re-queries DB per line. |
| arm-06 | 9 | — | Chain-resolved vs. price-smart mapping, per-recipient confirmation. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change)*

## R-042 — Customer profile management (ownership-enforced)

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | PATCH reads customer only from session, dedupe-safe phone handling. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 9 | — | PATCH resolves customerId from session only, never trusts a request id. |
| arm-04 | 9 | — | Server action requires signed-in customer, updates the customer object directly. |
| arm-05 | 1 | MISSING | No PATCH/PUT anywhere in the app for a customer's own profile. |
| arm-06 | 9 | — | Session-scoped update, matches clone cluster 1:1. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change)*

## R-043 — Saved-address account view

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | **6** | — | Account page is genuinely **read-only** — no add/edit/delete UI; the CRUD API is only ever called from the checkout recipient dialog, not the account page. Same pattern the original grading flagged in arm-05. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01 (old evidence — arm-02's own true page has full CRUD). |
| arm-03 | 7 | — | Real in-page Edit modal, but no Add or Delete affordance on the page. |
| arm-04 | 8 | — | Add, Edit, and archive (soft-delete) directly on the account page — full CRUD. |
| arm-05 | 6 | — | Read-only list; an edit endpoint exists but isn't surfaced. |
| arm-06 | 8 | — | Add/edit/delete on par with the clone cluster. |

**Winner: arm-04** (changed from arm-01) · Runner-up: arm-06

## R-044 — Order status state machine + transitions

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | **7** | — | assertOrderTransition() is real and tested, but the real Stripe-webhook finalize path **bypasses it entirely**, writing `FINALIZED` directly. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01 (old evidence — arm-02's own true build has no such bypass). |
| arm-03 | 9 | — | assertOrderTransition() is the one implementation, called by finalizeOrder(), which is in turn called from the webhook, offline poster, and ops console — no duplication. |
| arm-04 | 9 | — | Richer 5-state model (DRAFT/PLACED/CANCELLED/IN_FULFILLMENT/COMPLETED), by far the most test coverage of the six. |
| arm-05 | 6 | — | Tested and correct, but finalizeOrder()/discardOrder() are never called from any route — the live path reimplements finalize inline. |
| arm-06 | 9 | — | Same transitions map, finalizeOrderTx is the single real implementation. |

**Winner: arm-04** (changed from arm-01) · Runner-up: arm-03

## R-045 — Order finalization (draft → placed, claims number)

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | **7** | — | Real inline finalize logic in the Stripe webhook handler (row-locked, idempotent) — but it **duplicates** a separate, tested finalizeOrder() that's dead code in production. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01 (old evidence — arm-02's own true build has no such duplication). |
| arm-03 | 9 | — | Single finalizeOrder() implementation, called from webhook, offline poster, and ops console. |
| arm-04 | 9 | — | Extensively documented, single source of truth, used by checkout AND POS, largest finalize test surface of the six. |
| arm-05 | 7 | — | Real inline finalize in the webhook, but duplicates a separate unused finalizeOrder(). |
| arm-06 | 9 | — | Single implementation, called from webhook and POS. |

**Winner: arm-04** (changed from arm-01) · Runner-up: arm-03

## R-046 — Draft discard

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Guarded updateMany, unit-tested, genuinely called from the DELETE route (unlike finalize, not duplicated). |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | Works and is wired to the UI, but is a second, manual status check rather than routing through the shared state-machine module. |
| arm-04 | 9 | — | Single implementation used by both customer and admin discard paths, tests include cross-customer rejection. |
| arm-05 | 2 | STUB, MISSING | Well-tested but has zero callers anywhere in the app. |
| arm-06 | 9 | — | Shared state machine, wired to CancelDraftButton, exercised end-to-end. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change — arm-01's discard, unlike its finalize, was never actually broken)*

## R-047 — Draft reference numbers + wire format

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | **7** | — | Plain zero-padded sequential code (D-00000042), tested and shown to the customer — but simpler than claimed: no bank-transfer template, no unambiguous alphabet, no checksum. |
| arm-02 | 8 | CLONE-TIE | Byte-identical to arm-01 (old evidence — arm-02's own true build has the richer format). |
| arm-03 | 6 | — | D-{year}-{hex-suffix}, real and production-used, but no phone-safety and no checksum — reads as an internal id, not a payment reference. |
| arm-04 | **10** | — | Crockford base32 + mod-32 checksum + spoken-letter-confusion correction table. The most sophisticated implementation of the six. |
| arm-05 | 4 | — | Real reference code, but the schema's "wireFormat" field is repurposed as a generic JSON blob — no actual bank-transfer reference concept. |
| arm-06 | 8 | — | Sequential claim + printed-label "wire format" (packing-slip style), fully wired into finalize. |

**Winner: arm-04** (changed from arm-01) · Runner-up: arm-02

## R-048 — Cross-season product replacement chain

| Arm | Score | Flags | Note |
|---|---|---|---|
| arm-01 | 9 | — | Hop-by-hop walk with cycle guard, lands on first ACTIVE product in target season; feeds both customer and staff repeat. |
| arm-02 | 9 | CLONE-TIE | Byte-identical to arm-01. |
| arm-03 | 7 | — | BFS over replacement edges, visited-set guarded, collects multiple candidates; re-queries DB per level. |
| arm-04 | 9 | — | Slug-based matching, hop-limited chain walk, price-smart fallback suggestions. |
| arm-05 | 7 | — | BFS, visited-set guarded, sorts by price proximity; re-queries DB per level. |
| arm-06 | 9 | — | Walk with visited set + max-hop cap, distinguishes dead end from active landing, admin chain-preview UI. |

**Winner: arm-01** · Runner-up: arm-06 · *(no change)*
