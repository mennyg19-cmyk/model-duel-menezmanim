import { MobileClient } from "./mobile-client";

export default async function MobilePage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const org = params.org?.trim() || "demo";
  const lang = params.lang === "he" ? "he" : "en";

  return <MobileClient orgSlug={org} initialLang={lang} />;
}
