"use client";

// Live display shell (SH.3/SH.4/SH.7/SH.10): renders the one <Board>, polls the
// display snapshot so schedule boundaries refresh without a full page reload,
// and pings a heartbeat so admins can later see last-seen. Offline falls back
// via the service worker caching /api/display + /show (SH.6).

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DisplaySnapshot } from "@/core/board/types";
import type { DisplayBreakpoint } from "@/core/style-engine";
import { Board } from "@/board/Board";

const STYLE_POLL_MS = 10_000;
const HEARTBEAT_MS = 30_000;

function detectBreakpoint(): DisplayBreakpoint {
  if (typeof window === "undefined") return "full";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1200) return "tablet";
  return "full";
}

export function LiveBoard({
  orgSlug,
  screenId,
  initial,
}: {
  orgSlug: string;
  screenId: string;
  initial: DisplaySnapshot;
}) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [snapshot, setSnapshot] = useState(initial);
  const [breakpoint, setBreakpoint] = useState<DisplayBreakpoint>(initial.breakpoint);
  const lastJson = useRef(JSON.stringify(initial));

  const fetchSnapshot = useCallback(async () => {
    const bp = detectBreakpoint();
    setBreakpoint(bp);
    const qs = new URLSearchParams();
    if (date) qs.set("date", date);
    qs.set("bp", bp);
    try {
      const res = await fetch(`/api/display/${encodeURIComponent(orgSlug)}/${encodeURIComponent(screenId)}?${qs}`);
      if (!res.ok) return;
      const next = (await res.json()) as DisplaySnapshot;
      const raw = JSON.stringify(next);
      if (raw !== lastJson.current) {
        lastJson.current = raw;
        setSnapshot(next);
      }
    } catch {
      // offline: keep current snapshot; SW may have served a cached one already
    }
  }, [orgSlug, screenId, date]);

  useEffect(() => {
    setSnapshot(initial);
    lastJson.current = JSON.stringify(initial);
  }, [initial]);

  useEffect(() => {
    void fetchSnapshot();
    const id = setInterval(() => void fetchSnapshot(), STYLE_POLL_MS);
    return () => clearInterval(id);
  }, [fetchSnapshot]);

  useEffect(() => {
    const beat = () => {
      void fetch(`/api/display/${encodeURIComponent(orgSlug)}/${encodeURIComponent(screenId)}/heartbeat`, {
        method: "POST",
      }).catch(() => {});
    };
    beat();
    const id = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [orgSlug, screenId]);

  useEffect(() => {
    const onResize = () => {
      const bp = detectBreakpoint();
      if (bp !== breakpoint) void fetchSnapshot();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint, fetchSnapshot]);

  return <Board snapshot={{ ...snapshot, breakpoint }} />;
}
