#!/usr/bin/env python3
"""Aggregate LEGO Pass-A batch grading files into SCORES.json + MATRIX.md.

Reads every docs/lego/batches/*.json produced by the grading subagents,
concatenates them in a stable order, and emits:
  - docs/lego/SCORES.json  (flat array, all 238 items)
  - docs/lego/MATRIX.md    (one big human table + win-count summary)
"""
import json
import glob
import os

HERE = os.path.dirname(os.path.abspath(__file__))
BATCH_DIR = os.path.join(HERE, "batches")
ARMS = ["arm-01", "arm-02", "arm-03", "arm-04", "arm-05", "arm-06"]

BATCH_ORDER = [
    "batch-01-storefront-order-builder.json",
    "batch-02-checkout-account-lifecycle.json",
    "batch-03-admin-ops-catalog-inventory.json",
    "batch-04-fulfillment-email.json",
    "batch-05-reporting-config-design.json",
    "batch-06-auth-security.json",
    "batch-07-data-model.json",
    "batch-08-integrations.json",
    "batch-09-ur-requirements.json",
    "batch-10-g-checklist.json",
]


def load_batches():
    items = []
    missing = []
    for name in BATCH_ORDER:
        path = os.path.join(BATCH_DIR, name)
        if not os.path.exists(path):
            missing.append(name)
            continue
        with open(path) as f:
            data = json.load(f)
        for item in data:
            item["_batch"] = name
        items.extend(data)
    return items, missing


def win_counts(items):
    counts = {a: 0 for a in ARMS}
    for item in items:
        w = item.get("winner")
        if w in counts:
            counts[w] += 1
    return counts


def fmt_score(cell):
    if not cell:
        return "-"
    s = cell.get("score", "-")
    flags = cell.get("flags") or []
    if flags:
        return f"{s} ({','.join(flags)})"
    return str(s)


def write_matrix(items, missing):
    lines = []
    lines.append("# LEGO Pass A — full score matrix\n")
    lines.append(f"Total items scored: **{len(items)}** / 238\n")
    if missing:
        lines.append(f"\n**Missing batches (not yet graded):** {', '.join(missing)}\n")
    counts = win_counts(items)
    lines.append("\n## Winner tally (Pass A, before Pass B fit-check)\n")
    lines.append("| Arm | Items won |")
    lines.append("|---|---:|")
    for a in ARMS:
        lines.append(f"| {a} | {counts[a]} |")
    lines.append("")
    lines.append("## Full matrix\n")
    lines.append("| ID | Name | " + " | ".join(ARMS) + " | Winner | Runner-up |")
    lines.append("|---|---|" + "---|" * len(ARMS) + "---|---|")
    for item in items:
        scores = item.get("scores", {})
        row = [item.get("id", "?"), (item.get("name") or "").replace("|", "/")]
        for a in ARMS:
            row.append(fmt_score(scores.get(a)))
        row.append(item.get("winner", "-"))
        row.append(item.get("runner_up", "-"))
        lines.append("| " + " | ".join(row) + " |")
    with open(os.path.join(HERE, "MATRIX.md"), "w") as f:
        f.write("\n".join(lines) + "\n")


def main():
    items, missing = load_batches()
    with open(os.path.join(HERE, "SCORES.json"), "w") as f:
        json.dump(items, f, indent=2)
    write_matrix(items, missing)
    print(f"Wrote {len(items)} items ({len(missing)} batches missing: {missing})")


if __name__ == "__main__":
    main()
