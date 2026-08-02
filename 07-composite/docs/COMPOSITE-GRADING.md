# Composite grading — brutal per-item scorecard

Source synthesis: prior arm-by-arm analyses for the six Tomchei Shabbos website builds, covering the reconciled inventory rows `R-001` through `R-192`, user-resolved grill rows `UR-*`, grill rows `G-*`, and claimed novel/bonus work.

This document grades the original submitted arms. It explains why the composite base is `arm-06` and which ideas, if any, are worth borrowing from the other submissions.

## Executive verdict

**Composite base: `arm-06` (`kimi-k3-max`).**

`arm-06` wins the feature-completeness race by a wide margin. It is the only build that consistently covers storefront, ordering, checkout, account, admin, fulfillment, permissions, rank, cron, and media-validation surfaces with a coherent independent tree.

`arm-01` through `arm-04` are a **clone cluster**:

| Arm | Model | Cluster status | High-level verdict |
|---|---|---|---|
| `arm-01` | `gpt-5.6-sol-medium` | Clone cluster | Solid but not broad enough; occasional nice demos such as the test banner and shipping-rule handling. |
| `arm-02` | `claude-fable-5-thinking-medium` | Clone cluster | Functionally near-identical to arm-01/03/04; score with cluster unless a row-specific diff is named. |
| `arm-03` | `cursor-grok-4.5-high` | Clone cluster | Functionally near-identical to arm-01/02/04; no independent feature advantage in the supplied analyses. |
| `arm-04` | `claude-opus-5-thinking-high` | Clone cluster, best residual | Best residual inside the cluster; wins several Clerk/Stripe-related rows and CSV neutralization. |
| `arm-05` | `terra-high` | Thin divergent, T4+T5 only | Too incomplete for a base; notable security/correctness concerns around payment void/refund paths and dead notification surface. |
| `arm-06` | `kimi-k3-max` | Distinct full tree | Feature winner and composite base; still has gaps in inventory operations, Nexternal, several thin admin/reporting rows, and test depth. |

Important grading constraint: arms `01`-`04` share an **identical Prisma schema** and near-identical file trees, with only about nine file diffs. They should not be treated as four independent solutions. Unless a row below calls out a meaningful difference, the cluster receives one score.

## Scoring rubric

Scores are deliberately brutal. A `7` is usable but incomplete. A `9` means the feature is substantially present, integrated, and sane, not merely mentioned in code.

| Score | Meaning |
|---:|---|
| `0` | Absent, empty, or only claimed in prose. |
| `1-2` | Stub, mock, dead code, or isolated fragment with no credible product path. |
| `3-4` | Thin partial implementation; important paths missing or unsafe. |
| `5-6` | Usable slice exists, but meaningful product, security, data, or integration gaps remain. |
| `7-8` | Good implementation with limited omissions or polish/test gaps. |
| `9` | Strong, integrated implementation that fits the product and codebase. |
| `10` | Complete, clean, secure, tested, and production-ready. No arm earned many true 10s. |

Each item score reflects five criteria:

| Criterion | What was judged |
|---|---|
| Completeness | Does the user-visible/admin-visible capability actually exist end to end? |
| Clean-code | Is the implementation maintainable, typed, localized, and not overfit to demos? |
| Codebase fit | Does it match the submitted app architecture, schema, auth model, and UI conventions? |
| Security/correctness | Are roles, trust boundaries, payments, webhooks, mutation safety, imports, and edge cases handled correctly? |
| Tests | Are there meaningful tests or verifiable fixtures? Most arms are weak here. |

Unless otherwise noted, scores are formatted as:

`arm-01 / arm-02 / arm-03 / arm-04 / arm-05 / arm-06`

## Overall arm scores by criterion

These are not simple averages; they are weighted by product-critical coverage.

| Arm | Completeness | Clean-code | Codebase fit | Security/correctness | Tests | Overall read |
|---|---:|---:|---:|---:|---:|---|
| `arm-01` | 7.2 | 7.0 | 7.0 | 6.6 | 5.0 | Solid clone-cluster build, but loses breadth to arm-06. |
| `arm-02` | 7.2 | 7.0 | 7.0 | 6.6 | 5.0 | Same practical score as arm-01. |
| `arm-03` | 7.1 | 6.9 | 6.9 | 6.5 | 4.8 | Same practical score as arm-01/02, slightly weaker residual. |
| `arm-04` | 7.5 | 7.5 | 7.1 | 7.4 | 5.4 | Best clone-cluster residual; strongest Clerk/Stripe/CSV details. |
| `arm-05` | 4.2 | 5.0 | 4.4 | 3.2 | 2.5 | Thin T4+T5 build; too much missing and some unsafe flows. |
| `arm-06` | 9.0 | 8.1 | 8.8 | 7.8 | 6.0 | Clear feature winner; base-worthy despite inventory/Nexternal/test gaps. |

## Domain winner table

| Domain | Rows | Winner | Score pattern | Notes |
|---|---|---|---|---|
| Storefront, order, checkout, account | `R-001..R-048`, `UR-006/007/008/011/013/014`, `G-007`, `G-011..013`, `G-018..022`, `G-028` | Mostly `arm-06` | Clone cluster mostly `7-8`; `arm-05` mostly `3-7`; `arm-06` mostly `8-9` | `R-014` test banner favors clone cluster. `R-025` address autocomplete is weak everywhere, with `arm-06` only around `6`. `R-032` shipping rules slightly cleaner in the clone cluster demos. |
| Admin and fulfillment | `R-049..R-106`, `UR-001..005/009/010/015/016`, related `G-*` | Mostly `arm-06` | Clone cluster mostly `6.5-7.5`; `arm-05` mostly `3-5`; `arm-06` mostly `8-9` | Shared weakness on `R-068..R-070` inventory operations. `R-102`, `R-103`, and `R-106` are thin everywhere. |
| Auth, data, integrations | `R-107..R-192` | Mixed, but composite still `arm-06` | `arm-04` wins Clerk + Stripe webhook/refund details; `arm-06` wins permissions/rank/cron/media validation | Design-system rows are weak everywhere. `R-165` and `R-186` Nexternal work is absent. Novel claims mostly absent except CSV formula neutralization. |

## Storefront, order, checkout, and account rows

| Rows | Surface | Scores | Winner | Brutal notes |
|---|---|---:|---|---|
| `R-001..R-006` | Storefront shell, navigation, product/category browsing | `7.5 / 7.5 / 7.5 / 7.5 / 5.0 / 9.0` | `arm-06` | `arm-06` has the broadest real storefront. Clone cluster is respectable but less complete. `arm-05` has only a thinner slice. |
| `R-007..R-013` | Product detail, package selection, cart affordances | `7.5 / 7.5 / 7.5 / 7.5 / 5.5 / 9.0` | `arm-06` | Strongest path from catalog intent to order composition is in `arm-06`. |
| `R-014` | Test/demo banner handling | `9.0 / 9.0 / 9.0 / 9.0 / 5.0 / 7.0` | Clone cluster | One of the few storefront rows where the cluster has a cleaner explicit demo/test treatment. |
| `R-015..R-024` | Cart, checkout flow, order confirmation | `7.5 / 7.5 / 7.5 / 7.5 / 5.0 / 9.0` | `arm-06` | `arm-06` is more complete end to end. Clone cluster is serviceable but not the feature winner. |
| `R-025` | Address autocomplete | `5.0 / 5.0 / 5.0 / 5.0 / 4.0 / 6.0` | `arm-06`, weak win | All arms are weak. `arm-06` gets partial credit only; no build has a robust, production-grade autocomplete/address-normalization story. |
| `R-026..R-031` | Delivery/pickup selection, customer order details | `7.0 / 7.0 / 7.0 / 7.0 / 5.0 / 8.5` | `arm-06` | The base build is materially broader and better integrated. |
| `R-032` | Shipping rules | `8.0 / 8.0 / 8.0 / 8.0 / 4.0 / 7.5` | Clone cluster | Clone-cluster demos are slightly cleaner. `arm-06` is acceptable but not the row winner. |
| `R-033..R-040` | Customer account basics, saved details, order state | `7.0 / 7.0 / 7.0 / 7.0 / 4.5 / 8.5` | `arm-06` | `arm-06` wins on breadth and integration. |
| `R-041..R-048` | Account history, customer communications, edge states | `6.8 / 6.8 / 6.8 / 7.0 / 4.0 / 8.0` | `arm-06` | Cluster has workable pieces; `arm-06` still covers more of the intended workflow. |

## Admin and fulfillment rows

| Rows | Surface | Scores | Winner | Brutal notes |
|---|---|---:|---|---|
| `R-049..R-055` | Admin shell, order search/filter, staff-facing dashboards | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 8.5` | `arm-06` | `arm-06` has the better operational surface. Cluster is plausible but less complete. |
| `R-056..R-063` | Admin order management and fulfillment state changes | `7.0 / 7.0 / 7.0 / 7.2 / 4.5 / 9.0` | `arm-06` | The feature winner for day-to-day admin workflow. |
| `R-064..R-067` | Package/fulfillment batching and preparation | `7.0 / 7.0 / 7.0 / 7.2 / 5.0 / 8.8` | `arm-06` | `arm-06` is broader and better connected to real fulfillment operations. |
| `R-068` | Inventory overview | `4.0 / 4.0 / 4.0 / 4.2 / 3.0 / 5.0` | `arm-06`, weak win | Shared weakness. No arm delivers a satisfying inventory overview. |
| `R-069` | Inventory adjustment operations | `3.5 / 3.5 / 3.5 / 3.8 / 3.0 / 4.5` | `arm-06`, weak win | All arms are too thin for a critical operational path. |
| `R-070` | Inventory write-off / reconciliation | `3.0 / 3.0 / 3.0 / 3.2 / 2.5 / 4.0` | `arm-06`, weak win | This remains a composite follow-up item, not a solved row. |
| `R-071..R-080` | Package building, route preparation, pickup/driver coordination | `6.8 / 6.8 / 6.8 / 7.0 / 4.0 / 8.8` | `arm-06` | `arm-06` has the strongest operational workflow. |
| `R-081..R-090` | Fulfillment execution, assignment, admin status visibility | `6.8 / 6.8 / 6.8 / 7.0 / 4.0 / 8.5` | `arm-06` | Cluster is usable but less complete. |
| `R-091..R-101` | Reporting, notifications, admin support utilities | `6.0 / 6.0 / 6.0 / 6.5 / 3.5 / 7.5` | `arm-06` | Reports and notification quality are uneven. `arm-05` has especially thin/dead notification paths. |
| `R-102` | Late admin/reporting edge row | `4.0 / 4.0 / 4.0 / 4.2 / 2.5 / 5.0` | `arm-06`, weak win | Thin everywhere; not a decisive feature win. |
| `R-103` | Late admin/reporting edge row | `4.0 / 4.0 / 4.0 / 4.2 / 2.5 / 5.0` | `arm-06`, weak win | Thin everywhere. |
| `R-104..R-105` | Remaining admin utility coverage | `5.5 / 5.5 / 5.5 / 6.0 / 3.0 / 7.0` | `arm-06` | `arm-06` is still the best foundation, but these are not polished rows. |
| `R-106` | Late admin/reporting edge row | `3.5 / 3.5 / 3.5 / 3.8 / 2.0 / 4.5` | `arm-06`, weak win | One of the known thin-everywhere rows. |

## Auth, data, and integrations rows

| Rows | Surface | Scores | Winner | Brutal notes |
|---|---|---:|---|---|
| `R-107..R-115` | Clerk/auth-related implementation details | `7.0 / 7.0 / 7.0 / 8.0 / 4.0 / 6.5` | `arm-04` | `arm-04` is the clone-cluster winner here. `arm-06` chooses a first-party session model that fits the composite direction but does not win every Clerk-specific row. |
| `R-116..R-124` | Permissions, staff/customer separation, rank/role behavior | `6.8 / 6.8 / 6.8 / 7.0 / 3.5 / 8.5` | `arm-06` | `arm-06` wins the practical permission/rank model for the composite. |
| `R-125..R-137` | Cron/background jobs, validation, operational data plumbing | `6.0 / 6.0 / 6.0 / 6.5 / 3.5 / 8.0` | `arm-06` | `arm-06` has the best recurring/operational coverage. |
| `R-138..R-152` | Design-system and UI consistency rows | `5.0 / 5.0 / 5.0 / 5.3 / 3.0 / 6.0` | `arm-06`, weak win | Weak everywhere. `arm-06` is more usable, but no arm earns strong design-system credit. |
| `R-153..R-160` | Payments, Stripe webhook, refund/void safety | `7.0 / 7.0 / 7.0 / 8.5 / 2.5 / 7.5` | `arm-04` | `arm-04` has the strongest Stripe webhook/refund details. `arm-05` is penalized hard for unsafe payment-void/IDOR concerns. |
| `R-161..R-164` | Imports/exports, CSV safety, data movement | `6.5 / 6.5 / 6.5 / 8.0 / 3.5 / 7.5` | `arm-04` | CSV formula neutralization is the meaningful novel/security idea from the non-base arms. |
| `R-165` | Nexternal integration/migration | `0.0 / 0.0 / 0.0 / 0.0 / 0.0 / 0.0` | None | Absent from submitted trees. Claims do not count. |
| `R-166..R-176` | Media, file validation, misc integration hardening | `5.5 / 5.5 / 5.5 / 6.0 / 3.0 / 8.0` | `arm-06` | `arm-06` wins media validation and practical hardening coverage. |
| `R-177..R-185` | Remaining data/integration support rows | `5.5 / 5.5 / 5.5 / 6.0 / 3.0 / 7.0` | `arm-06` | Mixed quality; `arm-06` remains the best base but not fully polished. |
| `R-186` | Nexternal integration/migration | `0.0 / 0.0 / 0.0 / 0.0 / 0.0 / 0.0` | None | Absent. This is a known composite gap. |
| `R-187..R-192` | Final design/integration edge rows | `4.5 / 4.5 / 4.5 / 5.0 / 2.5 / 6.0` | `arm-06`, weak win | Mostly weak everywhere. These rows should not drive base selection. |

## Critical user-resolved rows

The supplied prior analyses emphasized the following `UR-*` rows. Non-listed `UR` rows are not repeated here because the source synthesis did not call them out as decisive.

| Row | Domain | Scores | Winner | Notes |
|---|---|---:|---|---|
| `UR-001` | Admin/staff behavior | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 8.5` | `arm-06` | Better staff/admin operational fit. |
| `UR-002` | Fulfillment/admin workflow | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 9.0` | `arm-06` | `arm-06` has the most complete end-to-end handling. |
| `UR-003` | Fulfillment coordination | `6.8 / 6.8 / 6.8 / 7.0 / 4.0 / 8.8` | `arm-06` | Stronger practical flow in the composite base. |
| `UR-004` | Inventory operations | `4.0 / 4.0 / 4.0 / 4.2 / 3.0 / 5.0` | `arm-06`, weak win | Inventory is underbuilt in every arm. |
| `UR-005` | Admin reporting/support | `5.5 / 5.5 / 5.5 / 6.0 / 3.0 / 7.0` | `arm-06` | Wins, but still not polished. |
| `UR-006` | Storefront/order flow | `7.5 / 7.5 / 7.5 / 7.5 / 5.0 / 9.0` | `arm-06` | Clear feature win. |
| `UR-007` | Account/order history | `7.0 / 7.0 / 7.0 / 7.0 / 4.0 / 8.5` | `arm-06` | `arm-06` is broader and more connected. |
| `UR-008` | Checkout/payment flow | `7.5 / 7.5 / 7.5 / 7.8 / 3.0 / 8.5` | `arm-06` | `arm-05` penalized for payment safety concerns. |
| `UR-009` | Admin fulfillment | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 9.0` | `arm-06` | Major operational win for `arm-06`. |
| `UR-010` | Notifications/support utilities | `5.5 / 5.5 / 5.5 / 6.0 / 2.5 / 7.0` | `arm-06` | `arm-05` has a thin/dead notification path. |
| `UR-011` | Address/delivery handling | `5.0 / 5.0 / 5.0 / 5.0 / 4.0 / 6.0` | `arm-06`, weak win | Same weakness as `R-025`: address handling is not production-grade in any arm. |
| `UR-013` | Storefront/customer edge workflow | `7.0 / 7.0 / 7.0 / 7.2 / 4.5 / 8.5` | `arm-06` | Base has better overall coverage. |
| `UR-014` | Storefront/customer edge workflow | `7.0 / 7.0 / 7.0 / 7.2 / 4.5 / 8.5` | `arm-06` | Base wins on breadth; clone cluster remains acceptable. |
| `UR-015` | Auth/integration/admin security | `7.0 / 7.0 / 7.0 / 8.0 / 3.5 / 7.5` | `arm-04` narrowly | Clerk/security-specific details favor `arm-04`; composite still prefers `arm-06` for system fit. |
| `UR-016` | Permissions/rank/admin correctness | `6.8 / 6.8 / 6.8 / 7.0 / 3.5 / 8.5` | `arm-06` | `arm-06` wins the product permission model. |

## Critical grill rows

These are the grill rows explicitly tied to the supplied storefront/admin analyses. The labels are intentionally domain-level because the prior synthesis named row IDs and outcomes more than full row prose.

| Row | Domain | Scores | Winner | Notes |
|---|---|---:|---|---|
| `G-007` | Storefront/order grill item | `7.5 / 7.5 / 7.5 / 7.5 / 5.0 / 9.0` | `arm-06` | Typical storefront result: `arm-06` has the complete path. |
| `G-011` | Checkout/account grill item | `7.5 / 7.5 / 7.5 / 7.5 / 4.5 / 8.8` | `arm-06` | Base wins on product completeness. |
| `G-012` | Checkout/account grill item | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 8.5` | `arm-06` | Cluster is decent; `arm-06` is broader. |
| `G-013` | Checkout/account grill item | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 8.5` | `arm-06` | Same pattern as adjacent checkout/account rows. |
| `G-018` | Admin/fulfillment grill item | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 9.0` | `arm-06` | Strong `arm-06` admin/fulfillment win. |
| `G-019` | Admin/fulfillment grill item | `6.8 / 6.8 / 6.8 / 7.0 / 4.0 / 8.8` | `arm-06` | `arm-06` has better workflow coverage. |
| `G-020` | Inventory/admin grill item | `4.0 / 4.0 / 4.0 / 4.2 / 3.0 / 5.0` | `arm-06`, weak win | Inventory is a known weak zone in all arms. |
| `G-021` | Inventory/admin grill item | `3.5 / 3.5 / 3.5 / 3.8 / 3.0 / 4.5` | `arm-06`, weak win | Not solved well enough by any build. |
| `G-022` | Admin/reporting grill item | `5.5 / 5.5 / 5.5 / 6.0 / 3.0 / 7.0` | `arm-06` | Better in the base but still follow-up-worthy. |
| `G-028` | Storefront/account grill item | `7.0 / 7.0 / 7.0 / 7.2 / 4.0 / 8.5` | `arm-06` | Base wins; not one of the cluster exception rows. |

## Clone-cluster exception rows

Most rows should not distinguish between arms `01`-`04`, but the prior analyses called out a few differences worth preserving.

| Row/area | Best non-base arm | Why it matters | Composite action |
|---|---|---|---|
| `R-014` test banner | Clone cluster, especially `arm-01` pattern | Cleaner explicit demo/test banner treatment. | Keep as reference only; not enough to overcome arm-06 breadth. |
| `R-032` shipping rules | Clone cluster | Slightly cleaner shipping-rule demos. | Consider borrowing behavior or tests if compatible. |
| Clerk-related rows `R-107..R-115` | `arm-04` | Best residual and strongest Clerk-specific handling. | Reference for auth hardening, but do not switch base because composite auth direction is first-party session/customer-staff separation. |
| Stripe webhook/refund `R-153..R-160` | `arm-04` | Stronger webhook/refund safety patterns than the rest of the cluster and arm-06. | Reference during payment hardening. |
| CSV formula neutralization `R-161..R-164` / bonus | `arm-04` | Real security improvement: prefixes dangerous spreadsheet formula cells. | Carry forward into composite exports. |

## Novel and bonus claims

Claims only receive credit when the relevant implementation is actually present in the submitted tree. Most novel claims did not survive inspection.

| Claimed novel/bonus area | arm-01 | arm-02 | arm-03 | arm-04 | arm-05 | arm-06 | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| CSV formula-injection neutralization | 6 | 6 | 6 | 8 | 3 | 7 | Real useful idea, strongest in `arm-04`; worth preserving in composite exports. |
| Nexternal migration/integration (`R-165`, `R-186`) | 0 | 0 | 0 | 0 | 0 | 0 | Absent. No credit. |
| Inventory operations beyond basic display | 3 | 3 | 3 | 3 | 2 | 4 | Claimed/partial at best; all arms weak. |
| Advanced address autocomplete/normalization | 4 | 4 | 4 | 4 | 3 | 5 | Too weak for real bonus credit. |
| Design-system polish/systematization | 4 | 4 | 4 | 4 | 2 | 5 | Mostly ordinary UI work; weak across all submissions. |
| Media/file validation | 5 | 5 | 5 | 6 | 3 | 8 | `arm-06` wins and earns real integration-hardening credit. |
| Cron/background operational work | 5 | 5 | 5 | 6 | 3 | 8 | `arm-06` has the strongest practical implementation. |
| Payment safety/refund handling | 6 | 6 | 6 | 8 | 2 | 7 | `arm-04` has the best detail; `arm-05` is unsafe enough to be disqualifying as a base. |

## Composite pick rationale

`arm-06` is the right base because:

1. **It wins the broad product surface.** Storefront, order, checkout, account, admin, fulfillment, permissions, rank, cron, and media validation are consistently better covered.
2. **It is not another clone-cluster variant.** Arms `01`-`04` are too similar to count as four independent confirmations. Their occasional wins are reference material, not a reason to pick the cluster.
3. **Its weaknesses are localized.** Inventory ops, Nexternal, design-system polish, and several thin admin/reporting rows can be fixed incrementally.
4. **It fits the composite architecture.** The first-party session direction aligns with the resolved distinction between customer and staff behavior, while still leaving room to borrow Clerk/Stripe lessons from `arm-04`.
5. **It has fewer base-disqualifying risks than `arm-05`.** `arm-05` is too thin and carries serious security/correctness concerns.

The correct merge strategy is not a blind Frankenstein merge. Use `arm-06` as the base, then selectively port small, reviewed ideas:

- Clone-cluster test banner behavior (`R-014`) if it still matters.
- Clone-cluster shipping-rule demos/tests (`R-032`) if compatible.
- `arm-04` Stripe webhook/refund hardening patterns.
- `arm-04` CSV formula neutralization.

## Known remaining gaps

These are the gaps that remain after choosing `arm-06` as the composite base.

| Gap | Related rows | Severity | Notes |
|---|---|---|---|
| Inventory overview/adjustment/write-off is underbuilt | `R-068..R-070`, `UR-004`, `G-020`, `G-021` | High | All arms score only around `3-5`. This needs real product design and implementation, not porting from another arm. |
| Nexternal migration/integration absent | `R-165`, `R-186` | High | No submitted tree earns credit. Must be built fresh if required. |
| Address autocomplete/normalization weak | `R-025`, `UR-011` | Medium/high | `arm-06` only earns about `6`; the rest are weaker. |
| Thin admin/reporting edge rows | `R-102`, `R-103`, `R-106` | Medium | `arm-06` weakly wins but does not solve these rows fully. |
| Design-system rows weak everywhere | `R-138..R-152`, `R-187..R-192` | Medium | `arm-06` is most usable, but none of the arms has a genuinely strong design-system implementation. |
| Tests are shallow | All domains | Medium | Scores are mostly capped by lack of meaningful tests, especially around payments, fulfillment mutation safety, inventory, and imports/exports. |
| Payment and webhook hardening should absorb `arm-04` lessons | `R-153..R-160` | Medium | `arm-06` is acceptable, but `arm-04` has better safety details. |
| Export/import spreadsheet safety must be preserved | `R-161..R-164`, CSV bonus | Medium | CSV formula neutralization is the strongest useful novel from the non-base arms. |
| Notification paths need verification | `R-091..R-101`, `UR-010` | Medium | `arm-05` is especially poor; `arm-06` still needs end-to-end confidence. |

## Final ranking

| Rank | Arm | Score band | Reason |
|---:|---|---|---|
| 1 | `arm-06` | `8.5-9` feature base | Best full product implementation and composite base. |
| 2 | `arm-04` | `7-8` clone-cluster best | Best residual inside cluster; useful Clerk/Stripe/CSV references. |
| 3 | `arm-01` | `7-8` clone-cluster | Good but materially the same as the cluster. |
| 4 | `arm-02` | `7-8` clone-cluster | Good but materially the same as the cluster. |
| 5 | `arm-03` | `7-8` clone-cluster | Good but no decisive advantage. |
| 6 | `arm-05` | `3-5` thin divergent | Too incomplete and too risky for base selection. |

Bottom line: **use `arm-06`; borrow only small, reviewed pieces from `arm-04` and the clone-cluster demos; build inventory and Nexternal fresh.**
