"use client";

import { useTutorial } from "./TutorialProvider";

export function TutorialLauncher({ label = "?" }: { label?: string }) {
  const { startTour } = useTutorial();
  return (
    <button
      type="button"
      onClick={() => startTour()}
      aria-label="Start walkthrough"
      data-testid="tutorial-launcher"
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: "1px solid var(--admin-border)",
        background: "var(--admin-surface)",
        color: "var(--admin-text)",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}
