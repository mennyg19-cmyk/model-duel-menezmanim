/**
 * F-I18N2 — three distinct language concepts (never one vague "language"):
 * 1. UI locale — chrome (menus, landing). Cookie `ui-locale`.
 * 2. Board default locale — org setting `defaultDisplayLanguage` (hebrew|english|both).
 * 3. Object text locale — per DisplayObject `language` field in the editor.
 * RTL always follows UI locale (Hebrew → rtl).
 */

import en from "./messages/en.json";
import he from "./messages/he.json";

export const UI_LOCALES = ["en", "he"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const DEFAULT_UI_LOCALE: UiLocale = "en";
export const UI_LOCALE_COOKIE = "ui-locale";

/** Board default: what the wall display prefers (org settings). */
export type BoardDefaultLocale = "hebrew" | "english" | "both";

/** Per-widget text language on a DisplayObject. */
export type ObjectTextLocale = "hebrew" | "english" | "yiddish" | "both";

const RTL_LOCALES = new Set<UiLocale>(["he"]);
const MESSAGES: Record<UiLocale, Record<string, string>> = { en, he };

export function isUiLocale(value: string | undefined | null): value is UiLocale {
  return value != null && (UI_LOCALES as readonly string[]).includes(value);
}

export function dirForLocale(locale: UiLocale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/** F-I18N3 — every chrome string goes through t(). */
export function t(locale: UiLocale, key: string): string {
  return MESSAGES[locale][key] ?? MESSAGES[DEFAULT_UI_LOCALE][key] ?? key;
}
