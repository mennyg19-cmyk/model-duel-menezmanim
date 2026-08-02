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

## Net effect

Of 238 items, 230 needed no change after Pass B (203 already best-in-class on
arm-06, 25 marginal gaps rejected as not worth the cohesion cost, 2
gap-review items — R-107, R-192 — with no viable/worthwhile fix). 8 items
improved as a direct result of Pass B review: R-179 and R-133 fixed in this
session; R-108 and R-173–177 (6 items) were fixed in an earlier session on
this branch and reverified here against the current composite tree rather
than the stale Pass-A score.
