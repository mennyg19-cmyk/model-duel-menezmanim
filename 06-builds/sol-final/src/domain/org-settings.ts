import type { Organization, ZmanimConfig } from "@prisma/client";

export type OrgSettingsBlob = {
  locale?: {
    uiLocale?: string;
    boardDefaultLocale?: string;
    objectTextLocale?: string;
  };
  kiosk?: {
    defaultDisplayLanguage?: string;
    kioskMode?: boolean;
    hideCursor?: boolean;
    autoStartOnBoot?: boolean;
  };
  displayNames?: Record<string, { english?: string; hebrew?: string }>;
  rabbeinuTam?: {
    type: "minutes" | "degrees";
    value: number;
  };
  adminTheme?: {
    id: "dark" | "light" | "mono-dark" | "mono-light" | "custom";
    custom?: {
      ink?: string;
      muted?: string;
      deep?: string;
      mint?: string;
      gold?: string;
      line?: string;
      panel?: string;
    };
  };
  tutorial?: {
    completedChapters?: string[];
  };
};

export function parseSettingsBlob(raw: string | null | undefined): OrgSettingsBlob {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as OrgSettingsBlob;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function mergeSettingsBlob(existing: OrgSettingsBlob, patch: Partial<OrgSettingsBlob>): OrgSettingsBlob {
  return {
    ...existing,
    ...patch,
    locale: patch.locale ? { ...existing.locale, ...patch.locale } : existing.locale,
    kiosk: patch.kiosk ? { ...existing.kiosk, ...patch.kiosk } : existing.kiosk,
    displayNames: patch.displayNames
      ? { ...existing.displayNames, ...patch.displayNames }
      : existing.displayNames,
    rabbeinuTam: patch.rabbeinuTam ?? existing.rabbeinuTam,
    adminTheme: patch.adminTheme
      ? {
          ...existing.adminTheme,
          ...patch.adminTheme,
          custom: patch.adminTheme.custom
            ? { ...existing.adminTheme?.custom, ...patch.adminTheme.custom }
            : existing.adminTheme?.custom,
        }
      : existing.adminTheme,
    tutorial: patch.tutorial
      ? {
          ...existing.tutorial,
          ...patch.tutorial,
          completedChapters: patch.tutorial.completedChapters ?? existing.tutorial?.completedChapters,
        }
      : existing.tutorial,
  };
}

export function orgSettingsDto(org: Organization, configs: ZmanimConfig[]) {
  const settings = parseSettingsBlob(org.settings);
  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      plan: org.plan,
      latitude: org.latitude,
      longitude: org.longitude,
      elevation: org.elevation,
      timezone: org.timezone,
      dialect: org.dialect,
      candleLightingMinutes: org.candleLightingMinutes,
      shabbatEndType: org.shabbatEndType,
      shabbatEndValue: org.shabbatEndValue,
      rabbeinu_tam_minutes: org.rabbeinu_tam_minutes,
      amPmFormat: org.amPmFormat,
      inIsrael: org.inIsrael,
    },
    settings,
    zmanimConfigs: configs.map((c) => ({
      id: c.id,
      zmanType: c.zmanType,
      authority: c.authority,
      degreesBelow: c.degreesBelow,
      fixedMinutes: c.fixedMinutes,
      earliest: c.earliest,
      latest: c.latest,
      roundTo: c.roundTo,
      offset: c.offset,
    })),
  };
}

export const TEFILAH_DISPLAY_KEYS = [
  "mashivHaruach",
  "moridHatal",
  "veseinTalUmatar",
  "veseinBeracha",
  "yaalehVeyavo",
  "alHanissim",
  "hallel",
  "tachanun",
] as const;
