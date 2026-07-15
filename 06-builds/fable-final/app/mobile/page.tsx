import { notFound } from "next/navigation";
import { loadBoardData, parseDateOverride } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";
import { MobileView } from "@/mobile/MobileView";

export const dynamic = "force-dynamic";

/** R7 — congregant mobile view. Org via ?org=slug (M.5); optional ?date=YYYY-MM-DD (M.6). */
export default async function MobilePage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; date?: string }>;
}) {
  const { org: orgSlug, date } = await searchParams;
  if (!orgSlug?.trim()) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 420, margin: "40px auto" }}>
        <h1 style={{ fontSize: 20 }}>Mobile view</h1>
        <p style={{ color: "#64748b" }}>Add <code>?org=your-slug</code> (e.g. <code>/mobile?org=demo</code>).</p>
      </main>
    );
  }

  const data = await loadBoardData(orgSlug.trim());
  if (!data) notFound();

  const dateOverride = parseDateOverride(date);
  const snapshot = buildDisplaySnapshot(data, {
    now: new Date(),
    dateOverride: dateOverride ?? undefined,
    breakpoint: "mobile",
    mode: "mobile",
  });

  return (
    <MobileView
      orgSlug={orgSlug.trim()}
      orgName={snapshot.org.name}
      effectiveDate={snapshot.effectiveDate}
      hasDateOverride={Boolean(dateOverride)}
      shared={snapshot.data}
    />
  );
}
