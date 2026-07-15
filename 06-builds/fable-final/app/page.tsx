import Link from "next/link";
import { getActor } from "@/auth/actor";
import { dirForLocale, t } from "@/i18n";
import { getUiLocale } from "@/i18n/get-locale";
import { LocaleToggle } from "@/i18n/LocaleToggle";

export const dynamic = "force-dynamic";

/** R1 — marketing landing (P1.1–P1.4) with F-I18N1/F-I18N3. */
export default async function LandingPage() {
  const actor = await getActor();
  const locale = await getUiLocale();
  const dir = dirForLocale(locale);

  const features = [
    ["landing.feature.engine.title", "landing.feature.engine.body"],
    ["landing.feature.boards.title", "landing.feature.boards.body"],
    ["landing.feature.tenant.title", "landing.feature.tenant.body"],
  ] as const;

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: "var(--landing-bg)",
        color: "var(--landing-text)",
        // F-I18N3: colors via CSS vars, not hardcoded hex in components.
        ["--landing-bg" as string]: "linear-gradient(160deg, var(--landing-bg-0) 0%, var(--landing-bg-1) 55%, var(--landing-bg-0) 100%)",
        ["--landing-bg-0" as string]: "#0f172a",
        ["--landing-bg-1" as string]: "#1e3a5f",
        ["--landing-text" as string]: "#e2e8f0",
        ["--landing-muted" as string]: "#94a3b8",
        ["--landing-border" as string]: "rgba(148,163,184,0.25)",
        ["--landing-accent" as string]: "#fbbf24",
        ["--landing-accent-text" as string]: "#0f172a",
        ["--landing-link" as string]: "#93c5fd",
        ["--landing-card-bg" as string]: "rgba(15,23,42,0.55)",
        ["--landing-card-border" as string]: "#334155",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          borderBottom: "1px solid var(--landing-border)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 18, letterSpacing: 0.3 }}>{t(locale, "landing.brand")}</strong>
        <nav style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <LocaleToggle current={locale} />
          <Link href="/show/demo" style={{ color: "var(--landing-muted)", textDecoration: "none" }}>
            {t(locale, "landing.nav.demo")}
          </Link>
          {actor ? (
            <Link href="/admin" style={{ color: "var(--landing-link)", textDecoration: "none" }}>
              {t(locale, "landing.nav.admin")}
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: "var(--landing-link)", textDecoration: "none" }}>
                {t(locale, "landing.nav.login")}
              </Link>
              <Link
                href="/register"
                style={{
                  background: "var(--landing-accent)",
                  color: "var(--landing-accent-text)",
                  padding: "8px 14px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {t(locale, "landing.nav.register")}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 96px" }}>
        <p style={{ color: "var(--landing-accent)", fontWeight: 600, marginBottom: 12 }}>{t(locale, "landing.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.15, margin: "0 0 16px" }}>
          {t(locale, "landing.hero.title")}
        </h1>
        <p style={{ fontSize: 18, color: "var(--landing-muted)", maxWidth: 560, marginBottom: 28 }}>
          {t(locale, "landing.hero.body")}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
          <Link
            href="/register"
            style={{
              background: "var(--landing-accent)",
              color: "var(--landing-accent-text)",
              padding: "12px 20px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {t(locale, "landing.cta.register")}
          </Link>
          <Link
            href="/login"
            style={{
              border: "1px solid var(--landing-muted)",
              color: "var(--landing-text)",
              padding: "12px 20px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            {t(locale, "landing.cta.login")}
          </Link>
        </div>

        <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {features.map(([titleKey, bodyKey]) => (
            <div
              key={titleKey}
              style={{
                background: "var(--landing-card-bg)",
                border: "1px solid var(--landing-card-border)",
                borderRadius: 10,
                padding: 18,
              }}
            >
              <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>{t(locale, titleKey)}</h2>
              <p style={{ margin: 0, color: "var(--landing-muted)", fontSize: 14 }}>{t(locale, bodyKey)}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
