import { notFound, redirect } from "next/navigation";
import { EditorClient } from "@/admin/editor/EditorClient";
import { toEditorObject, toEditorStyle } from "@/admin/editor/map-rows";
import type { EditorObject } from "@/admin/editor/types";
import { getSessionUser } from "@/auth/session";
import type { StyleActivationRule } from "@/core/style-engine";
import { prisma } from "@/db/client";

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function VisualEditorPage({
  params,
}: {
  params: Promise<{ orgSlug: string; styleId?: string[] }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { orgSlug, styleId: styleParts } = await params;
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      memberships: { where: { userId: session.id } },
      styles: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { displayObjects: { orderBy: [{ layer: "asc" }, { createdAt: "asc" }] } },
      },
      screens: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!org) notFound();

  const membership = org.memberships[0];
  if (!session.isSuperAdmin && (!membership || !["owner", "admin", "editor"].includes(membership.role))) {
    redirect("/admin");
  }

  const requestedStyleId = styleParts?.[0];
  const row =
    org.styles.find((candidate) => candidate.id === requestedStyleId) ??
    org.styles.find((candidate) => candidate.isDefault) ??
    org.styles[0];
  if (!row) notFound();

  const objects = row.displayObjects.map((objectRow) =>
    toEditorObject({
      ...objectRow,
      content: parseJson<Record<string, unknown>>(objectRow.content, {}),
      scheduleRules: parseJson<EditorObject["scheduleRules"]>(objectRow.scheduleRules, null),
      scheduleGroupVisibility: parseJson<EditorObject["scheduleGroupVisibility"]>(
        objectRow.scheduleGroupVisibility,
        null,
      ),
    }),
  );
  const activationRules = parseJson<StyleActivationRule[]>(row.activationRules, [{ type: "default" }]);
  const previewScreen =
    org.screens.find((screen) => screen.assignedStyleId === row.id) ?? org.screens[0] ?? null;

  return (
    <EditorClient
      orgId={org.id}
      orgSlug={org.slug}
      previewScreenId={previewScreen?.id ?? null}
      style={toEditorStyle({
        ...row,
        activationRules,
      })}
      objects={objects}
      styles={org.styles.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        isDefault: candidate.isDefault,
      }))}
      screens={org.screens.map((screen) => ({
        id: screen.id,
        name: screen.name,
        assignedStyleId: screen.assignedStyleId,
      }))}
      activationRules={activationRules}
    />
  );
}
