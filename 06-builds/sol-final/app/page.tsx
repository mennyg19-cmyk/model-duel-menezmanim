import Link from "next/link";
import { landingCopy, type Locale } from "../src/content/landing";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

function resolveLocale(lang: string | string[] | undefined): Locale {
  return lang === "he" ? "he" : "en";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const locale = resolveLocale((await searchParams).lang);
  const copy = landingCopy[locale];
  const alternateLocale = locale === "en" ? "he" : "en";

  return (
    <div className="site-shell" lang={locale} dir={copy.direction}>
      <header className="site-header">
        <Link className="brand" href={`/?lang=${locale}`} aria-label="MenEZmanim home">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>MenEZmanim</span>
        </Link>

        <nav className="header-nav" aria-label="Primary navigation">
          <a href="#features">{copy.nav.features}</a>
          <a href="#access">{copy.nav.access}</a>
          <Link href="/login">{copy.nav.login}</Link>
          <Link className="language-link" href={`/?lang=${alternateLocale}`}>
            {copy.languageName}
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="hero-introduction">{copy.introduction}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/register">
                {copy.primaryAction}
              </Link>
              <Link className="button button-secondary" href="/login">
                {copy.secondaryAction}
              </Link>
            </div>
          </div>

          <div className="board-preview" aria-label={copy.previewLabel}>
            <div className="board-topline">
              <span>{copy.previewLabel}</span>
              <span className="live-indicator">
                <i aria-hidden="true" />
                LIVE
              </span>
            </div>
            <div className="board-date">{copy.previewDate}</div>
            <div className="board-clock">12:38</div>
            <div className="board-rows">
              {copy.previewRows.map((row) => (
                <div className="board-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.time}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <h2>{copy.featuresHeading}</h2>
            <p>{copy.featuresIntroduction}</p>
          </div>
          <div className="feature-grid">
            {copy.features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <span>{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="access-section" id="access">
          <div>
            <p className="eyebrow">MenEZmanim</p>
            <h2>{copy.accessHeading}</h2>
            <p>{copy.accessDescription}</p>
          </div>
          <div className="access-actions">
            <Link className="button button-light" href="/register">
              {copy.registerAction}
            </Link>
            <Link className="text-link" href="/login">
              {copy.signInAction}
            </Link>
          </div>
        </section>
      </main>

      <footer>
        <span>{copy.footer}</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
