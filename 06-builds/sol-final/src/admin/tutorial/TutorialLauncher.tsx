"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TUTORIAL_CHAPTERS } from "./chapters";

export function TutorialLauncher({
  orgSlug,
  orgId,
  completed,
  onCompleted,
}: {
  orgSlug: string;
  orgId: string;
  completed: string[];
  onCompleted: (ids: string[]) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const chapter = useMemo(
    () => TUTORIAL_CHAPTERS.find((c) => c.id === chapterId) ?? null,
    [chapterId],
  );
  const step = chapter?.steps[stepIndex] ?? null;

  useEffect(() => {
    if (!step) {
      setAnchor(null);
      return;
    }
    const href = step.href?.replaceAll("{orgSlug}", orgSlug);
    if (href && !window.location.href.includes(href.replace(/^\//, "").split("?")[0]!)) {
      router.push(href);
    }
    const timer = window.setTimeout(() => {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setAnchor(el.getBoundingClientRect());
      } else {
        setAnchor(null);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [step, orgSlug, router]);

  async function persist(ids: string[]) {
    onCompleted(ids);
    await fetch(`/api/org/${orgId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorial: { completedChapters: ids } }),
    });
  }

  function finishChapter() {
    if (!chapter) return;
    const next = Array.from(new Set([...completed, chapter.id]));
    void persist(next);
    setChapterId(null);
    setStepIndex(0);
    setOpen(true);
  }

  return (
    <>
      <button type="button" className="adm-chip" data-tutorial="tutorial-open" onClick={() => setOpen(true)}>
        Tutorial
      </button>
      {open && !chapter ? (
        <div className="adm-modalBackdrop" role="presentation" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Admin tutorial</h3>
            <ul className="adm-list">
              {TUTORIAL_CHAPTERS.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="adm-listItem"
                    onClick={() => {
                      setChapterId(c.id);
                      setStepIndex(0);
                      setOpen(false);
                    }}
                  >
                    <strong>{c.title}</strong>
                    <small>{completed.includes(c.id) ? "Completed" : "Not started"}</small>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="button button-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
      {step ? (
        <div className="adm-tutorialOverlay" aria-live="polite">
          {anchor ? (
            <div
              className="adm-tutorialSpotlight"
              style={{
                position: "fixed",
                top: anchor.top - 8,
                left: anchor.left - 8,
                width: anchor.width + 16,
                height: anchor.height + 16,
              }}
            />
          ) : null}
          <div
            className="adm-tutorialCard"
            style={{
              position: "fixed",
              top: Math.min((anchor?.bottom ?? 80) + 12, window.innerHeight - 180),
              left: Math.min(Math.max(16, anchor?.left ?? 16), window.innerWidth - 340),
              width: 320,
            }}
          >
            <strong>
              {chapter?.title}: {step.title}
            </strong>
            <p>{step.body}</p>
            <div className="adm-inlineActions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setChapterId(null);
                  setStepIndex(0);
                }}
              >
                Exit
              </button>
              {stepIndex > 0 ? (
                <button type="button" className="button button-secondary" onClick={() => setStepIndex((i) => i - 1)}>
                  Back
                </button>
              ) : null}
              {chapter && stepIndex < chapter.steps.length - 1 ? (
                <button type="button" className="button" onClick={() => setStepIndex((i) => i + 1)}>
                  Next
                </button>
              ) : (
                <button type="button" className="button" onClick={finishChapter}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
