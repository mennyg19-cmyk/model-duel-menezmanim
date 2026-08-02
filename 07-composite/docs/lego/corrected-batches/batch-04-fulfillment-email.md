# Batch 04 — Fulfillment & Email (R-072..R-090): Corrected Re-Grade

**Corrective re-grade note:** arm-01, arm-03, and arm-04 were re-graded from scratch against their true, recovered codebases (`/tmp/tomchei-work/true-arms/arm-0{1,3,4}/`). arm-02, arm-05, and arm-06 scores are copied through byte-for-byte unchanged from the original Pass A file, per instructions — including cases where arm-02's note now reads oddly (e.g. "byte-identical to arm-01") because arm-01's real code no longer matches what that note describes. That mismatch is expected and intentional: arm-02's score itself was already correct, only its stale note is a leftover of the bug.

## Changes vs original Pass A

**4 of 19 items had their winner change:**

| Item | Old winner | New winner | Why |
|---|---|---|---|
| R-076 (Greeting cards print view per route) | arm-06 | **arm-04** | arm-04's true code has a fully UI-reachable "Print this run's cards" link rendering real per-route card artifacts (score 9). arm-01's real cards are a generic, non-route-grouped renderer (4, STUB); arm-03 generates a real per-route 5x7 card PDF in the backend but never surfaces it in any admin page (5, STUB) — a dead code path. |
| R-079 (Follow-up call center) | arm-01 | **arm-04** | arm-01's true build has no dedicated follow-up page — the "call center" is a small section tacked onto the bottom of the delivery-operations page, one filter visible at a time (6). arm-03's real `followUpQueue()` backend function is never called from any UI page at all (2, STUB). arm-04 has a real, dedicated `/admin/follow-up` page matching the spec's 3 canonical queues almost exactly (9). |
| R-085 (Email templates + branding) | arm-01 | **arm-04** | arm-01's real Settings > Email page has exactly one branding field ("Sender name") — no reply-to, no footer, no from-address editor, contradicting the old note's claim of a fuller branding form (4). arm-03's templates tab is read-only display only, with no edit form despite a branding-capable backend endpoint (2, STUB). arm-04 has full template CRUD *and* a genuinely complete branding editor (fromName/fromAddress/replyToAddress/logoUrl/accentColor/footerText) — the only arm of the six with real branding UI (9). |
| R-087 (Order lifecycle emails) | arm-01 | **arm-04** | arm-01's real payment-link email is sent only by a daily cron sweep, not triggered at checkout (7). arm-04's `queueOrderConfirmation`/`queuePaymentLink`/`queueRefundNotice` each carry a distinct, well-chosen dedupe key (order id / checkout-session id / refund id) and are called from 4 real call sites — order-service, checkout-service, offline-payments, and the Stripe webhook handler (9), edging out arm-03's also-solid 4-call-site implementation (8). |

**Other notable corrections that did *not* flip the winner** (winner stayed arm-06, but runner-up or mid-table rankings shifted materially):

- **R-081 (Shipment planning + bin packing) — most consequential single finding.** The old (wrong) grading gave arm-04 an 8, describing a real per-axis first-fit-decreasing algorithm. arm-04's *true* code (`lib/shipping/bin-packing.ts`) is a scalar volume/weight-sum selector — its own code comment admits "Volume and weight, not a three-dimensional fit." This is the **exact same disqualifying flaw** that earned arm-05 a THEATER flag and a score of 3 on this item. arm-04 now scores 3/THEATER too. Meanwhile arm-01's true bin-packing is genuinely excellent (real per-axis checks, running per-box capacity, plus a full carrier label lifecycle — quote/buy/void/track/validate-address), keeping it the winner at 9, now tied and pushing arm-03 (also a real per-axis implementation, 9) into runner-up ahead of arm-06.
- **R-082 (Email hub) and R-084 (Subscriber/list management):** arm-01's real email hub turned out to be dramatically thinner than the old grading assumed — it's a single flat page with 3 stacked sections (campaign form, template editor, outbox log), no tabs, and *zero* admin-side list/subscriber management (staff can't create a list or add a member anywhere; only a fixed 3-list dropdown and a customer-facing self-service preferences page exist). Scores dropped from 6→3 and 7→2 respectively, with arm-04 taking over as runner-up in both.
- Across nearly every item in this batch, arm-01's runner-up position (from the old, wrong grading) is now taken over by **arm-04**, whose true code is consistently the strongest or second-strongest of the three re-graded arms — except on bin packing, where it is the weakest.

## Full corrected table

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Note on change |
|---|---|---|---|---|---|---|---|---|---|---|
| R-072 | Fulfillment channel dashboard + bulk status actions | 7 | 8 | 8 | 9 | 6 | 9 | arm-06 | arm-04 | Winner unchanged (tie w/ arm-06); runner-up moves from arm-01 to arm-04. |
| R-073 | Fulfillment production + savings summaries | 6 | 7 | 5 | 9 | 6 | 9 | arm-06 | arm-04 | Winner unchanged (tie); arm-04's real dollar-savings breakdown pushes it to runner-up. |
| R-074 | Delivery route builder (Mapbox) | 6 | 7 | 4 | 8 | 5 | 8 | arm-06 | arm-04 | Winner unchanged (tie); arm-01 has real Mapbox geocoding + a real map image but zero route optimization. |
| R-075 | Route administration (list/detail/reassign/print) | 7 | 8 | 5 | 9 | 4 | 9 | arm-06 | arm-04 | Winner unchanged (tie); arm-03's reassign-driver control is missing from its UI despite existing in the backend. |
| **R-076** | Greeting cards print view per route | 4 (STUB) | 8 | 5 (STUB) | **9** | 5 | 8 | **arm-04** | arm-06 | **WINNER CHANGED.** arm-04's cards are real and reachable; arm-01's is generic/non-route; arm-03's is a real PDF nobody can reach. |
| R-077 | Driver route list (messenger portal) | 7 | 8 | 6 | 9 | 7 | 9 | arm-06 | arm-04 | Winner unchanged (tie); arm-04's escalating PIN lockout (scrypt, salted, timing-safe) is the strongest security of the batch. |
| R-078 | Driver stop cards + route start/delivery completion | 8 | 8 | 8 | 8 | 7 | 9 | arm-06 | arm-01 | No change — all three re-graded arms landed at 8, coincidentally matching the old (wrong) arm-01 score. |
| **R-079** | Follow-up call center | 6 | 8 | 2 (STUB) | **9** | 1 (MISSING) | 7 | **arm-04** | arm-02 | **WINNER CHANGED.** arm-04 has a real dedicated page; arm-01's is a buried section; arm-03's backend function has no UI at all. |
| R-080 | Automated payment + pickup follow-up (cron) | 8 | 8 | 8 | 8 | 4 | 9 | arm-06 | arm-01 | No change — all three re-graded arms are solid, comparable crons. |
| R-081 | Shipment planning + bin packing | 9 | 8 | 9 | 3 (THEATER) | 3 (THEATER) | 8 | arm-01 | arm-03 | Winner unchanged; **arm-04 collapses from a wrongly-credited 8 to 3/THEATER** — same flaw as arm-05. Runner-up moves from arm-06 to arm-03. |
| R-082 | Email hub (5-tab management) | 3 (STUB) | 6 | 8 | 8 | 2 (MISSING/STUB) | 9 | arm-06 | arm-04 | Winner unchanged; arm-01's real hub has no tabs and no lists/subscribers UI at all — dropped from a wrongly-credited 6 to 3. |
| R-083 | Campaign builder + send | 6 | 8 | 8 | 9 | 6 | 9 | arm-06 | arm-04 | Winner unchanged (tie); arm-01's real flow has no preview feature. |
| R-084 | Subscriber + mailing-list management | 2 (STUB) | 7 | 5 | 8 | 2 (STUB) | 9 | arm-06 | arm-04 | Winner unchanged; arm-01 has zero admin-side list/subscriber management — dropped from a wrongly-credited 7 to 2. |
| **R-085** | Email templates + branding | 4 | 8 | 2 (STUB) | **9** | 2 (STUB) | 7 | **arm-04** | arm-02 | **WINNER CHANGED.** arm-04 is the only arm with a real branding editor (from/reply-to/logo/accent/footer) plus full template CRUD. |
| R-086 | Triggered/transactional emails + overrides + idempotency | 6 | 8 | 5 | 9 | 6 | 9 | arm-06 | arm-04 | Winner unchanged (tie); arm-03's override system exists in the backend but is unreachable from its read-only Triggered tab. |
| **R-087** | Order lifecycle emails (confirmation/payment link/refund) | 7 | 8 | 8 | **9** | 7 | 8 | **arm-04** | arm-03 | **WINNER CHANGED.** arm-04 has 4 real call sites with well-designed per-event dedupe keys, edging out arm-03's also-solid 4-site implementation. |
| R-088 | Transactional outbox + retrying sweeper | 8 | 8 | 9 | 9 | 7 | 9 | arm-06 | arm-03 | Winner unchanged (3-way tie); arm-03's combined email+SMS dispatch is a genuine differentiator, taking runner-up from arm-01. |
| R-089 | Email campaign lifecycle UI (draft/sent lists) | 5 | 8 | 7 | 8 | 5 | 9 | arm-06 | arm-04 | Winner unchanged; runner-up moves from arm-01 to arm-04. |
| R-090 | Email test sender | 6 | 8 | 8 | 8 | 7 | 9 | arm-06 | arm-04 | Winner unchanged; arm-01's real test-sender only queues ("Email test queued"), it isn't synchronous. |

## Score detail (arm-01 / arm-03 / arm-04 only, with flags)

### R-072 — Fulfillment channel dashboard + bulk status actions
- **arm-01: 7.** Channel cards show package/gift counts and a grouping-savings heuristic but no per-stage breakdown grid; `FulfillmentBoard` (create-missing, bulk stage-select+apply with conflict reporting, split, regroup, print-batch/reprint) is broad and functional. — `app/(admin)/admin/fulfillment/page.tsx`; `components/fulfillment-board.tsx`
- **arm-03: 8.** Channel list shows real per-stage counts (NEW/PRINTED/PACKED/SENT/PICKED_UP) matching the spec's grid closely; dashboard's own bulk buttons cover only 3 of 4 target stages, but split/regroup/print-batch live on companion packages/print-batches pages. — `components/admin/fulfillment-dashboard.tsx`
- **arm-04: 9.** Full per-channel table with per-stage counts, a rich `actions.ts` covering build/reprint/advance/bulk-stage/split/move plus label buy/void/tracking/address-validate — the most operationally complete fulfillment surface of the six. — `lib/fulfillment/channel-summary.ts`; `app/(admin)/admin/fulfillment/actions.ts`

### R-073 — Fulfillment production + savings summaries
- **arm-01: 6.** `groupedSavings` is a gift-count heuristic (`max(0, giftCount-1)`), not a real dollar figure; no dedicated open/shipped production-counts card.
- **arm-03: 5.** `savings.note` exists but isn't populated with real numbers, and `printedAwaitingShip` is a plain count, not a dollar figure.
- **arm-04: 9.** `readChannelSummaries()` computes actual dollar savings from real charged shipping fees with a genuine per-channel charges/savings breakdown, plus a print-batches list.

### R-074 — Delivery route builder (Mapbox)
- **arm-01: 6.** Real Mapbox geocoding + a real Mapbox static map image on the route-detail page, but stop ORDER is just input order — zero optimization algorithm.
- **arm-03: 4.** Genuine nearest-neighbor ordering via haversine distance, but geocoding is fully fake (deterministic ZIP-offset) and there's no map visualization.
- **arm-04: 8.** Real Mapbox v6 geocoding (with offline fallback) + genuine nearest-neighbor `orderStops()` from a configurable origin; no visual map.

### R-075 — Route administration (list/detail/reassign/print)
- **arm-01: 7.** Single delivery-operations page merges builder + reassignment with a live Mapbox map and reroute suggestions; no separate routes list.
- **arm-03: 5.** Basic list (manual comma-separated package IDs) + detail page for magic links and reroutes, but reassign-driver control is missing from the UI despite existing in the backend.
- **arm-04: 9.** Full list + detail admin with optimistic-concurrency driver reassignment, magic-link management, per-stop office-delivered overrides, and confirmed reroute-onto-route.

### R-076 — Greeting cards print view per route
- **arm-01: 4 (STUB).** Generic text-line renderer used for every artifact type, grouped by channel/filing-group not by route; cards only appear inline on a browser print view.
- **arm-03: 5 (STUB).** `printRoute()` genuinely generates a dedicated 5x7 card PDF per route, but no admin UI ever surfaces or downloads it — dead code.
- **arm-04: 9.** "Print this run's cards" link fully reachable via the route-detail page, rendering real per-route card artifacts.

### R-077 — Driver route list (messenger portal)
- **arm-01: 7.** `/driver/routes/[token]` magic-link portal is functional (PIN gate, stop list); the logged-in `/driver` home is a stale stub. 5-fail/15-minute PIN lockout.
- **arm-03: 6.** `/d/[token]` portal is fully functional with PIN throttling; the staff `/driver` page repeats the same stale stub copy.
- **arm-04: 9.** Functional `/driver` home + `/drive/[token]` app; escalating PIN lockout (10m→…→12h) with scrypt hashing, salting, timing-safe comparison.

### R-078 — Driver stop cards + route start/delivery completion
- **arm-01: 8.** `components/driver-route.tsx`: PIN entry, route start, Google Maps deep links, Delivered taps.
- **arm-03: 8.** `driver-client.tsx` mirrors the same start→notify→deliver→complete flow.
- **arm-04: 8.** `/drive/[token]` app with signed session cookie, stop list, Maps links, delivered action.

### R-079 — Follow-up call center
- **arm-01: 6.** No dedicated page — a "Follow-up call center" section is folded into the bottom of `/admin/delivery`, with 3 real link-toggled filters (bulk delivery / unclaimed pickup / needs payment), one visible at a time.
- **arm-03: 2 (STUB).** `followUpQueue()` implements exactly the spec's 3 filters and has a live API route, but no admin page anywhere calls it — confirmed by scanning every `admin/**/page.tsx`.
- **arm-04: 9.** Dedicated `/admin/follow-up` page with `FOLLOW_UP_REASONS` covering unpaid / pickup_unclaimed / delivery_pending — the closest match to the spec of any arm.

### R-080 — Automated payment + pickup follow-up (cron)
- **arm-01: 8.** Payment-reminders cron reminds every FINALIZED order with an open balance, day-deduped; separate pickup-expiry cron.
- **arm-03: 8.** `runPaymentReminderCron()`/`runPickupExpiryCron()`, day-deduped, logged to `CronRunLog`.
- **arm-04: 8.** Configurable-cadence sweep keyed off a `followUpDays` setting, plus a separate pickup-expiry sweep.

### R-081 — Shipment planning + bin packing
- **arm-01: 9.** `planShipment()`: real first-fit-decreasing bin packing with genuine per-axis dimension checks and running per-box volume/weight capacity, plus a full carrier integration (quote/buy/void label, refresh tracking, validate address). Hard-throws when nothing fits.
- **arm-03: 9.** `packItems()`: real per-axis FFD bin packing with running per-box capacity; gracefully reports `unpackedItemIds` instead of throwing.
- **arm-04: 3 (THEATER).** `planParcels()` is a scalar volume/weight-sum selector — its own comment admits "Volume and weight, not a three-dimensional fit" — the identical flaw that disqualified arm-05.

### R-082 — Email hub (5-tab management)
- **arm-01: 3 (STUB).** Single flat page, 3 stacked sections, no tabs, no lists/subscribers UI anywhere.
- **arm-03: 8.** Genuinely tabbed (Campaigns/Subscribers/Lists/Templates/Triggered) matching the spec's structure closely; campaigns fully functional, lists can be created.
- **arm-04: 8.** 4-tab hub backed by fully separate, fully-functional dedicated pages per concern.

### R-083 — Campaign builder + send
- **arm-01: 6.** Create/test-send/send work; no preview.
- **arm-03: 8.** Create/preview/test-send/send all wired end to end.
- **arm-04: 9.** Dedicated detail page: draft, live preview, test-send, idempotent send/re-run.

### R-084 — Subscriber + mailing-list management
- **arm-01: 2 (STUB).** No admin list/subscriber management at all; only a dropdown of 3 hard-seeded lists.
- **arm-03: 5.** Can create lists and view subscribers read-only; `add_list_members` exists in the API but is never called from the UI.
- **arm-04: 8.** Real, reachable create-list + add/remove-member-by-email CRUD.

### R-085 — Email templates + branding
- **arm-01: 4.** Real per-template subject/body editing + enable/disable + test-send, but branding is just a single "Sender name" field.
- **arm-03: 2 (STUB).** Templates tab is read-only display only; branding-capable `upsert_template` endpoint exists but is never called.
- **arm-04: 9.** Full template CRUD + a genuinely complete branding editor (fromName/fromAddress/replyToAddress/logoUrl/accentColor/footerText) — the only arm of six with real branding UI.

### R-086 — Triggered/transactional emails + overrides + idempotency
- **arm-01: 6.** Templates are edited directly as DB rows (no default/override layering); idempotent via caller-supplied key.
- **arm-03: 5.** Real `set_triggered` override endpoint exists, but the Triggered tab is read-only — overrides can never actually be toggled by staff.
- **arm-04: 9.** `TRIGGERED_DEFAULTS` registry with a fully-wired enable/disable + subject/body override UI.

### R-087 — Order lifecycle emails (confirmation/payment link/refund)
- **arm-01: 7.** Confirmation enqueued in-transaction; refund dedupe correctly handles partial refunds; payment-link is cron-only, not checkout-triggered.
- **arm-03: 8.** 4 real call sites (checkout/session.ts, payments/offline.ts, payments/webhook.ts, ops/refunds.ts), each dedupe-keyed.
- **arm-04: 9.** 4 real call sites with distinct, well-chosen dedupe keys per event type (order id / session id / refund id).

### R-088 — Transactional outbox + retrying sweeper
- **arm-01: 8.** Idempotent enqueue, row-locked claim with stale-claim reclaim, backoff up to 3 attempts.
- **arm-03: 9.** Transactional claims, explicit state machine, 5-attempt backoff, full audit log, combined email+SMS dispatch.
- **arm-04: 9.** Transactional claim, 5-attempt backoff, detailed audit trail, graceful blocking when no sender configured.

### R-089 — Email campaign lifecycle UI (draft/sent lists)
- **arm-01: 5.** List with Test/Send buttons; no preview, no per-campaign recipient detail.
- **arm-03: 7.** List + select-to-preview/test-send/send; no per-recipient detail table.
- **arm-04: 8.** Dedicated detail page with idempotent re-send + a separate message-level Outbox page.

### R-090 — Email test sender
- **arm-01: 6.** POSTs a transactional test through the normal enqueue path; reports only "Email test queued" — not synchronous.
- **arm-03: 8.** `sendTestEmail()` runs synchronously and returns a real captured/providerId outcome.
- **arm-04: 8.** Dedicated email-test endpoint running through the real dispatch path.
