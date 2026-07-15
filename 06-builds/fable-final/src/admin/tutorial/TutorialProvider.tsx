"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  saveCompletedChapter,
  TUTORIAL_SEEN_KEY,
  TUTORIAL_STEPS,
} from "./chapters";

interface TutorialContextValue {
  startTour: (fromChapter?: string) => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial(): TutorialContextValue {
  const value = useContext(TutorialContext);
  if (!value) throw new Error("useTutorial must be used inside TutorialProvider");
  return value;
}

const CARD_WIDTH = 320;
const CARD_GAP = 12;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const startTour = useCallback((fromChapter?: string) => {
    if (fromChapter) {
      const i = TUTORIAL_STEPS.findIndex((s) => s.chapter === fromChapter);
      setStepIndex(i >= 0 ? i : 0);
      return;
    }
    setStepIndex(0);
  }, []);

  const finish = useCallback(() => {
    setStepIndex(null);
    setRect(null);
    try {
      window.localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(TUTORIAL_SEEN_KEY) === "1";
    } catch {
      seen = true;
    }
    if (!seen) {
      const timer = window.setTimeout(() => setStepIndex(0), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useLayoutEffect(() => {
    if (stepIndex === null) return;
    const step = TUTORIAL_STEPS[stepIndex];
    if (!step) return;

    function measure() {
      const el = document.querySelector(`[data-tutorial="${step!.hook}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    }

    const el = document.querySelector(`[data-tutorial="${step.hook}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [stepIndex]);

  const step = stepIndex === null ? null : TUTORIAL_STEPS[stepIndex];
  const isLast = stepIndex !== null && stepIndex === TUTORIAL_STEPS.length - 1;

  function goNext() {
    if (stepIndex === null || !step) return;
    const next = stepIndex + 1;
    const nextStep = TUTORIAL_STEPS[next];
    if (!nextStep || nextStep.chapter !== step.chapter) {
      saveCompletedChapter(step.chapter);
    }
    if (isLast) finish();
    else setStepIndex(next);
  }

  return (
    <TutorialContext.Provider value={{ startTour }}>
      {children}
      {step ? (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
          role="dialog"
          aria-label="Admin walkthrough"
          data-testid="tutorial-overlay"
        >
          {rect ? (
            <div
              style={{
                pointerEvents: "none",
                position: "fixed",
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                borderRadius: 8,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                outline: "2px solid var(--admin-accent)",
              }}
            />
          ) : (
            <div style={{ pointerEvents: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          )}

          <TutorialCard
            rect={rect}
            chapter={step.chapter}
            title={step.title}
            body={step.body}
            index={stepIndex!}
            total={TUTORIAL_STEPS.length}
            isLast={isLast}
            onBack={() => setStepIndex((i) => Math.max(0, (i ?? 0) - 1))}
            onNext={goNext}
            onSkip={finish}
          />
        </div>
      ) : null}
    </TutorialContext.Provider>
  );
}

function TutorialCard({
  rect,
  chapter,
  title,
  body,
  index,
  total,
  isLast,
  onBack,
  onNext,
  onSkip,
}: {
  rect: DOMRect | null;
  chapter: string;
  title: string;
  body: string;
  index: number;
  total: number;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const position = cardPosition(rect);
  const btn: CSSProperties = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid var(--admin-border)",
    background: "var(--admin-surface)",
    color: "var(--admin-text)",
    cursor: "pointer",
    fontSize: 13,
  };
  return (
    <div
      style={{
        pointerEvents: "auto",
        position: "fixed",
        width: CARD_WIDTH,
        borderRadius: 10,
        border: "1px solid var(--admin-border)",
        background: "var(--admin-surface)",
        color: "var(--admin-text)",
        padding: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        ...position,
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: "var(--admin-muted)" }}>
        {chapter} — step {index + 1} of {total}
      </p>
      <h3 style={{ margin: "6px 0 0", fontSize: 14 }}>{title}</h3>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--admin-muted)", lineHeight: 1.4 }}>{body}</p>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" style={btn} onClick={onSkip}>
          Skip
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" style={btn} onClick={onBack} disabled={index === 0}>
            Back
          </button>
          <button
            type="button"
            style={{ ...btn, background: "var(--admin-accent)", color: "var(--admin-accent-text)", borderColor: "var(--admin-accent)" }}
            onClick={onNext}
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Fixed positioning so the card stays on-screen inside scroll regions (P11). */
function cardPosition(rect: DOMRect | null): CSSProperties {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  const belowSpace = window.innerHeight - rect.bottom;
  const top = belowSpace > 200 ? rect.bottom + CARD_GAP : Math.max(CARD_GAP, rect.top - 200 - CARD_GAP);
  const left = Math.min(Math.max(CARD_GAP, rect.left), window.innerWidth - CARD_WIDTH - CARD_GAP);
  return { top, left };
}
