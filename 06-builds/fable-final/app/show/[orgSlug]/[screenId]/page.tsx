import { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import { LiveBoard } from "@/board/LiveBoard";
import { Board } from "@/board/Board";

export const dynamic = "force-dynamic";

export default async function ScreenBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; screenId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { orgSlug, screenId } = await params;
  const { date } = await searchParams;
  const data = await loadBoardData(orgSlug, screenId);
  if (!data) notFound();

  const snapshot = buildDisplaySnapshot(data, { now: new Date(), dateOverride: parseDateOverride(date) });

  return (
    <Suspense fallback={<Board snapshot={snapshot} />}>
      <LiveBoard orgSlug={orgSlug} screenId={screenId} initial={snapshot} />
    </Suspense>
  );
}
