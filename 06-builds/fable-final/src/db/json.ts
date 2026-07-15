// === What's in this file ===
// Every JSON column in the database has its shape defined here, ONCE. The table
// definitions (schema.ts) use these types, and the read/write codecs (zod.ts)
// validate against these same schemas. That single source is what stops the
// "the column says one thing, the code expects another" drift (fix F-DB-DRIFT).
//
// The rule shapes are the rules engine's territory (Phase C: src/core/scheduler
// and src/core/style-engine). This file mirrors those exact unions in Zod so a
// malformed rule is rejected at the DB boundary, and re-exports the core TS types
// so the tables and the engine speak the same language. Widget *content*
// (displayObjectContentSchema) stays permissive on purpose: each widget owns its
// own content schema in the Phase W registry, validated there.
//
// orgSettingsSchema -- the open settings bag on an org (D1.settings).
// scheduleRuleSchema / scheduleRulesSchema -- the rich per-object/group/announcement/
//   media visibility rules (D8/D9/D12/D15), mirroring core/scheduler ScheduleRule.
// styleActivationRulesSchema -- a style's legacy activation rules (D7, read-only for import).
// screenStyleSchedulesSchema -- per-screen, breakpoint-aware style picks (D2.styleSchedules).
// scheduleGroupVisibilitySchema -- per-object map of group id -> visible (D8).
// displayObjectContentSchema -- a widget's own content blob (kept permissive; registry owns it).
// minyanDetailsSchema -- the advanced minyan options blob (D11.details).
// scheduleGroupIdsSchema -- the groups a minyan belongs to (D11.scheduleGroupIds).
// recurrenceRuleSchema -- a sponsor's recurrence rule (D14.recurrenceRule).
// syncPayloadSchema -- the row snapshot carried by a sync log entry (D17.data).

// drizzle-zod (0.8) speaks Zod v4, so the codecs that feed into it must too.
// zod 3.25 ships v4 under this subpath; shared-contract stays on plain v3.
import { z } from "zod/v4";
import type { ScheduleRule as CoreScheduleRule } from "@/core/scheduler";
import type {
  ScreenStyleSchedule as CoreScreenStyleSchedule,
  StyleActivationRule as CoreStyleActivationRule,
  StyleScheduleRule as CoreStyleScheduleRule,
} from "@/core/style-engine";

const jsonObject = z.record(z.string(), z.unknown());

export const orgSettingsSchema = jsonObject;
export type OrgSettings = z.infer<typeof orgSettingsSchema>;

// ── Per-object / group / announcement / media visibility rules (core/scheduler) ──

const gregorianRangeRule = z.object({
  type: z.literal("gregorian_range"),
  startMonth: z.number().int(),
  startDay: z.number().int(),
  endMonth: z.number().int(),
  endDay: z.number().int(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
});

const hebrewRangeRule = z.object({
  type: z.literal("hebrew_range"),
  startMonth: z.number().int(),
  startDay: z.number().int(),
  endMonth: z.number().int(),
  endDay: z.number().int(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
});

const dayOfWeekRule = z.object({
  type: z.literal("day_of_week"),
  mask: z.string(),
});

const timeRangeRule = z.object({
  type: z.literal("time_range"),
  startTime: z.string(),
  endTime: z.string(),
});

const dstAwareRule = z.object({
  type: z.literal("dst_aware"),
  showDuring: z.enum(["dst", "standard", "both"]),
});

const zmanTriggerRule = z.object({
  type: z.literal("zman_trigger"),
  zmanType: z.string(),
  offsetMinutes: z.number(),
  showBefore: z.boolean(),
});

const groupTriggerRule = z.object({
  type: z.literal("group_trigger"),
  groupIds: z.array(z.string()),
  showWhenActive: z.boolean(),
});

const recurringRule = z.object({
  type: z.literal("recurring"),
  frequency: z.enum([
    "daily",
    "weekly",
    "monthly_gregorian",
    "monthly_hebrew",
    "yearly_gregorian",
    "yearly_hebrew",
  ]),
  interval: z.number().int(),
  dayOfMonth: z.number().int().optional(),
  monthOfYear: z.number().int().optional(),
});

const oneTimeRule = z.object({ type: z.literal("one_time"), date: z.string() });
const alwaysRule = z.object({ type: z.literal("always") });

export const scheduleRuleSchema = z.discriminatedUnion("type", [
  gregorianRangeRule,
  hebrewRangeRule,
  dayOfWeekRule,
  timeRangeRule,
  dstAwareRule,
  zmanTriggerRule,
  groupTriggerRule,
  recurringRule,
  oneTimeRule,
  alwaysRule,
]);
export const scheduleRulesSchema: z.ZodType<CoreScheduleRule[]> = z.array(scheduleRuleSchema);
export type ScheduleRule = CoreScheduleRule;

// ── A style's legacy activation rules (D7, read-only for import) ─────────────────

export const styleActivationRuleSchema = z.object({
  type: z.enum(["hebrew_date_range", "gregorian_date_range", "default"]),
  startMonth: z.number().int().optional(),
  startDay: z.number().int().optional(),
  endMonth: z.number().int().optional(),
  endDay: z.number().int().optional(),
});
export const styleActivationRulesSchema: z.ZodType<CoreStyleActivationRule[]> = z.array(styleActivationRuleSchema);
export type StyleActivationRule = CoreStyleActivationRule;

// ── Per-screen breakpoint-aware style scheduling (D2.styleSchedules) ─────────────

const styleScheduleRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("default") }),
  z.object({
    type: z.literal("hebrew_date_range"),
    startMonth: z.number().int(),
    startDay: z.number().int(),
    endMonth: z.number().int(),
    endDay: z.number().int(),
  }),
  z.object({
    type: z.literal("gregorian_date_range"),
    startMonth: z.number().int(),
    startDay: z.number().int(),
    endMonth: z.number().int(),
    endDay: z.number().int(),
  }),
  z.object({ type: z.literal("hebrew_month"), month: z.number().int() }),
  z.object({ type: z.literal("gregorian_month"), month: z.number().int() }),
  z.object({ type: z.literal("day_of_week"), days: z.array(z.number().int()) }),
  z.object({ type: z.literal("day_type"), dayType: z.string() }),
  z.object({ type: z.literal("week_of_month"), week: z.number().int() }),
]) as z.ZodType<CoreStyleScheduleRule>;

export const screenStyleScheduleSchema = z.object({
  id: z.string(),
  styleId: z.string(),
  breakpoint: z.enum(["mobile", "tablet", "full", "all"]),
  rules: z.array(styleScheduleRuleSchema),
  priority: z.number().int(),
}) as z.ZodType<CoreScreenStyleSchedule>;
export const screenStyleSchedulesSchema: z.ZodType<CoreScreenStyleSchedule[]> = z.array(screenStyleScheduleSchema);
export type ScreenStyleSchedule = CoreScreenStyleSchedule;

// ── The remaining JSON blobs ─────────────────────────────────────────────────────

export const scheduleGroupVisibilitySchema = z.record(z.string(), z.boolean());
export type ScheduleGroupVisibility = z.infer<typeof scheduleGroupVisibilitySchema>;

// Widget content is the Phase W registry's territory (each widget owns its schema),
// so here it is only required to be a well-formed object.
export const displayObjectContentSchema = jsonObject;
export type DisplayObjectContent = z.infer<typeof displayObjectContentSchema>;

export const minyanDetailsSchema = z
  .object({
    durationMinutes: z.number().int().nonnegative().optional(),
    nearestEventWindowMinutes: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    notesHebrew: z.string().optional(),
    isPlaceholder: z.boolean().optional(),
    rowVisibility: z.enum(["inherit", "show", "hide"]).optional(),
    refreshMode: z.string().optional(),
    refreshBasis: z.string().optional(),
    refreshAnchor: z.string().optional(),
    hideIfMinMaxReached: z.boolean().optional(),
    placeholder: z.string().optional(),
    displayOffset: z.number().optional(),
    visibilityRules: scheduleRulesSchema.optional(),
    visibilityCombineMode: z.enum(["all", "any"]).optional(),
  })
  .catchall(z.unknown());
export type MinyanDetails = z.infer<typeof minyanDetailsSchema>;

export const scheduleGroupIdsSchema = z.array(z.string());
export type ScheduleGroupIds = z.infer<typeof scheduleGroupIdsSchema>;

export const recurrenceRuleSchema = jsonObject;
export type RecurrenceRule = z.infer<typeof recurrenceRuleSchema>;

export const syncPayloadSchema = jsonObject;
export type SyncPayload = z.infer<typeof syncPayloadSchema>;
