import { Suspense } from "react";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import { LiveBoard } from "@/board/LiveBoard";
import { Board } from "@/board/Board";

export const dynamic = "force-dynamic";

const DEMO_SLUG = "demo";

/** /show — demo org first screen (smoke-test URL). */
export default async function ShowDemoPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const data = await loadBoardData(DEMO_SLUG);

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0" }}>
        <p>No board configured — run `npm run db:seed`.</p>
      </main>
    );
  }

  const snapshot = buildDisplaySnapshot(data, { now: new Date(), dateOverride: parseDateOverride(date) });

  return (
    <Suspense fallback={<Board snapshot={snapshot} />}>
      <LiveBoard orgSlug={DEMO_SLUG} screenId={data.screen.id} initial={snapshot} />
    </Suspense>
  );
}
