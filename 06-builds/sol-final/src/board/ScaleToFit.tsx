"use client";

// === What's in this file ===
// Scales a fixed-size board canvas (e.g. 1920x1080) to fit whatever space it's
// shown in, like a TV, a preview pane, or a phone — without changing any of the
// widget coordinates. The board is authored at one resolution and this just zooms
// the whole thing to fit, keeping the aspect ratio (letterboxed, centered).
//
// fitMode "contain" -- whole board visible, centered (the default, for TVs).
// fitMode "width"   -- fill the width and allow vertical scroll (for phones).

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScaleToFitProps {
  width: number;
  height: number;
  fitMode?: "contain" | "width";
  children: ReactNode;
}

export function ScaleToFit({ width, height, fitMode = "contain", children }: ScaleToFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recompute = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const next = fitMode === "width" ? cw / width : Math.min(cw / width, ch / height);
      setScale(next > 0 ? next : 1);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height, fitMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: fitMode === "width" ? "auto" : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: fitMode === "width" ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          width,
          height,
          flex: "none",
          transform: `scale(${scale})`,
          transformOrigin: fitMode === "width" ? "top center" : "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
