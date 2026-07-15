import { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import { LiveBoard } from "@/board/LiveBoard";
import { Board } from "@/board/Board";

export const dynamic = "force-dynamic";

/** /show/:orgSlug — first screen for that org (handy share URL). */
export default async function OrgBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { orgSlug } = await params;
  const { date } = await searchParams;
  const data = await loadBoardData(orgSlug);
  if (!data) notFound();

  const snapshot = buildDisplaySnapshot(data, { now: new Date(), dateOverride: parseDateOverride(date) });

  return (
    <Suspense fallback={<Board snapshot={snapshot} />}>
      <LiveBoard orgSlug={orgSlug} screenId={data.screen.id} initial={snapshot} />
    </Suspense>
  );
}
