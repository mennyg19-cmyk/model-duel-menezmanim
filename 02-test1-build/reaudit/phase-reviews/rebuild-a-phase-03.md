# Phase review — rebuild-a, Phase 3 (reaudit)

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 3 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 3 — Auth, landing, onboarding
- Diff / files touched this phase: `audit/diffs/a-p03.patch` is empty ("PHASE 1 - no previous phase; see snapshot tree"). Evidence taken from the snapshot tree at `audit/snapshots/a/p03`.

## Proof-of-read
- REAUDIT-INSTRUCTIONS.md: single third-party reviewer; rate this phase only; static snapshot OK, running-app N/A; do not guess contestant model.
- PHASE-REVIEW-RUBRIC.md: 13-item checklist + 6 scores (1-10); write full report to the given path.
- FEATURE-INVENTORY.md (relevant IDs): R1/P1.1-1.4 landing; R2/R3 P2.1-2.3 catch-all auth; R4/P4o.1-0.6 onboarding (create+slug+location+minhag+pending+invites); E1 flat `/api/me` + F-ME-SHAPE; E2 onboarding POST; E6 Clerk webhook (svix); E7 invites token + pending.
- PHASE-PLAN.md (Phase 3): claims R1, R2, R3, R4, E1+F-ME-SHAPE, E2, E6, E7.
- STATUS.md: 9-step verification walk on port 3101; 16 files / 154 tests; typecheck + build green; stopped before Phase 4.
- DECISION-LOG.md: AUTH_MODE=session (no Clerk keys); E6 dev-secret fallback; new orgs `pending`; /admin stub (Phase 4); F-FIDS finish; harvested board/widgets.
- a-p03.patch: empty; reviewed snapshot tree instead (app/api/*, app/login, app/register, app/onboarding, app/page, app/admin, src/auth/*, middleware.ts, seed.ts).

## Checklist

1. **Inventory coverage** — All claimed IDs PRESENT.
   - R1 / P1.1-1.4: `app/page.tsx` hero + tagline + 3 feature cards + Log in / Get started / Create account CTAs + header nav. PRESENT.
   - R2 / P2.1: `app/login/[[...login]]/page.tsx` session sign-in, catch-all path reserved for Clerk. PRESENT.
   - R3 / P2.2-2.3: `app/register/[[...register]]/page.tsx` session sign-up, catch-all reserved. PRESENT.
   - R4 / P4o.1-0.6: `app/onboarding/page.tsx` — name + auto-suggested editable slug with debounced uniqueness check (P4o.1), location fields lat/lng/elev/tz/inIsrael (P4o.2 PARTIAL — manual coords, address geocode deferred with a note), minhag/dialect/candle-lighting/shabbat-end (P4o.3), POST `/api/onboarding` creates org status `pending` + seeds groups/style/screen + owner membership (P4o.4/P4o.6), pending invites list + Accept (P4o.5), `?invite=` auto-accept. PRESENT (one sub-item partial).
   - E1 + F-ME-SHAPE: `app/api/me/route.ts` + `src/auth/me.ts` flat shape with top-level `isSuperAdmin`; locked by `src/auth/me.test.ts` (3 cases). PRESENT.
   - E2: `app/api/onboarding/route.ts` GET slug check + POST create. PRESENT.
   - E6: `app/api/webhooks/clerk/route.ts` Svix `t.v1` verify (5-min window, timing-safe) + dev-secret fallback; upserts/deletes user; sets isSuperAdmin from `SUPER_ADMIN_EMAILS`. PRESENT.
   - E7: `app/api/invites/[token]/route.ts` GET preview + POST accept (verifies used/expired/email-match, idempotent); `app/api/invites/pending/route.ts` GET for actor email. PRESENT.
   - Supporting: `/api/auth/{login,register,logout}`, middleware always `next()` (public-route fix), `/admin` stub (Phase 4).

2. **Running app** — N/A. Static snapshot only (no node_modules). STATUS records a 9-step walk on 3101 with seeded logins; not re-run here.

3. **No stubs** — `/admin` is an explicit stub but is correctly NOT claiming P3 IDs and is DECISION-LOG'd as Phase 4 territory. No dead buttons, no "coming soon" marked done. Login/register/onboarding/invites/webhook all do real work.

4. **Rule: ponytail** — Shortest working diff for the phase. AUTH_MODE=session chosen over Clerk (no keys) and made reversible; catch-all paths kept for future Clerk drop-in. No unrequested abstractions. Minor: `local` auth mode (keyless super-admin auto-creating an owner-of-all-orgs user) is borderline YAGNI for the experiment but documented and gated to non-Vercel / explicit `AUTH_MODE=local`.

5. **Rule: clean-code** — Naming clear (`requireActor`, `meResponse`, `startSession`, `verifySession`). One auth pattern (HMAC session cookie). One error shape (`AuthError` with status, guards throw, routes catch). No god files. Inline styles on pages match the established Phase 1-2 pattern. Role hardcoded server-side in onboarding (`owner`); invite role cast from server row.

6. **Rule: workflow** — STATUS carries a walked expectation/verify block with running-app evidence (routes, status codes, body shapes, test/build counts). Open product calls (F-FIDS, AUTH_MODE) are DECIDED + logged, not invented. Phase gate respected: stopped before Phase 4.

7. **Rule: codegraph** — No index in the empty experiment workspace; DECISION-LOG'd as skipped. Reference trees are read-only. N/A for structural lookup this phase.

8. **Rule: git-discipline** — Contestant must NOT git. No evidence of git operations in the snapshot; STATUS says orchestrator commits. Clean.

9. **Todos / PHASE-PLAN fidelity** — Phase 3 plan = R1, R2, R3, R4, E1+F-ME-SHAPE, E2, E6, E7. Every one delivered with real handlers and (for E1) a contract test. Matches.

10. **Context retention** — Reuses Phase 1 schema (`orgs`, `users`, `orgMemberships`, `orgInvites`, `scheduleGroups`, `styles`, `screens`) and `DEFAULT_SCHEDULE_GROUPS`. Onboarding POST writes `styleSchedules` (F-CORE3 from Phase 2). No contradiction with earlier phases; builds forward.

11. **Security** — Session: HMAC-SHA256 signed cookie, httpOnly, sameSite=lax, secure in prod, 14-day TTL, timing-safe verify. Passwords: scrypt + random 16-byte salt, timing-safe compare. Webhook: Svix verify with timestamp window + timing-safe; dev-secret path only when no signing secret. Invites: server-side token lookup, used/expired/email-match checks, idempotent membership insert. Onboarding: `requireActor`, slug regex + uniqueness, role server-derived. `/api/me` reads session only. `SUPER_ADMIN_EMAILS` server-side. `.env.example` documents `AUTH_SECRET` dev fallback. No secrets committed. One nit: `AUTH_SECRET` falls back to a hardcoded dev string when unset — fine for the experiment, must be set before any non-local deploy.

12. **Code quality** — 8/10. Consistent, typed, security-conscious, contract-tested. Nits: inline styles (established pattern, acceptable), dev secret fallback, P4o.2 address geocode deferred to manual coords.

## Findings
1. P4o.2 address→geocode not implemented; onboarding uses manual lat/lng/tz inputs with an explicit "address geocode lands with settings UI" note. Sub-item PARTIAL; acceptable for experiment scope.
2. `AUTH_SECRET` dev fallback (`rebuild-a-dev-secret-change-me`) is used in session signing and the webhook dev path. Documented in `.env.example`; must be replaced before any real deploy.
3. `/admin` is an intentional stub (Phase 4) — correctly not claiming P3 inventory IDs and logged in DECISION-LOG.
4. `local` auth mode auto-creates a super-admin owner-of-all-orgs user. Borderline YAGNI for the experiment but documented and gated to non-Vercel / explicit `AUTH_MODE=local`.

## Scores
- inventory_coverage: 9
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
