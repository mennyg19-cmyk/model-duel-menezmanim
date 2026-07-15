# Phase Review — rebuild-a, Phase 3

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 3

## Meta

- Arm reviewed: rebuild-a
- Phase number: 3 — Auth, landing, onboarding
- Diff / files touched this phase: `app/page.tsx`; login, register, onboarding, and admin pages; auth, me, onboarding, invite, and Clerk-webhook routes; `src/auth/*`; schema, seed, migration, middleware, STATUS, DECISION-LOG, and `.env.example`. The review began while these were uncommitted; the orchestrator later created `fff8718 Experiment arm A: Phase 3 auth and onboarding complete.`

## Proof-of-read

**`results/PHASE-REVIEW-RUBRIC.md`**
- Requires evidence for all 13 checklist areas and all six 1–10 scores.
- Calls for direct attention to stubs, phase-plan fidelity, rules, and security.
- Defines this report as the phase-gate artifact.

**`rebuild-a/PHASE-PLAN.md` (Phase 3)**
- Assigns R1, R2, R3, R4; P1.1–P1.4, P2.1–P2.3, P4o.1–P4o.6; E1, E2, E6, E7; and F-ME-SHAPE.
- Keeps the real admin shell in Phase 4, so a narrow post-auth `/admin` stub is permitted here.
- Requires every inventory item to belong to one phase and preserves later phases untouched.

**`rebuild-a/STATUS.md`**
- Declares session auth because no Clerk keys are present and records the claimed Phase 3 routes and APIs.
- Records seeded accounts, the invite token, a manual route/API flow, and successful test/typecheck/build runs.
- States Phase 4 has not started.

**`rebuild-a/DECISION-LOG.md`**
- Records the reversible session-auth decision, with Clerk reserved for when keys are available.
- Records the Svix-or-development-secret webhook design and pending status for newly created organizations.
- Records that the Phase 3 `/admin` screen is a temporary post-auth destination rather than a claimed admin implementation.

**`inventory/FEATURE-INVENTORY.md` (R1–R4, P1.*, P2.*, P4o.*, E1, E2, E6, E7, F-ME-SHAPE)**
- R1 requires hero, feature highlights, login/register CTAs, and header navigation.
- P2.1–P2.3 require sign-in, sign-up, and OAuth-compatible Clerk paths; P4o.2 requires address-to-location data, not only manual coordinates.
- E1 requires a flat `isSuperAdmin`; E2, E6, and E7 set the auth, onboarding, webhook, and invite trust boundaries.

**`rebuild-a/.cursor/rules/{workflow,vocabulary,git-discipline,codegraph,ponytail,clean-code}.mdc`**
- Requires running-app evidence, an expectation checklist for phase work, least-privilege security, and no contestant Git activity.
- Requires a CodeGraph status check before structural lookup; it reported “Not initialized.” The session’s CodeGraph server instructions prohibit reviewer-initiated indexing.
- Requires minimal, consistent code without speculative abstractions, duplicated patterns, or unsafe error handling.

**Phase 3 implementation**
- Reviewed landing, login, register, onboarding, admin-stub, middleware, every claimed API route, auth/session/password helpers, schema, seed, migration, and `/api/me` test.
- Passwords use salted `scrypt` and constant-time comparison; session cookies are HMAC-signed, `HttpOnly`, `SameSite=Lax`, production-secure, and expiry-checked.
- The actor is reloaded from the database after session verification, so stale/tampered email and super-admin payload fields do not authorize the request.

## Checklist

### 1. Inventory coverage

- **R1 / P1.1–P1.4 — PRESENT.** `/` contains a hero, three feature cards, register/login CTAs, and header navigation. It returned 200 in the independent smoke test.
- **R2 / P2.1 — PRESENT with the documented session-auth substitution.** The catch-all `/login/[[...login]]` renders a real credential form and successful seeded login returned 200.
- **R3 / P2.2 — PRESENT with the documented session-auth substitution.** The catch-all register page and `/api/auth/register` create a salted password hash and reject an existing email.
- **P2.3 / OAuth — MISSING.** The catch-all route will render at a callback path, but there is no Clerk provider, SSO callback handling, or OAuth flow. `AUTH_MODE=clerk` deliberately fails closed.
- **R4 / P4o.1, P4o.3–P4o.6 — PRESENT.** The form suggests/checks slugs, captures manual location/minhag fields, seeds groups/style/screen, creates owner membership, creates `pending` organizations, lists pending invites, and accepts a matching-email invite.
- **P4o.2 — PARTIAL.** The form accepts manually entered latitude, longitude, elevation, timezone, and Israel status, but explicitly defers the required address-to-location/geocoding flow.
- **E1 + F-ME-SHAPE — PRESENT.** `/api/me` has the required flat response; `src/auth/me.test.ts` asserts top-level `isSuperAdmin` and memberships.
- **E2 — PRESENT.** Authenticated GET checks a slug; authenticated POST creates a pending organization, owner membership, default groups, style, and screen.
- **E6 — PRESENT functionally, SECURITY BLOCKED.** It verifies Svix when configured and returns 400 for an invalid unauthenticated request, but the fallback design is unsafe in production; see Finding 1.
- **E7 — PRESENT with a privacy issue.** Pending-invite listing and token acceptance correctly require a session, enforce recipient-email equality on POST, and avoid duplicate memberships; token preview leaks invite details to any authenticated user who has the token.

### 2. Running app

- Independently started the app on port 3101 and stopped it after review.
- `GET /`, `/login`, `/register`, `/onboarding`, and `/show/demo` each returned 200.
- Seeded `owner@demo.local` login returned 200. Reusing its issued cookie against `/api/me` returned the flat authenticated response with `isSuperAdmin: true` and the demo-owner membership.
- Unauthenticated onboarding returned 401; an invalid webhook request returned 400; unauthenticated invite-token preview returned 401.
- `npm test`: 16 files / 154 tests passed. `npm run typecheck` and `npm run build` passed. Next reports the deprecated `middleware` convention warning, not a build failure.

### 3. No stubs

- The claimed landing, credential forms, onboarding form, slug check, invite controls, and API handlers execute real paths.
- `/admin` is explicitly a Phase 3 redirect destination and is not claimed as the Phase 4 admin shell, so it is an allowed temporary stub.
- OAuth is not an allowed stub because P2.3 is explicitly claimed; it is recorded as a missing inventory item.

### 4. Rule: ponytail

- Auth concerns are factored into small helpers rather than a framework-sized abstraction. The password and session implementations use Node built-ins.
- The session fallback is a smaller reversible substitute for unavailable Clerk keys and is documented in the decision log.
- Landing/auth/onboarding pages repeat sizable inline style objects. This is tolerable for the small phase but does not establish one styling pattern cleanly.

### 5. Rule: clean-code

- Names and auth boundaries are clear: `requireActor`, `startSession`, `verifyPassword`, and `meResponse` state their roles precisely.
- Password verification is constant-time after length checking; route errors are returned rather than swallowed.
- Onboarding creates several dependent records without a database transaction and validates only name/slug strictly. A failed later insert can leave a partial organization, and malformed numeric/timezone values are accepted or coerced.

### 6. Rule: workflow

- STATUS has concrete running-app evidence and the decision log records the session-auth, webhook, pending-org, and temporary-admin decisions.
- No `.scratch/phase-plan.md` expectation artifact exists. The required before-build EXPECTED blocks and item-by-item evidence are therefore not available for review.
- The undocumented OAuth and address-geocoding omissions contradict the full claimed inventory scope rather than a stated deferral.

### 7. Rule: codegraph

- Ran `codegraph status` before structural review: it reported “Not initialized.”
- No index was created because the session’s CodeGraph MCP instructions state that indexing is the user’s decision. Structural review used direct reads under that exception.

### 8. Rule: git-discipline

- At review start, Phase 3 files were uncommitted and `git log` ended at the Phase 2 review commit. This supports the contestant’s no-Git constraint.
- The later `fff8718` experiment commit appeared during review and is consistent with orchestration collecting the already-uncommitted phase. No evidence shows the contestant made a Git commit.

### 9. Todos / PHASE-PLAN fidelity

- Most claimed Phase 3 work exists and the Phase 4 boundary was respected.
- Fidelity is partial: P2.3 OAuth and P4o.2 address geocoding are claimed through their parent IDs but not implemented or explicitly deferred.
- The Phase 3 post-auth `/admin` stub follows the decision log and does not claim Phase 4 work.

### 10. Context retention

- The implementation preserves Phase 1’s users/orgs/memberships/schema and Phase 2’s public demo route.
- It preserves the required flat `/api/me` contract with a dedicated test and creates the default groups/styles/screens expected by later phases.
- The pending-org decision is consistent across the decision log, API implementation, and onboarding UI.

### 11. Security

- Positive: salted `scrypt` hashes, constant-time password and HMAC checks, expiry-checked signed cookies, `HttpOnly`/`SameSite=Lax` cookies, database-backed actor rehydration, and invite recipient validation on acceptance.
- Blocking: `AUTH_SECRET` falls back to the public literal `rebuild-a-dev-secret-change-me`; the webhook uses the same predictable fallback when no Svix secret is set. A production deployment missing configuration could accept forged webhooks and mint a user for a configured super-admin email.
- The invite-preview GET endpoint does not confirm that the authenticated user owns the invite email before returning its recipient email, role, and organization.

### 12. Code quality — 6/10

The auth/session primitives are compact and mostly sound, and the successful build plus smoke test support basic functional quality. The predictable production fallback secret, missing claimed OAuth/geocoding work, missing expectation artifact, non-transactional onboarding, and duplicated page styling prevent a higher score.

### 13. Findings

1. **BLOCKER — predictable auth and webhook secret fallback.** `src/auth/actor.ts` and `app/api/webhooks/clerk/route.ts` use `rebuild-a-dev-secret-change-me` when `AUTH_SECRET` is absent. The same public string protects session signatures and the non-Svix webhook path. In a production misconfiguration, an attacker can forge a Clerk `user.created` webhook for an allow-listed super-admin email. Require `AUTH_SECRET` in session mode outside development, and disable the development webhook fallback in production.
2. **HIGH — P2.3 OAuth is claimed but absent.** Login/register are session forms only; no Clerk integration or SSO callback flow exists, and Clerk mode deliberately returns no actor. Mark P2.3 deferred with an approved scope decision or implement it before passing full inventory coverage.
3. **MEDIUM — P4o.2 is incomplete.** Onboarding explicitly defers address geocoding and only supports manual coordinates. The inventory requires address-to-latitude/longitude/elevation/timezone conversion.
4. **MEDIUM — onboarding writes are not atomic and inputs are weakly validated.** A later failure while seeding groups/style/screen leaves a pending organization and membership behind; numeric fields are coerced with `Number(...) || 0`, and timezone/dialect/end-type values are not allow-listed. Use a transaction and schema validation.
5. **LOW — invite preview leaks invite metadata across authenticated users.** `GET /api/invites/[token]` authenticates but does not require the invite email to match the actor before returning recipient email, role, and organization. Apply the same recipient check as POST, or return only non-sensitive data.
6. **PROCESS — required phase expectation evidence is absent.** `.scratch/phase-plan.md` was not present, so the rule-required EXPECTED checklist cannot prove every claimed control was verified before the phase gate.

## Scores

- inventory_coverage: 7
- rule_adherence: 5
- plan_fidelity: 6
- context_retention: 8
- security: 3
- code_quality: 6
