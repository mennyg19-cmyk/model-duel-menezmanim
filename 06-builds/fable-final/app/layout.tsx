import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { dirForLocale } from "@/i18n";
import { getUiLocale } from "@/i18n/get-locale";

export const metadata: Metadata = {
  title: "MenEZmanim (rebuild A)",
  description: "Zmanim digital-signage system — experiment rebuild arm A",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getUiLocale();
  return (
    <html lang={locale} dir={dirForLocale(locale)}>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "var(--page-bg, #0f172a)", color: "var(--page-fg, #e2e8f0)" }}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
