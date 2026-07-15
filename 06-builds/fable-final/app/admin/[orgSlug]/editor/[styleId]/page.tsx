import { notFound, redirect } from "next/navigation";
import { AuthError } from "@/auth/guards";
import { requireOrgBySlug } from "@/auth/org-access";
import { EditorClient } from "@/admin/editor/EditorClient";
import { toEditorObject, toEditorStyle } from "@/admin/editor/map-rows";
import { getStyleWithObjects, listScreens, listStyles } from "@/server/styles-repo";
import type { StyleActivationRule } from "@/core/style-engine";

export const dynamic = "force-dynamic";

export default async function EditorStylePage({
  params,
}: {
  params: Promise<{ orgSlug: string; styleId: string }>;
}) {
  const { orgSlug, styleId } = await params;
  try {
    const { org, role } = await requireOrgBySlug(orgSlug, "editor");
    if (role === "viewer") redirect(`/admin/${orgSlug}`);

    const loaded = await getStyleWithObjects(org.id, styleId);
    if (!loaded) notFound();

    const [screens, allStyles] = await Promise.all([listScreens(org.id), listStyles(org.id)]);
    const previewScreenId =
      screens.find((s) => s.assignedStyleId === styleId)?.id ?? screens[0]?.id ?? null;

    return (
      <EditorClient
        orgId={org.id}
        orgSlug={org.slug}
        previewScreenId={previewScreenId}
        styles={allStyles.map((s) => ({ id: s.id, name: s.name, isDefault: s.isDefault }))}
        screens={screens.map((s) => ({ id: s.id, name: s.name, assignedStyleId: s.assignedStyleId ?? null }))}
        activationRules={(loaded.style.activationRules as StyleActivationRule[] | null) ?? [{ type: "default" }]}
        style={toEditorStyle(loaded.style)}
        objects={loaded.objects.map(toEditorObject)}
      />
    );
  } catch (err) {
    if (err instanceof AuthError) redirect(`/admin/${orgSlug}`);
    throw err;
  }
}
