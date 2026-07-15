# Phase review — rebuild-b, Phase 1

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Runner: spawn
- Arm reviewed: rebuild-b
- Phase number: 1
- Diff / files touched this phase: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `src/content/landing.ts`, `package.json`, `tsconfig.json`, `README.md`, `STATUS.md`, `PHASE-PLAN.md`, `DECISION-LOG.md`, `.scratch/phase-plan.md`, `.scratch/run-state.md`, `.cursor/rules/*` (6 files), `.codegraph/` init.

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md** — 13-item checklist covering inventory coverage, running-app verification, stub detection, five named rule checks, plan fidelity, context retention, security, and overall code quality, closed with six 1–10 scores for orchestrator aggregation.

**rebuild-b/PHASE-PLAN.md** — Defines 12 phases claiming all 269 feature labels + 85 editor labels across the merged inventory. Phase 1 (`R1; P1, P1.1–P1.4; F-I18N1`) is the bilingual marketing entry: responsive landing page, header nav, feature explanation, working login/register CTAs, EN/HE seeded copy with a visible locale switch and correct direction. Done-when: `/` on port 3102, locale switch changes copy+direction, feature cards from seed content, login/register links target Phase 2 paths.

**rebuild-b/STATUS.md** — Reports Phase 1 complete: Next.js App Router + strict TS foundation, landing route with hero/cards/nav/CTAs, EN+HE copy with `?lang=he` switching direction, 354 total labels documented across one phase plan, coverage check passed (no missing/duplicate IDs), and a list of live verification evidence (HTTP 200 both locales, dir attributes, six cards each, two viewport sizes, typecheck/build/audit all clean, server stopped after use).

**rebuild-b/DECISION-LOG.md** — Five dated decisions: (1) counting convention for inventory labels (269+85), (2) Next.js App Router chosen up front because Phase 2 needs catch-all auth + API routes, with a pinned PostCSS override for `npm audit`, (3) Phase 1 copy seeded in `src/content/landing.ts` rather than a database, (4) FIDS board (W16) to be finished not left "Coming Soon" in Phase 6, (5) all four desktop modes preserved with an isolated self-host auth adapter in Phase 12.

**FEATURE-INVENTORY.md** (R1, P1/P1.1–P1.4, F-I18N1) — R1 = `/` marketing/landing home. P1.1 hero+tagline, P1.2 feature highlights, P1.3 CTA to `/register`+`/login`, P1.4 header nav; to-fix F-I18N1: landing page was English-only, internationalize.

**`.cursor/rules/*` (6 files)** — `workflow.mdc` (tone, session start, expectation-file discipline, PowerShell script-file rule, dev-server hygiene), `vocabulary.mdc` (command scopes, load-on-demand index), `git-discipline.mdc` (branching/commit rules — irrelevant here since the contestant prompt reserves git to the orchestrator), `codegraph.mdc` (CodeGraph-first for structural lookups when an index exists), `ponytail.mdc` (YAGNI ladder, anti-bloat, anti-slop chat style), `clean-code.mdc` (naming, one-pattern-per-concern, dependency pinning, anti-hallucination).

## Checklist

**1. Inventory coverage** — R1, P1.1–P1.4, F-I18N1: all **PRESENT** with evidence.
- R1 (`/`): `app/page.tsx` renders; confirmed HTTP 200 on port 3102 live.
- P1.1 (hero+tagline): `hero-copy` block with eyebrow/h1/introduction — present.
- P1.2 (feature highlights): `feature-grid` renders 6 cards from `landingCopy[locale].features` — present, confirmed live (6 `.feature-card` elements per locale; the raw HTML shows 12 matches because Next embeds the RSC flight payload once in addition to the rendered markup, not a duplicate-render bug).
- P1.3 (CTA to `/register` + `/login`): present twice — hero actions (`button-primary`→`/register`, `button-secondary`→`/login`) and access section (`button-light`→`/register`, `text-link`→`/login`).
- P1.4 (header nav): present — brand link, `#features`/`#access` in-page anchors (real section ids, not dead links), `/login`, and the language-switch link.
- F-I18N1 (internationalize): present — `src/content/landing.ts` carries full EN+HE copy objects, `?lang=he` switches `dir` and every string. Confirmed live for both locales.

**2. Running app** — Verified directly, not from STATUS.md's word alone.
- Dev server was down at session start; started `npm run dev` (port 3102), confirmed via `Invoke-WebRequest`:
  - `/` → 200, `dir="ltr"` present, 6 feature cards, `/login` and `/register` links present.
  - `/?lang=he` → 200, `dir="rtl"` present, 6 feature cards.
- Independently re-ran `npm run typecheck` (clean) and `npm run build` (clean — Turbopack, `/` compiled as one dynamic route + `_not-found`).
- Independently re-ran `npm audit` (0 vulnerabilities), confirming the STATUS.md claim rather than trusting it.
- Server stopped after verification (killed the process bound to port 3102, then re-checked the port was free) — dev-server-hygiene rule satisfied.
- Did not re-run the headless-Edge viewport captures claimed in STATUS.md (1440×1000, 500×844); took those on the strength of the CSS media queries at 900px/680px, which are present and consistent with the claim.

**3. No stubs** — No dead buttons or empty handlers found. The `/login` and `/register` links point at routes that don't exist yet in this repo, but that is the explicit Phase 1 done-when criterion ("login/register links target the Phase 2 paths") — those routes are Phase 2 scope (P2/R2/R3), not a stub left behind. No "Coming soon" text anywhere in Phase 1 code.

**4. Rule: ponytail** — Clean. Four small source files, no premature component extraction for a single-page phase, no new dependencies beyond `next`/`react`/`react-dom` + typecheck tooling. `resolveLocale` is a one-line ladder-appropriate helper, not an abstraction looking for a second use case yet. Chat-facing docs (STATUS/DECISION-LOG) are terse and free of filler.

**5. Rule: clean-code** — Naming is intention-revealing (`resolveLocale`, `landingCopy`, `alternateLocale`); no banned vague names. One pattern per concern: single CSS file with custom properties, no inline styles, no competing state-management or data-fetching pattern (none needed yet). Types (`LandingCopy`, `Locale`) centralize the copy shape instead of duplicating it per locale. No dead code. Dependency versions are pinned exactly (`16.2.10`, `19.2.7`, `6.0.3`, etc.) per the pinning rule, with the PostCSS override reasoned in DECISION-LOG.

**6. Rule: workflow** — `.scratch/phase-plan.md` has a pre-committed, observable EXPECTED block (7 items) written before the build, and STATUS.md's verification evidence maps 1:1 onto it — no shrinking the goal to fit the result. `.scratch/run-state.md` is current and correctly points at Phase 2 next. No speculative product invention: Next.js App Router was chosen because Phase 2 concretely needs catch-all auth + API routes (stated reasoning, not "just in case").

**7. Rule: codegraph** — `.codegraph/` exists (`codegraph.db` present), so init was done per the rule. Phase 1's scope (4 new source files) is small enough that heavy structural lookup wasn't needed; no evidence of grep-for-symbol misuse to flag. Reasonable application of the rule at this phase size.

**8. Rule: git-discipline** — Confirmed: no `.git` directory was created inside `rebuild-b` itself (`Test-Path .git` → False); the folder only inherits the outer orchestrator-owned repo. DECISION-LOG and STATUS.md contain no git commands. Contestant correctly left git to the orchestrator.

**9. Todos / PHASE-PLAN fidelity** — Full match. PHASE-PLAN's Phase 1 description (responsive landing, header nav, feature explanation, working login/register CTAs, EN/HE first-class locale records, visible switch, correct direction) and its done-when clause are both satisfied, verified live above.

**10. Context retention** — N/A in the strict sense (first phase, nothing earlier to contradict). Forward-looking decisions in DECISION-LOG (Next.js chosen for Phase 2's needs, FIDS board to be finished not dropped in Phase 6, all desktop modes preserved in Phase 12) are consistent with FEATURE-INVENTORY's preservation mandate and don't contradict anything on record.

**11. Security** — N/A mostly; Phase 1 has no auth, no writes, no secrets. The one user-controlled input (`?lang=` query param) is handled safely: `resolveLocale` only ever returns `"he"` or `"en"` regardless of input, so there's no reflected-value or injection surface. No `.env` files present; `.gitignore` already excludes `.env*` while keeping `.env.example`.

**12. Code quality** — 8/10. Small, semantic, accessible markup (`aria-label` on brand link and board preview, `aria-hidden` on decorative marks, `focus-visible` outline styling); RTL-aware CSS using logical properties (`padding-inline`, `border-inline-start/end`, `inset-inline-*`) rather than hardcoded left/right, which is exactly right for a bilingual app. Responsive breakpoints at 900px/680px are deliberate, not copy-pasted magic numbers. One real defect below (finding 1) knocks it down from a 9–10.

**13. Findings**

1. **`<html>` lang/dir don't follow the selected locale (moderate, a11y/SEO).** `app/layout.tsx` hardcodes `<html lang="en">` with no `dir` attribute. The actual locale/direction switch only touches a `<div className="site-shell" lang={locale} dir={copy.direction}>` inside the page. Visually this works because everything is a descendant of that div, but the document root itself always claims English/LTR even when serving `/?lang=he`. Screen readers, browser translation prompts, and search engines primarily key off `<html lang>`, so Hebrew content on this page can be mispronounced or mis-flagged as English. Next.js App Router layouts don't receive page `searchParams`, so fixing this cleanly needs either a cookie/middleware-based locale read in the root layout or a `/[locale]` segment — worth deciding before Phase 3's F-I18N2 (locale-concept cleanup) rather than carrying it forward silently.
2. **Minor:** page `<title>`/`<meta description>` in `layout.tsx` are static English strings regardless of locale. Low stakes for Phase 1 (no `generateMetadata` needed yet), but will want revisiting once i18n is centralized.

No other stubs, rule violations, or plan gaps found.

## Scores (1–10 each)
- inventory_coverage: 10
- rule_adherence: 8
- plan_fidelity: 10
- context_retention: 9
- security: 9
- code_quality: 8
