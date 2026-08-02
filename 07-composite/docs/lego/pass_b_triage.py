#!/usr/bin/env python3
"""Pass B triage: classify every Pass-A item by whether the composite
(arm-06 base) already has the winning implementation, or whether the gap
to the winner is big enough to be worth an actual code change.

Composite base = arm-06. A winner that isn't arm-06 still gets REJECTED
by the fit-check (and arm-06's own implementation is kept) unless the
score gap is large enough that porting the underlying capability (not
necessarily the literal file) is worth the cohesion cost. This mirrors
manual judgment already applied for R-108/UR-011 (login gap, since fixed).

Buckets:
  - ARM06_WINS      arm-06 already ties or wins -- composite already has it
  - MARGINAL        winner beats arm-06 by <=2 points, no disqualifying
                     flags on arm-06 -- fit-check rejects (cohesion > polish)
  - GAP_REVIEW      winner beats arm-06 by >=3 points, or arm-06 carries a
                     disqualifying flag (MISSING/BROKEN/THEATER/STUB) --
                     needs a human look for a possible real port
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DISQUALIFY = {"MISSING", "BROKEN", "THEATER", "STUB"}


def main():
    items = json.load(open(os.path.join(HERE, "SCORES.json")))
    buckets = {"ARM06_WINS": [], "MARGINAL": [], "GAP_REVIEW": []}

    for item in items:
        scores = item.get("scores", {})
        arm06 = scores.get("arm-06", {})
        arm06_score = arm06.get("score", 0)
        arm06_flags = set(arm06.get("flags") or [])
        winner = item.get("winner")
        winner_score = scores.get(winner, {}).get("score", 0)
        gap = winner_score - arm06_score

        if winner == "arm-06" or gap <= 0:
            buckets["ARM06_WINS"].append(item)
        elif gap >= 3 or (arm06_flags & DISQUALIFY):
            buckets["GAP_REVIEW"].append(item)
        else:
            buckets["MARGINAL"].append(item)

    print(f"ARM06_WINS: {len(buckets['ARM06_WINS'])}")
    print(f"MARGINAL:   {len(buckets['MARGINAL'])}")
    print(f"GAP_REVIEW: {len(buckets['GAP_REVIEW'])}")

    with open(os.path.join(HERE, "pass_b_gap_review.json"), "w") as f:
        json.dump(buckets["GAP_REVIEW"], f, indent=2)
    with open(os.path.join(HERE, "pass_b_marginal.json"), "w") as f:
        json.dump(buckets["MARGINAL"], f, indent=2)

    print("\n=== GAP_REVIEW items (need human review for a possible port) ===")
    for item in buckets["GAP_REVIEW"]:
        s = item["scores"]
        w = item["winner"]
        print(f"{item['id']:8} arm-06={s.get('arm-06',{}).get('score','-')} "
              f"{sorted(s.get('arm-06',{}).get('flags') or [])} "
              f"winner={w}={s.get(w,{}).get('score','-')}  {item.get('name','')[:70]}")


if __name__ == "__main__":
    main()
