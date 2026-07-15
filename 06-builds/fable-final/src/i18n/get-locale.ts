import { cookies } from "next/headers";
import { DEFAULT_UI_LOCALE, UI_LOCALE_COOKIE, isUiLocale, type UiLocale } from "./index";

export async function getUiLocale(): Promise<UiLocale> {
  const jar = await cookies();
  const raw = jar.get(UI_LOCALE_COOKIE)?.value;
  return isUiLocale(raw) ? raw : DEFAULT_UI_LOCALE;
}
