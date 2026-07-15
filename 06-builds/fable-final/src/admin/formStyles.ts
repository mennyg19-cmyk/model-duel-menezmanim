import type { CSSProperties } from "react";

/** Shared admin form styles for Phase 8 pages. */
export const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, marginBottom: 10 };
export const input: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-surface)",
  color: "var(--admin-text)",
  fontSize: 13,
};
export const btn: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-surface)",
  color: "var(--admin-text)",
  cursor: "pointer",
  fontSize: 13,
};
export const btnAccent: CSSProperties = {
  ...btn,
  background: "var(--admin-accent)",
  borderColor: "var(--admin-accent)",
  color: "var(--admin-accent-text)",
};
export const btnDanger: CSSProperties = {
  ...btn,
  borderColor: "var(--admin-danger)",
  color: "var(--admin-danger)",
};
export const card: CSSProperties = {
  border: "1px solid var(--admin-border)",
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
  background: "var(--admin-surface)",
};
export const tabBtn = (active: boolean): CSSProperties => ({
  ...btn,
  background: active ? "var(--admin-accent)" : "transparent",
  color: active ? "var(--admin-accent-text)" : "var(--admin-text)",
  borderColor: active ? "var(--admin-accent)" : "var(--admin-border)",
});
