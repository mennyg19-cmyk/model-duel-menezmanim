import { describe, it, expect } from "vitest";
import {
  isScheduleActive,
  evaluateVisibilityRules,
  buildScheduleContext,
  type ScheduleConfig,
  type ScheduleContext,
  type VisibilityRule,
} from "./scheduler";
import { DEFAULT_SCHEDULE_GROUPS } from "./schedule-groups";

function makeContext(overrides: Partial<ScheduleContext> = {}): ScheduleContext {
  return {
    currentTime: new Date(2024, 0, 15, 10, 30), // Mon Jan 15, 2024 10:30
    zmanimTimes: new Map(),
    activeGroupIds: new Set(),
    isDST: false,
    jewishDate: { year: 5784, month: 11, day: 5 }, // 5 Shevat 5784
    timezone: "Asia/Jerusalem",
    ...overrides,
  };
}

describe("isScheduleActive — basic rules", () => {
  it("empty rules = always active", () => {
    const config: ScheduleConfig = { rules: [], combineMode: "all" };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("always rule returns true", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "always" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("day_of_week rule — Monday active", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "day_of_week", mask: "0100000" }], // Mon only
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("day_of_week rule — Tuesday inactive", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "day_of_week", mask: "0010000" }], // Tue only
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(false);
  });

  it("time_range rule — within range", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "time_range", startTime: "09:00", endTime: "12:00" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("time_range rule — outside range", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "time_range", startTime: "14:00", endTime: "18:00" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(false);
  });

  it("gregorian_range rule — Jan 15 in Jan 1-31", () => {
    const config: ScheduleConfig = {
      rules: [
        {
          type: "gregorian_range",
          startMonth: 1,
          startDay: 1,
          endMonth: 1,
          endDay: 31,
        },
      ],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("hebrew_range rule — 5 Teves in Kislev-Shevat range", () => {
    const config: ScheduleConfig = {
      rules: [
        {
          type: "hebrew_range",
          startMonth: 9,
          startDay: 1,
          endMonth: 11,
          endDay: 30,
        },
      ],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });
});

describe("isScheduleActive — combine modes", () => {
  it("combineMode 'all' requires all rules true", () => {
    const config: ScheduleConfig = {
      rules: [
        { type: "always" },
        { type: "day_of_week", mask: "0010000" }, // Tue — false
      ],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(false);
  });

  it("combineMode 'any' requires at least one rule true", () => {
    const config: ScheduleConfig = {
      rules: [
        { type: "day_of_week", mask: "0010000" }, // Tue — false
        { type: "always" }, // true
      ],
      combineMode: "any",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });
});

describe("isScheduleActive — zman trigger", () => {
  it("show after a zman that has already passed", () => {
    const ctx = makeContext({
      zmanimTimes: new Map([["sunrise", new Date(2024, 0, 15, 6, 45)]]),
    });
    const config: ScheduleConfig = {
      rules: [
        {
          type: "zman_trigger",
          zmanType: "sunrise",
          offsetMinutes: 0,
          showBefore: false,
        },
      ],
      combineMode: "all",
    };
    expect(isScheduleActive(config, ctx)).toBe(true);
  });

  it("show before a zman that hasn't arrived yet", () => {
    const ctx = makeContext({
      zmanimTimes: new Map([["sunset", new Date(2024, 0, 15, 16, 50)]]),
    });
    const config: ScheduleConfig = {
      rules: [
        {
          type: "zman_trigger",
          zmanType: "sunset",
          offsetMinutes: 0,
          showBefore: true,
        },
      ],
      combineMode: "all",
    };
    expect(isScheduleActive(config, ctx)).toBe(true);
  });
});

describe("isScheduleActive — DST aware", () => {
  it("standard time rule active when not DST", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "dst_aware", showDuring: "standard" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext({ isDST: false }))).toBe(true);
  });

  it("DST rule inactive when not DST", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "dst_aware", showDuring: "dst" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext({ isDST: false }))).toBe(false);
  });
});

describe("isScheduleActive — one_time", () => {
  it("matches exact date", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "one_time", date: "2024-01-15" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(true);
  });

  it("rejects different date", () => {
    const config: ScheduleConfig = {
      rules: [{ type: "one_time", date: "2024-01-16" }],
      combineMode: "all",
    };
    expect(isScheduleActive(config, makeContext())).toBe(false);
  });
});

describe("evaluateVisibilityRules", () => {
  it("empty rules = visible", () => {
    expect(evaluateVisibilityRules([], new Date(), false)).toBe(true);
  });

  it("show on weekday — Monday is a weekday", () => {
    const rules: VisibilityRule[] = [{ condition: "weekday", show: true }];
    expect(evaluateVisibilityRules(rules, new Date(2024, 0, 15), false)).toBe(
      true,
    );
  });

  it("hide on shabbos — Monday is NOT shabbos, so visible", () => {
    const rules: VisibilityRule[] = [{ condition: "shabbos", show: false }];
    expect(evaluateVisibilityRules(rules, new Date(2024, 0, 15), false)).toBe(
      true,
    );
  });

  it("day_of_week mask — only Mondays", () => {
    const rules: VisibilityRule[] = [
      { condition: "day_of_week", show: true, dayMask: "0100000" },
    ];
    expect(evaluateVisibilityRules(rules, new Date(2024, 0, 15), false)).toBe(
      true,
    );
    expect(evaluateVisibilityRules(rules, new Date(2024, 0, 16), false)).toBe(
      false,
    ); // Tuesday
  });
});

describe("buildScheduleContext", () => {
  it("builds context from a date", () => {
    const ctx = buildScheduleContext(
      new Date(2024, 0, 15, 10, 0),
      "Asia/Jerusalem",
      new Map(),
      new Set(),
    );
    expect(ctx.jewishDate.year).toBe(5784);
    expect(ctx.jewishDate.month).toBe(11); // Shevat (Jan 15 2024 = 5 Shevat 5784)
    expect(ctx.timezone).toBe("Asia/Jerusalem");
  });
});

describe("DEFAULT_SCHEDULE_GROUPS", () => {
  it("has 35 groups", () => {
    expect(DEFAULT_SCHEDULE_GROUPS).toHaveLength(35);
  });

  it("all groups have unique IDs", () => {
    const ids = DEFAULT_SCHEDULE_GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all groups have English and Hebrew names", () => {
    for (const group of DEFAULT_SCHEDULE_GROUPS) {
      expect(group.name).toBeTruthy();
      expect(group.hebrewName).toBeTruthy();
    }
  });
});
