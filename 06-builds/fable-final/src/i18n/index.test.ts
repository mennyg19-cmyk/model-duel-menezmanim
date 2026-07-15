import { describe, expect, it } from "vitest";
import { dirForLocale, t, isUiLocale } from "./index";

describe("i18n", () => {
  it("translates landing keys and falls back", () => {
    expect(t("en", "landing.cta.register")).toMatch(/Create|account/i);
    expect(t("he", "landing.cta.register")).toBeTruthy();
    expect(t("en", "missing.key")).toBe("missing.key");
  });

  it("derives RTL from Hebrew UI locale", () => {
    expect(dirForLocale("he")).toBe("rtl");
    expect(dirForLocale("en")).toBe("ltr");
  });

  it("narrows ui locale", () => {
    expect(isUiLocale("he")).toBe(true);
    expect(isUiLocale("fr")).toBe(false);
  });
});
