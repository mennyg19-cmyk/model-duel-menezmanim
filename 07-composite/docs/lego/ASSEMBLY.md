# LEGO assembly — Pass B (fit-check) outcome

Pass A (`SCORES.json` / `MATRIX.md`) scored all 238 inventory items across
all six arms independently. Pass B takes each item's winner and asks: does it
fit the composite (built on the arm-06 tree) without breaking the composite's
auth model, schema, or one-pattern-per-concern conventions? If not, fall back
down the ranked list — per item, not per file, and never by adopting a whole
foreign tree.

## Triage (`pass_b_triage.py`)

| Bucket | Count | Meaning |
|---|---:|---|
| `ARM06_WINS` | 203 | arm-06 already ties or wins Pass A — the composite already has the best implementation, no action needed. |
| `MARGINAL` | 25 | A clone-cluster arm (usually arm-01) beats arm-06 by 1–2 points with no disqualifying flag on arm-06's side. Fit-check **rejects** these: transplanting a file from a materially different codebase (different auth module, different route-group layout, different permission helper names) for a 1–2 point polish gain isn't worth the cohesion cost. Composite keeps its own implementation. Full list in `pass_b_marginal.json`. |
| `GAP_REVIEW` | 10 | Winner beats arm-06 by ≥3 points, or arm-06 carries a disqualifying flag (`MISSING`/`BROKEN`/`THEATER`/`STUB`). These are real functionality gaps, reviewed individually below. |

Important caveat: Pass A's `arm-06` scores were recorded against the
**original arm-06 duel workspace**, not the evolving composite tree. Several
`GAP_REVIEW` items had already been fixed in the composite by the time Pass B
ran (see "Already resolved" below) — Pass B re-verified the *current*
composite state for every item in this bucket rather than trusting the stale
score.

## GAP_REVIEW items — one by one

### Already resolved in the composite before Pass B

- **R-108 — Sign-in / sign-up pages** (arm-06 was `2, MISSING/BROKEN` vs
  arm-01 `8`): arm-06 shipped no reusable staff or customer sign-in — only a
  one-time invite link and a test-only dev bypass, so a session expiry was a
  permanent lockout. Ported the clone-cluster's password-auth *pattern*
  (not its files — different auth module, different route layout) into the
  composite: `lib/passwords.ts` (PBKDF2-SHA256 via Web Crypto, matching
  `lib/hmac.ts`'s existing discipline), `lib/safe-redirect.ts`, `/login` +
  `/api/login` (staff), `/signin` + `/api/account/{login,register}`
  (customer), password collection added to `/setup` and `/invite/[token]`
  (the only two places a `passwordHash` can originate). See commit "Add
  password-based staff/customer sign-in (composite gap fix)".

- **R-173 / R-174 / R-175 / R-176 / R-177 — Shippo shipping integration**
  (arm-06 was `1–5, BROKEN` vs arm-01 `8–9`): the recorded scores reflect a
  corrupted `lib/shipping/margin.ts` in the original arm-06 workspace —
  byte-identical to the clone cluster's single-arg `CarrierRate` version,
  missing the five exports (`GROUND_SERVICE_TOKENS`, `RateOption`,
  `MarginResolution`, `normalizeRates`, `eligibleRates`/`resolveMargin`)
  that `lib/shipping/quotes.ts` and 8 downstream files require — a
  `next build`-breaking defect. This was already rewritten correctly in the
  composite in an earlier pass. Verified still correct: `npm run typecheck`,
  `npm run build`, and `scripts/test-p8.mts` (which directly exercises
  `resolveMargin`/`normalizeRates`/`eligibleRates`) all pass.

### Fixed in this pass

- **R-179 — Mapbox geocoding with cache** (arm-06 `5`, no live geocoding call
  — `lib/customers/geocode.ts` only ever derived a deterministic hash-based
  point — vs arm-01 `8`, a real Mapbox Geocoding v5 call with a graceful
  fallback): added a `mapboxCoordinates()` path to
  `lib/customers/geocode.ts` that calls the Mapbox API when
  `MAPBOX_ACCESS_TOKEN` is set (the composite already declares and uses this
  var for route optimization, `lib/routes/optimize.ts` — same env key, same
  "real API when configured, deterministic fallback otherwise" honesty
  class), reconstructing a query string from the existing pipe-joined
  `addressKey`. On any failure (no token, network error, no match) it falls
  straight back to the existing `deriveGeoPoint()`, which stays exported,
  pure, and unit-tested for determinism in `scripts/test-p4.mts` — unchanged
  behavior for every caller and test that doesn't set a token.

- **R-133 — Automated repository security guardrails (CI)** (arm-06 `0,
  MISSING` — the `package.json` `"ci"` script existed but nothing invoked it
  automatically — vs arm-05 `4`, the only arm with any GitHub Actions
  workflow at all): added `.github/workflows/composite-ci.yml` at the repo
  root, scoped to `07-composite/**` via path filters, running `npm ci`,
  `lint`, `typecheck`, `prisma migrate deploy`, `migration-guard`,
  `test:unit`, `seed`, `test:domain` against a Postgres service container.
  Dry-run of the full step sequence against a local Postgres passed
  end-to-end before committing.

### Deliberately not ported

- **R-107 — Clerk identity integration + middleware** (arm-06 `2,
  MISSING/THEATER` vs arm-01 `6`): arm-01's own Pass-A note calls this "a
  documented, unexercised swap-point... not a working integration" — no
  arm has real Clerk keys or a functioning hosted sign-in. Given the
  composite now has a *working* password-based auth system (R-108, above),
  mounting an unconfigured `ClerkProvider` that still wouldn't authenticate
  anyone would be a regression in cohesion for zero functional gain. No
  action.

- **R-192 — Marketing imagery assets** (arm-06 `0` vs arm-01 `1`): arm-01's
  "win" is the unmodified `create-next-app` scaffold SVGs (`globe.svg`,
  `next.svg`, etc.) — no actual Purim/Tomchei-Shabbos brand assets exist in
  *any* of the six arms. A 1-point gap between "nothing" and "generic
  placeholder icons nobody asked for" isn't worth porting. No action.

## Net effect (original triage, before the arm-01/03/04 correction)

Of 238 items, 230 needed no change after Pass B (203 already best-in-class on
arm-06, 25 marginal gaps rejected as not worth the cohesion cost, 2
gap-review items — R-107, R-192 — with no viable/worthwhile fix). 8 items
improved as a direct result of Pass B review: R-179 and R-133 fixed in this
session; R-108 and R-173–177 (6 items) were fixed in an earlier session on
this branch and reverified here against the current composite tree rather
than the stale Pass-A score.

---

## Pass B rerun after the arm-01/03/04 correction

See `CORRECTION-REPORT.md`: arm-01, arm-03, arm-04 were re-graded against
their true, independently-recovered codebases (their on-disk duel workspace
had been silently overwritten with arm-02's code before Pass A ever read it).
115/238 items changed winner. Re-running `pass_b_triage.py` against the
corrected `SCORES.json` gives: `ARM06_WINS` 158, `MARGINAL` 64, `GAP_REVIEW`
16 (up from 10 — 6 new items surfaced now that arm-04's real implementations
are visible).

### Fixed in this pass

- **R-066 — Add-on catalog management** (arm-06 `6` vs arm-04 `9`, missing
  post-create rename/reprice): the `PATCH /api/admin/addons/[id]` endpoint
  already accepted `name`/`priceDollars`; only the admin UI was missing an
  edit affordance (previously delete-and-recreate was the only fix for a
  typo). Added an inline edit row to `addon-manager.tsx`, same pattern as its
  existing create-row. Per-product restriction editing already exists on the
  product side (`ProductAddOn`) and needed no change.

- **R-162 — Geocode cache with success/failure TTLs** (arm-06 `5` vs arm-04
  `9`, a single flat TTL didn't distinguish a real hit from a fallback): the
  R-179 Mapbox integration cached every result — live hit or deterministic
  fallback — for the same 30 days. `lib/customers/geocode.ts` now returns
  `{ point, failed }` from the Mapbox call (real API error vs. a legitimate
  "no match," the same correctness nuance arm-04's `askMapbox()` makes) and
  caches genuine hits for 30 days but a miss/error for only 1 hour, so a
  customer fixing a typo or a transient Mapbox outage gets retried soon
  instead of stuck on a month-old fallback point.

- **UR-004 — Map reroute** (arm-06 `5` vs arm-01 `9` — now the *true* arm-01,
  not the mislabeled arm-02 code; a text list existed but no visual map):
  route stop lat/lng and delivered-state data already existed
  (`lib/routes/builder.ts`) but was only ever rendered as a list. Added
  `lib/routes/static-map.ts` (same honesty-seam pattern as the geocode/route-
  optimizer Mapbox integrations: real Static Images URL when
  `MAPBOX_ACCESS_TOKEN` is set, `null` — rendered as nothing, not a fake
  placeholder — otherwise) and wired it into the route detail page with
  blue/green pins for pending/delivered stops. Does **not** yet overlay
  nearby-unshipped-shipment candidates during an active reroute search (the
  other half of the original requirement) — left as a follow-up; the reroute
  candidate list (`lib/routes/reroute.ts`) isn't currently threaded into the
  page in a form the map component can consume without a larger refactor of
  that page's client/server split.

### Reconfirmed (already resolved before this correction; winner label
changed but the underlying gap and fix did not)

- **R-108 — Sign-in / sign-up pages** (winner now correctly `arm-02` at `8`,
  not the old mislabeled "arm-01"; arm-06 still `2, BROKEN/MISSING`): same gap,
  same fix (`lib/passwords.ts` + `/login` + `/signin`, see original writeup
  above). No further action needed — the composite's password-auth system
  already covers the anti-enumeration and safe-`?next=`-allowlist properties
  the newly-visible true arm-04 sign-in page also has.

- **R-133 — CI** (winner now `arm-05` at `4`, same as originally recorded —
  arm-05 was never part of the corrupted clone cluster): `composite-ci.yml`
  from the earlier fix stands unchanged.

- **R-173 / R-174 / R-175 / R-176 / R-177 — Shippo integration** (winner now
  correctly `arm-04` at `9` for each, not the old mislabeled "arm-01"; arm-06
  still `1–5, BROKEN`): the original fix rewrote the composite's own
  `lib/shipping/margin.ts` to restore its five missing exports — it did not
  port a foreign Shippo client. That fix is orthogonal to which arm's Shippo
  wrapper happens to score highest: arm-06's own `lib/shipping/shippo.ts` was
  already excellent standalone (Pass A's own words) and, once its sibling
  file was un-corrupted, needs no replacement. Re-verified: `npm run
  typecheck`, `npm run build`, `npm run test:domain` all pass against the
  current tree.

- **R-179 — Mapbox geocoding with cache** (winner now correctly `arm-04` at
  `9`, not the old mislabeled "arm-01"): the original fix's design (cache-
  first, live Mapbox call, deterministic fallback) matches arm-04's true
  approach almost exactly; the one nuance it was missing (distinguishing a
  real API failure from a legitimate not-found, for differentiated caching)
  is exactly what R-162's fix above adds.

### Reviewed, not ported

- **R-107 — Clerk identity integration + middleware** (winner now correctly
  `arm-03` at `7`, a real `clerkMiddleware()` + `auth.protect()` setup — not
  the old mislabeled "arm-01"): still requires a live Clerk project/keys that
  don't exist in this environment, and the composite now has a *working*
  password-based auth system (R-108). Mounting an unconfigured `ClerkProvider`
  that still wouldn't authenticate anyone would be a cohesion regression for
  zero functional gain. No action — same reasoning as before, reconfirmed
  against the corrected winner.

- **R-192 — Marketing imagery assets** (winner now `arm-01` at `4`, its true
  own code, not the old mislabeled score of `1`): still no actual Purim/
  Tomchei-Shabbos brand assets in any arm's true codebase — a generic
  `create-next-app`-style scaffold icon set doesn't clear the bar for a
  branded storefront. No action.

- **R-118 — canDrive carve-out for driver-route permissions** (winner
  `arm-04` at `9`, a first-class `routes.drive` permission with an explicit
  design-rationale comment, vs arm-06 `4, MISSING`): Pass A's own note calls
  this "a converged gap rather than a differentiator" — arm-01's true code,
  arm-02's true code, and arm-06 *all* independently arrived at the same
  alternative design (drivers use single-purpose `/drive/[token]` magic
  links instead of a staff-permission carve-out; see `app/(driver)/driver` /
  `app/drive/[token]`). The composite's existing magic-link design is a
  coherent, already-implemented alternative to the same underlying need
  (letting a driver open their assigned route without a staff login), not a
  missing feature — porting a parallel permission system on top of it would
  add two ways to do the same thing. No action.

### Identified, deferred — real schema-level features, not a drop-in

- **R-156 — Pickup locations** (winner `arm-04` at `9`: `Package` *and*
  `OrderLine` both carry a nullable `pickupLocationId` FK, vs the
  composite's `PickupLocation` model existing only as a standalone admin-CRUD
  catalog with no FK anywhere referencing it) and **R-157 — Package types +
  shipment boxes** (winner `arm-04` at `9`: `Package.packageTypeId` plus
  `ShipmentBox.packageTypeId`, vs the composite's `PackageType`/`ShipmentBox`
  existing as standalone catalogs that `lib/shipping/quotes.ts`'s bin-packer
  reads from but never writes back to a persisted relation — the chosen box
  breakdown for a shipment is computed fresh every quote and never recorded).

  Both are genuine, real gaps — not ported in this pass because they're
  schema-level features, not a file-level port: each needs a migration, a
  design decision about cardinality (a `Shipment` can bin-pack into
  *multiple* boxes — `planParcels` returns `Parcel[]` — so "the" box/type FK
  isn't a single column the way it is on arm-04's simpler content model), and
  UI wiring (customer-facing pickup-location selection at checkout when
  `channel = PICKUP`; a real bin-pack-to-box persistence path through label
  purchase). Doing this properly is comparable in scope to R-108's original
  auth port, not a same-session addition on top of everything else already
  changed. Flagged here as the two highest-value remaining gaps for a
  follow-up pass, per LEGO-PROTOCOL.md's "mark UNASSEMBLED with reason
  (needs rewrite / adapter)" guidance rather than rushing a partial schema
  change.

## Net effect (after the correction + this pass)

224 of 238 items needed no further change (158 already best-in-class on
arm-06's actual current implementation, 64 marginal gaps rejected as not
worth the cohesion cost against a materially different codebase). Of the 16
`GAP_REVIEW` items: 3 fixed in this pass (R-066, R-162, UR-004), 6 already
resolved by earlier sessions and reconfirmed correct against the corrected
winner (R-108, R-133, R-173–177), 3 reviewed and deliberately not ported
(R-107, R-118, R-192), and 2 identified as real, deferred schema-level
features (R-156, R-157).
