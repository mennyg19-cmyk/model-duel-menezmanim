# Blind final review rubric (Test 1)

Rate **both** arms independently. Do **not** guess or mention which model built which. Paths are labels only: `rebuild-a` and `rebuild-b`.

## Required reading (IN FULL before scoring)

1. `results/SCORECARD.md` — Test 1 criteria
2. `inventory/FEATURE-INVENTORY.md` + `inventory/EDITOR-INVENTORY.md` — frozen IDs
3. Each arm: `STATUS.md`, `PHASE-PLAN.md`, `DECISION-LOG.md`
4. Spot-check code under each arm for claimed coverage (admin, display, sync, desktop, import)
5. Optionally skim `results/phase-reviews/` for discipline/context signals — do not treat prior scores as your own

## Deliverable structure

Write one markdown file with:

### Proof-of-read
3–5 lines per required source group.

### Arm rebuild-a
- Inventory coverage summary (strong / mixed / weak) with 5–10 concrete ID examples PRESENT/PARTIAL/MISSING
- Rule adherence (six always-on) notes
- Phase discipline / plan fidelity
- Code quality (1–10) + why
- Context retention (1–10)
- Security / stubs (1–10)
- Running-app notes (ports: A=3101, B=3102) — what you verified or blockers
- **Subtotals (integers):** inventory_coverage/12, rule_adherence/8, phase_discipline/6, code_quality/6, context_retention/4, security_stubs/4 → **arm_total/40**

### Arm rebuild-b
Same sections and same subtotal schema.

### Head-to-head
1–2 paragraphs: which arm is stronger on inventory, which on craft/security, overall preference for Test 1 build quality **without naming models**.

### Explicit scores table

| Criterion | rebuild-a | rebuild-b | Max |
|---|---|---|---|
| inventory_coverage | | | 12 |
| rule_adherence | | | 8 |
| phase_discipline | | | 6 |
| code_quality | | | 6 |
| context_retention | | | 4 |
| security_stubs | | | 4 |
| **total** | | | **40** |
