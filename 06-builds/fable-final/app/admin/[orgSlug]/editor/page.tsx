import { redirect } from "next/navigation";
import { AuthError } from "@/auth/guards";
import { requireOrgBySlug } from "@/auth/org-access";
import { listStyles } from "@/server/styles-repo";

export const dynamic = "force-dynamic";

/** P6 — open default/first style in the visual editor. */
export default async function EditorIndexPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  try {
    const { org } = await requireOrgBySlug(orgSlug, "editor");
    const styles = await listStyles(org.id);
    const preferred = styles.find((s) => s.isDefault) ?? styles[0];
    if (!preferred) {
      // Create via API would need client; redirect to dashboard with note — seed always has styles.
      redirect(`/admin/${orgSlug}`);
    }
    redirect(`/admin/${orgSlug}/editor/${preferred.id}`);
  } catch (err) {
    if (err instanceof AuthError) redirect(`/login`);
    throw err;
  }
}
