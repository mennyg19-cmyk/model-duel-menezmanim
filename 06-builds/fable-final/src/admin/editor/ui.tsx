"use client";

import type { CSSProperties, ReactNode } from "react";

export const panelCard: CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  color: "#e2e8f0",
};

export const btn: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 12,
};

export const btnAccent: CSSProperties = {
  ...btn,
  background: "#2563eb",
  borderColor: "#2563eb",
  color: "#fff",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: 12,
};

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#94a3b8" }}>
      {label}
      {children}
    </label>
  );
}

export function Section({
  id,
  title,
  defaultOpen = false,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  open: boolean | undefined;
  onToggle: (id: string, defaultOpen: boolean) => void;
  children: ReactNode;
}) {
  const isOpen = open ?? defaultOpen;
  return (
    <div style={{ borderBottom: "1px solid #334155" }}>
      <button
        type="button"
        onClick={() => onToggle(id, defaultOpen)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {isOpen ? "▾" : "▸"} {title}
      </button>
      {isOpen ? <div style={{ padding: "0 10px 10px", display: "grid", gap: 8 }}>{children}</div> : null}
    </div>
  );
}
