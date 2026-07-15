"use client";

import { useRouter } from "next/navigation";
import type { UiLocale } from "@/i18n";

const LABELS: Record<UiLocale, string> = { en: "EN", he: "עברית" };

export function LocaleToggle({ current }: { current: UiLocale }) {
  const router = useRouter();

  async function choose(locale: UiLocale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 13 }}>
      {(Object.keys(LABELS) as UiLocale[]).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => void choose(locale)}
          aria-pressed={locale === current}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid var(--landing-border, rgba(148,163,184,0.35))",
            background: locale === current ? "var(--landing-accent, #fbbf24)" : "transparent",
            color: locale === current ? "var(--landing-accent-text, #0f172a)" : "var(--landing-muted, #94a3b8)",
            cursor: "pointer",
            fontWeight: locale === current ? 700 : 400,
          }}
        >
          {LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
