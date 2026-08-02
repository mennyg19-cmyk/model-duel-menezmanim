# Batch 03 — Admin Ops Hub, Catalog Management, Inventory (R-049 .. R-071)
## Corrective re-grade of arm-01, arm-03, arm-04 against their TRUE recovered codebases

This batch corrects a grading-pipeline bug: for arm-01, arm-03, and arm-04, the workspace
used for the original Pass A grading had been silently overwritten with arm-02's code, so
every arm-01/03/04 score on record was actually re-grading arm-02 under the wrong name.
Arm-01/03/04 have been re-graded from scratch against their real, recovered codebases at
`/tmp/tomchei-work/true-arms/{arm-01,arm-03,arm-04}/`. Arm-02, arm-05, and arm-06 scores are
carried through byte-for-byte unchanged from the original batch file.

## Changes vs original Pass A

**4 of 23 items had their winner change** as a direct result of using the true codebases:

- **R-055 (Carrier label creation + voiding)**: winner arm-01 → **arm-04**. Arm-04's true carriage-card
  implementation (`components/admin/carriage-card.tsx`) supports multi-parcel shipments, requires a
  reason on void, and shows the full rate comparison the margin engine chose between — more complete
  than arm-01's real (but simpler) buy/void/track/validate actions.
- **R-062 (Customer directory + search + add)**: winner arm-01 → **arm-04**. Arm-04's true customer
  directory bundles bulk-repeat-history actions and a direct POS link on the same page; arm-01's
  directory is search/paginate only, with "add" split out to POS.
- **R-066 (Add-on catalog management)**: winner arm-01 → **arm-04**. Arm-01's true add-on management
  turned out to be the plain product form with `kind=ADD_ON` and *no* per-product restriction UI at
  all (the original note crediting it with restriction handling was actually describing arm-02).
  Arm-04's true `add-ons/add-on-form.tsx` has a real per-product restriction checkbox list plus full
  post-create editing — the only one of the three with a working restriction editor.
- **R-067 (Media library + photo assignment)**: winner arm-01 → **arm-06** (unchanged from arm-02/05/06's
  perspective, but arm-01 loses the win). Arm-01's true media API is POST-only, Blob-only, and 503s
  with no local-disk fallback when `BLOB_READ_WRITE_TOKEN` is unset — a materially weaker
  implementation than the one previously credited (which was actually arm-02's code). Arm-06 remains
  the strongest overall; arm-04's true media stack (a clean local/Blob storage-driver abstraction with
  magic-byte + extension cross-check validation) is now a close runner-up.

Beyond these 4 outright winner flips, **8 additional items had their runner-up change** because
arm-01/03/04's true scores moved enough to reorder the second-place slot (arm-04 in particular
displaces arm-01 as runner-up in several items: R-049, R-050, R-051, R-052, R-058, R-065, R-071; and
R-064 gains arm-04 as runner-up in place of arm-06). No item's *winner* flipped away from arm-06 —
arm-06 remains the strongest single arm across this batch even after the correction.

Two systemic corrections emerged from reading the true code rather than trusting the old
(mislabeled) notes:

1. **Arm-01's true build is consistently good-but-not-best** — solid, permission-gated, real features
   across the board (8-9 on most items) — but on several items (media library, add-on restrictions,
   carrier labels, customer directory) it is a notch behind arm-04 or arm-06's true implementations,
   not tied with them as the corrupted grading had implied via "CLONE-TIE" flags.
2. **Arm-01's and arm-03's true inventory reserve engines are weaker than previously credited** — arm-01's
   true `domain/inventory.ts` has *zero* release logic anywhere (not even as dead code, contradicting
   the old note), and neither arm-01 nor arm-03 has a commit/decrement step. Arm-04's true reserve engine
   does have a real, exercised `releaseUnits` wired into order cancellation, making it the strongest of
   the three recovered codebases on R-071, though still short of arm-06's full three-stage
   reserve/commit/release engine.

## Item-by-item results

| ID | Name | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Winner | Runner-up | Note on change |
|---|---|---|---|---|---|---|---|---|---|---|
| R-049 | Permission-aware admin dashboard + KPIs | 8 | 8 CLONE-TIE | 7 | 9 | 2 STUB/THEATER | 9 | arm-06 | arm-04 | Runner-up only: arm-04's true dashboard (4 KPIs + graceful degradation) edges out arm-01's true 8. |
| R-050 | "Today" work queue | 7 | 8 CLONE-TIE | 8 | 8 | 3 STUB | 9 | arm-06 | arm-04 | Runner-up only: arm-03/arm-04 true queues (8) both beat arm-01's true single-queue page (7). |
| R-051 | Role + per-user permission enforcement | 8 | 8 CLONE-TIE | 6 | 9 | 3 STUB/BROKEN | 9 | arm-06 | arm-04 | Runner-up only: arm-04's true 19-permission system ties the prior winner; arm-03's true broad `admin.access` gate is a real gap (6). |
| R-052 | Searchable filterable order list | 8 | 8 CLONE-TIE | 7 | 9 | 4 STUB | 9 | arm-06 | arm-04 | Runner-up only: arm-04's true order desk (status counts, page-size) ties arm-06 at 9. |
| R-053 | Full admin order detail + money actions | 9 | 9 CLONE-TIE | 7 | 8 | 2 STUB/MISSING | 9 | arm-01 | arm-06 | No change: arm-01's true order detail is genuinely comprehensive. |
| R-054 | Refunds (incl. Stripe path) | 9 | 9 CLONE-TIE | 6 | 8 | 3 STUB/THEATER | 8 | arm-01 | arm-06 | No change: arm-03's true refund route is real but gated on broad `admin.access` (6). |
| R-055 | Carrier label creation + voiding | 8 | 8 CLONE-TIE | 7 | 9 | 7 | 8 | **arm-04** | arm-06 | **Winner changed** (was arm-01): arm-04's true multi-parcel carriage card with mandatory void-reason and rate comparison is the most complete. |
| R-056 | Printable order packing slips | 8 | 8 CLONE-TIE | 7 | 7 | 7 | 8 | arm-01 | arm-06 | No change: arm-01's true live PDF link on the order page ties arm-06. |
| R-057 | Staff single-order repeat workflow | 8 | 8 CLONE-TIE | 8 | 7 | 5 | 9 | arm-06 | arm-01 | No change: arm-04's true repeat bypasses review by design (7), scoring below arm-01/03's true reviewable flows (8). |
| R-058 | Bulk repeat of customer history | 6 | 8 CLONE-TIE | 6 | 9 | 5 | 9 | arm-06 | arm-04 | Runner-up only: arm-01/03's true bulk-repeat is order-list-scoped, not customer/season-picker-scoped as the requirement implies (6); arm-04's true customer-page bulk-repeat-history is the closest match (9), tying arm-06. |
| R-059 | Staff point of sale | 9 | 9 CLONE-TIE | 9 | 9 | 3 STUB | 9 | arm-01 | arm-06 | No change: all four (arm-01/03/04/06) true POS builds are full carts at parity. |
| R-060 | POS customer lookup + find-or-create | 9 | 9 CLONE-TIE | 8 | 9 | 2 STUB/MISSING | 9 | arm-01 | arm-06 | No change: arm-03's true POS requires a cart line before customer lookup unlocks (8). |
| R-061 | POS checkout | 9 | 9 CLONE-TIE | 8 | 9 | 5 | 9 | arm-01 | arm-06 | No change: arm-03's true offline-checkout route is real but gated on broad `admin.access` (8). |
| R-062 | Customer directory + search + add | 8 | 8 CLONE-TIE | 6 | 9 | 3 STUB/MISSING | 8 | **arm-04** | arm-01 | **Winner changed** (was arm-01): arm-04's true directory bundles bulk-repeat-history + a direct POS link on the same page. |
| R-063 | CSV customer/product import | 8 | 8 CLONE-TIE | 6 | 8 | 6 | 8 | arm-01 | arm-06 | No change: arm-03's true import is a raw CSV textarea with no preview grid (6). |
| R-064 | Customer detail + history | 8 | 8 CLONE-TIE | 7 | 8 | 0 MISSING | 8 | arm-01 | arm-04 | Runner-up only: arm-04's true customer detail has an editable, permission-gated address book, edging out arm-06 for 2nd (both 8). |
| R-065 | Product catalog management | 6 | 6 CLONE-TIE | 7 | 8 | 5 | 8 | arm-06 | arm-04 | Runner-up only: arm-04's true dedicated product detail page ties arm-06 at 8, well above arm-01's true 6. |
| R-066 | Add-on catalog management | 5 | 6 CLONE-TIE | 6 | 9 | 5 | 6 | **arm-04** | arm-06 | **Winner changed** (was arm-01): arm-01's true add-on handling has zero restriction UI; arm-04's true add-on form has a real per-product restriction checkbox editor plus full edit. |
| R-067 | Media library + photo assignment | 6 | 8 CLONE-TIE | 7 | 8 | 4 | 8 | **arm-06** | arm-04 | **Winner changed** (was arm-01): arm-01's true media API is POST-only/Blob-only with no local fallback and 503s without a token — materially weaker than previously credited. |
| R-068 | Inventory overview dashboard | 1 MISSING | 1 MISSING/CLONE-TIE | 1 MISSING | 1 MISSING | 1 MISSING | 1 MISSING | none | none | No change: confirmed independently absent in all six true codebases. |
| R-069 | Production batch planning + history | 0 MISSING | 0 MISSING/CLONE-TIE | 0 MISSING | 0 MISSING | 0 MISSING | 0 MISSING | none | none | No change: no ProductionBatch model/route/UI in any of the six. |
| R-070 | Inventory adjustments + write-offs | 0 MISSING | 0 MISSING/CLONE-TIE | 0 MISSING | 0 MISSING | 0 MISSING | 0 MISSING | none | none | No change: no adjustment/write-off model in any of the six. |
| R-071 | Stock reserve/allocate/release engine | 5 BROKEN | 6 CLONE-TIE | 6 | 7 | 4 BROKEN | 8 | arm-06 | arm-04 | Runner-up only: arm-01's true reserve engine has *no* release logic at all (not even dead code) — weaker than previously credited (5, down from a de facto 6); arm-04's true engine has both reserve and a genuinely wired release (7), taking 2nd place from arm-01. |

## Summary of findings

Re-grading arm-01, arm-03, and arm-04 against their true recovered codebases changed the
winner on 4 of 23 items (R-055, R-062, R-066, R-067) and reshuffled the runner-up on 8 more,
but arm-06 remains the strongest single arm in this batch throughout — no item's winner moved
*away* from arm-06 once the correction was applied, it only moved arm-01 down and, in several
cases, arm-04 up into contention. The single most consequential finding is that arm-01's true
build was being given credit for features it does not actually have: its true add-on management
has no per-product restriction UI at all (R-066), its true media API is Blob-only with no local-disk
fallback and no delete route (R-067), and its true inventory-reserve engine has zero release logic
anywhere in the codebase — not even as unreachable dead code, which is a *materially* different
(weaker) claim than the original note's "release exists but is never invoked" (R-071). Conversely,
arm-04's true codebase is consistently stronger than its corrupted grading suggested — its granular
19-permission system, its multi-parcel carriage/shipping card with mandatory void reasons, its
customer-directory bulk-repeat-history feature, and its per-product add-on restriction editor are
all genuine, well-built features that now correctly place it as either the outright winner or a
close runner-up on roughly a third of this batch's items, whereas the mislabeled grading had
buried its real quality under arm-02's numbers.
