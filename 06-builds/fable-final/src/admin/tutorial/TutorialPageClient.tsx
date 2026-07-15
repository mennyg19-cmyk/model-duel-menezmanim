"use client";

import { useEffect, useState } from "react";
import { btn, btnAccent, card } from "@/admin/formStyles";
import { chapterNames, loadCompletedChapters, TUTORIAL_STEPS } from "./chapters";
import { useTutorial } from "./TutorialProvider";

export function TutorialPageClient() {
  const { startTour } = useTutorial();
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDone(loadCompletedChapters());
  }, []);

  const chapters: { name: string; steps: string[] }[] = [];
  for (const step of TUTORIAL_STEPS) {
    const last = chapters[chapters.length - 1];
    if (last && last.name === step.chapter) last.steps.push(step.title);
    else chapters.push({ name: step.chapter, steps: [step.title] });
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 22 }} data-tutorial="tutorial-page">
        Tutorial
      </h1>
      <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>
        Guided overlays across the admin. Tooltips use fixed positioning so they stay on-screen while scrolling.
      </p>
      <button type="button" style={btnAccent} onClick={() => startTour()} data-testid="tutorial-start">
        Start the walkthrough
      </button>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 20 }}>
        {chapters.map((chapter) => (
          <div key={chapter.name} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <strong style={{ fontSize: 14 }}>{chapter.name}</strong>
              {done.has(chapter.name) ? (
                <span style={{ fontSize: 11, color: "var(--admin-accent)" }}>Done</span>
              ) : null}
            </div>
            <ul style={{ margin: "10px 0 12px", paddingLeft: 18, fontSize: 13, color: "var(--admin-muted)" }}>
              {chapter.steps.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <button type="button" style={btn} onClick={() => startTour(chapter.name)}>
              Start chapter
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--admin-muted)", marginTop: 16 }}>
        Chapters: {chapterNames().join(" · ")}
      </p>
    </div>
  );
}
