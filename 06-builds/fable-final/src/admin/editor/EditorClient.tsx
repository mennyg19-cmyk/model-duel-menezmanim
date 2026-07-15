"use client";

import { useEffect, useState } from "react";
import { EditorShell } from "./shell/EditorShell";
import { EditorStoreProvider, type EditorScreenSummary, type EditorStyleSummary } from "./state/StoreProvider";
import type { EditorObject, EditorStyle } from "./types";
import type { StyleActivationRule } from "@/core/style-engine";

export function EditorClient({
  orgId,
  orgSlug,
  previewScreenId,
  style,
  objects,
  styles,
  screens,
  activationRules: initialRules,
}: {
  orgId: string;
  orgSlug: string;
  previewScreenId: string | null;
  style: EditorStyle;
  objects: EditorObject[];
  styles: EditorStyleSummary[];
  screens: EditorScreenSummary[];
  activationRules: StyleActivationRule[];
}) {
  const [activationRules, setActivationRules] = useState(initialRules);
  const [lockLabel, setLockLabel] = useState("Lock…");

  useEffect(() => {
    void fetch(`/api/org/${orgId}/lock`, { method: "POST" })
      .then(async (r) => {
        const j = (await r.json()) as { error?: string; lock?: { isMine?: boolean } };
        if (r.status === 409) setLockLabel("Lock held by another editor");
        else if (r.ok) setLockLabel("Edit lock acquired");
        else setLockLabel(j.error ?? "Lock unavailable");
      })
      .catch(() => setLockLabel("Lock unavailable"));
  }, [orgId]);

  return (
    <EditorStoreProvider
      initialObjects={objects}
      initialStyle={style}
      config={{ orgId, orgSlug, styleId: style.id, previewScreenId, styles, screens, activationRules }}
    >
      <EditorShell
        activationRules={activationRules}
        onActivationChange={setActivationRules}
        lockLabel={lockLabel}
      />
    </EditorStoreProvider>
  );
}
