# Phase Review — rebuild-b Phase 1

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 1 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 1 — Bilingual marketing entry
- Diff / files touched this phase: `b-p01.patch` is a one-line pointer ("no previous phase; see snapshot tree at b266d74"). Evidence is the snapshot tree itself: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `src/content/landing.ts`, `package.json`, `tsconfig.json`, `README.md`, `.gitignore`, plus copied rules and `.codegraph/.gitignore`.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, use `PHASE-REVIEW-RUBRIC.md`, focus on this phase only, running-app verification optional (static snapshot, no node_modules), say N/A if not run.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist (meta, proof-of-read, inventory, running app, stubs, ponytail, clean-code, workflow, codegraph, git-discipline, plan fidelity, context, security, code quality, findings) + 6 scores 1–10.
- `FEATURE-INVENTORY.md`: canonical truth — 10 routes, 17 models, 12 core caps, 17 widgets, 22 API groups, 26 desktop features, 13 gaps; 269 feature labels. Phase 1 claims `R1`, `P1`, `P1.1–P1.4`, `F-I18N1`.
- `snapshots/b/p01/PHASE-PLAN.md`: 12-phase plan, 354 total labels (269 feature + 85 editor), each label in exactly one phase. Phase 1 = landing + bilingual locale switch.
- `snapshots/b/p01/STATUS.md`: claims Phase 1 complete; lists typecheck/build/audit passes and live HTTP 200 checks at 3102 for `en` and `he`, plus headless responsive checks at 1440×1000 and 500×844.
- `snapshots/b/p01/DECISION-LOG.md`: logs label counting, Next.js + strict TS + PostCSS override, in-code locale seed, finish-FIDS-in-Phase-6, preserve all desktop modes.
- `b-p01.patch`: one-line pointer only; no diff content. Snapshot tree is the evidence.

## Checklist

1. **Inventory coverage** — Claimed IDs: `R1`, `P1`, `P1.1–P1.4`, `F-I18N1`. All PRESENT.
   - `R1` `/`: `app/page.tsx` exports `HomePage` at the App Router root. PRESENT.
   - `P1` / `P1.1` hero + tagline: `eyebrow`, `h1` title, `hero-introduction`. PRESENT.
   - `P1.2` feature highlights: six seeded `feature-card` articles rendered from `copy.features`. PRESENT.
   - `P1.3` CTA to `/register` and `/login`: `Link href="/register"` (primary) and `href="/login"` (secondary), plus access-section register/login links. PRESENT.
   - `P1.4` header nav: brand + nav with features/access anchors, login link, and language switch link. PRESENT.
   - `F-I18N1` (internationalize landing, fix English-only): full Hebrew copy record in `landing.ts`, `?lang=he` selects `he`, `dir={copy.direction}` flips RTL/LTR, `lang` attribute on shell, `[dir="rtl"]` CSS override. PRESENT.

2. **Running app** — N/A. Static snapshot has no `node_modules`; not run by reviewer. STATUS.md records live evidence (HTTP 200 for `en` + `he`, `dir="ltr"`/`dir="rtl"`, six cards, headless responsive checks at two viewports, server stopped). Treated as contestant-claimed, not independently re-verified.

3. **No stubs** — No dead buttons or empty handlers. All CTAs target real `/login`/`/register` paths (Phase 2) or in-page anchors. The board-preview clock is a hardcoded `12:38` string and `previewRows` are static — but this is clearly a marketing mock, not a claimed live widget, so not a stub-as-done.

4. **Rule: ponytail** — Smallest complete diff: Next.js App Router + React only, no extra packages. PostCSS override is justified (zero `npm audit` vulns without downgrading Next). `landing.ts` is a typed local seed — appropriate since Phase 1 has no DB. No unrequested abstractions. No speculative features pulled forward.

5. **Rule: clean-code** — Names state intent (`resolveLocale`, `landingCopy`, `alternateLocale`, `previewRows`). One data-fetching/render pattern. Files split by concern (page / layout / copy / styles), none near 500 lines. No narration comments. Minor drift: `globals.css` introduces hardcoded hex (`#9ee8c8`, `#f1ede2`, `#11231f`, `#53615d`, `#4d806c`, `#081c18`) outside the `:root` token set — slightly inconsistent with the README "no inline colors / one design system" goal, though full enforcement is `F-I18N3` (Phase 9).

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS.md lists concrete verification (typecheck, build, audit, live HTTP, headless responsive) and the server was stopped. PHASE-PLAN documents all 354 labels with no missing/duplicate claims. No speculative product inventing — FIDS finish/drop and desktop scope decisions are logged in DECISION-LOG rather than silently assumed.

7. **Rule: codegraph** — `.codegraph/.gitignore` present, so the arm was initialized once. No structural lookup needed for a single static page; no symbol grep used. N/A for this phase.

8. **Rule: git-discipline** — Contestant must NOT git. No git commands or commit messages in snapshot. STATUS/DECISION explicitly state the orchestrator owns git. Clean.

9. **Todos / PHASE-PLAN fidelity** — PHASE-PLAN Phase 1: responsive landing, header nav, feature explanation, login/register CTAs, bilingual locale switch with correct direction. Done-when: `/` on 3102, locale switch changes copy + direction, feature cards from seed, login/register target Phase 2 paths. All evidenced in snapshot + STATUS.

10. **Context retention** — First phase; no prior work to contradict. PHASE-PLAN maps all 12 phases and 354 labels up front, so later phases have a stable contract. No dropped prior work.

11. **Security** — Static marketing page, no auth, no inputs, no secrets. `.gitignore` excludes `.env*` and keeps `!.env.example`. No trust-boundary surface yet. No concerns.

12. **Code quality** — Clean async server component, typed `Locale`/`LandingCopy`, responsive CSS with `clamp()`, `prefers-reduced-motion`, `:focus-visible` outlines, `aria-label` on nav/preview, logical-property CSS (`inset-inline-*`, `border-inline-*`) for RTL. Craft score 8/10 — solid foundation; deducted for the CSS token drift and a locale-resolution edge case (below).

13. **Findings**
   1. `globals.css` uses several hardcoded hex colors outside the `:root` token set (`#9ee8c8`, `#f1ede2`, `#11231f`, `#53615d`, `#4d806c`, `#081c18`). Inconsistent with the README "one design system / no inline colors" goal; full enforcement lands in Phase 9 (`F-I18N3`), but tokens could be centralized now.
   2. `resolveLocale` only checks `lang === "he"` and ignores array-form `lang` (e.g. `?lang=he&lang=en`), collapsing any array to the `en` default. Minor edge case; `searchParams` type admits `string | string[]`.
   3. Board-preview clock is a static `12:38` string. Acceptable as a marketing mock, but worth flagging so it is not later mistaken for a live widget.

## Scores (1–10)
- inventory_coverage: 10
- rule_adherence: 9
- plan_fidelity: 10
- context_retention: 10
- security: 10
- code_quality: 8
