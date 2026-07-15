import { NextResponse } from "next/server";
import { requireSuperAdmin } from "../../../../src/domain/super-admin";
import { reseedDemoOrganization } from "../../../../src/domain/org-clone";

/** E21 reseed demo. */
export async function POST() {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  try {
    const result = await reseedDemoOrganization();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Reseed failed" }, { status: 400 });
  }
}
