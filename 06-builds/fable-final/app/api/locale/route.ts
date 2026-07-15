import { NextResponse } from "next/server";
import { UI_LOCALE_COOKIE, isUiLocale } from "@/i18n";

export const dynamic = "force-dynamic";

/** Set UI locale cookie (F-I18N1/2). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  if (!isUiLocale(body?.locale)) {
    return NextResponse.json({ error: "locale must be en|he." }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale: body.locale });
  res.cookies.set(UI_LOCALE_COOKIE, body.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
