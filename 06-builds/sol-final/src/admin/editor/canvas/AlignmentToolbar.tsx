"use client";

import type { AlignOp } from "../geometry/align";
import { btn } from "../ui";

export function AlignmentToolbar({
  selectedCount,
  onAlign,
  onDistribute,
}: {
  selectedCount: number;
  onAlign: (op: AlignOp) => void;
  onDistribute: (axis: "x" | "y") => void;
}) {
  const disabled1 = selectedCount < 1;
  const disabledMulti = selectedCount < 2;
  const disabledDist = selectedCount < 3;
  const b = (label: string, disabled: boolean, onClick: () => void) => (
    <button type="button" disabled={disabled} onClick={onClick} style={{ ...btn, opacity: disabled ? 0.4 : 1 }} title={label}>
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {b("L", disabled1, () => onAlign("left"))}
      {b("C", disabled1, () => onAlign("centerX"))}
      {b("R", disabled1, () => onAlign("right"))}
      {b("T", disabled1, () => onAlign("top"))}
      {b("M", disabled1, () => onAlign("middleY"))}
      {b("B", disabled1, () => onAlign("bottom"))}
      {b("◎", disabled1, () => {
        onAlign("centerX");
        onAlign("middleY");
      })}
      {b("↔", disabledMulti, () => onAlign("centerX"))}
      {b("↕", disabledMulti, () => onAlign("middleY"))}
      {b("⇔", disabledDist, () => onDistribute("x"))}
      {b("⇕", disabledDist, () => onDistribute("y"))}
    </div>
  );
}
