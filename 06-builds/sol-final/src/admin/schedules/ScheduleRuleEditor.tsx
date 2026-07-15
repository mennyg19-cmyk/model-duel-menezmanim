"use client";

import { useMemo, type CSSProperties } from "react";
import type { ScheduleRule } from "@/core/scheduler";
import { ZmanType } from "@/core/halachic-opinions";

const RULE_TYPES: ScheduleRule["type"][] = [
  "always",
  "day_of_week",
  "time_range",
  "gregorian_range",
  "hebrew_range",
  "dst_aware",
  "zman_trigger",
  "group_trigger",
  "recurring",
  "one_time",
];

function emptyRule(type: ScheduleRule["type"]): ScheduleRule {
  switch (type) {
    case "always":
      return { type: "always" };
    case "day_of_week":
      return { type: "day_of_week", mask: "1111111" };
    case "time_range":
      return { type: "time_range", startTime: "06:00", endTime: "12:00" };
    case "gregorian_range":
      return { type: "gregorian_range", startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 };
    case "hebrew_range":
      return { type: "hebrew_range", startMonth: 1, startDay: 1, endMonth: 12, endDay: 29 };
    case "dst_aware":
      return { type: "dst_aware", showDuring: "both" };
    case "zman_trigger":
      return { type: "zman_trigger", zmanType: "SHKIAH", offsetMinutes: 0, showBefore: true };
    case "group_trigger":
      return { type: "group_trigger", groupIds: [], showWhenActive: true };
    case "recurring":
      return { type: "recurring", frequency: "weekly", interval: 1 };
    case "one_time":
      return { type: "one_time", date: new Date().toISOString().slice(0, 10) };
  }
}

/**
 * F4 â€” one canonical schedule-rule editor. Used by schedules (and later content/editor).
 * Do not fork into ScheduleForm / ScheduleListTable (F3).
 */
export function ScheduleRuleEditor({
  rules,
  combineMode,
  onChange,
  groupOptions,
}: {
  rules: ScheduleRule[];
  combineMode: "all" | "any";
  onChange: (next: { rules: ScheduleRule[]; combineMode: "all" | "any" }) => void;
  groupOptions?: { id: string; name: string }[];
}) {
  const zmanOptions = useMemo(() => Object.values(ZmanType), []);

  function updateRule(index: number, rule: ScheduleRule) {
    const next = rules.slice();
    next[index] = rule;
    onChange({ rules: next, combineMode });
  }

  function removeRule(index: number) {
    onChange({ rules: rules.filter((_, i) => i !== index), combineMode });
  }

  return (
    <div style={{ border: "1px solid var(--admin-border)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 13 }}>Visibility rules</strong>
        <label style={{ fontSize: 12 }}>
          Match{" "}
          <select
            value={combineMode}
            onChange={(e) => onChange({ rules, combineMode: e.target.value as "all" | "any" })}
            style={input}
          >
            <option value="all">all</option>
            <option value="any">any</option>
          </select>
        </label>
        <button
          type="button"
          style={btn}
          onClick={() => onChange({ rules: [...rules, emptyRule("always")], combineMode })}
        >
          Add rule
        </button>
      </div>
      {rules.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: "var(--admin-muted)" }}>No rules â€” always visible.</p>
      ) : null}
      {rules.map((rule, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gap: 8,
            padding: 10,
            marginBottom: 8,
            background: "var(--admin-bg)",
            borderRadius: 6,
            border: "1px solid var(--admin-border)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={rule.type}
              onChange={(e) => updateRule(index, emptyRule(e.target.value as ScheduleRule["type"]))}
              style={input}
            >
              {RULE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button type="button" style={btn} onClick={() => removeRule(index)}>
              Remove
            </button>
          </div>
          <RuleFields
            rule={rule}
            zmanOptions={zmanOptions}
            groupOptions={groupOptions ?? []}
            onChange={(next) => updateRule(index, next)}
          />
        </div>
      ))}
    </div>
  );
}

function RuleFields({
  rule,
  onChange,
  zmanOptions,
  groupOptions,
}: {
  rule: ScheduleRule;
  onChange: (r: ScheduleRule) => void;
  zmanOptions: string[];
  groupOptions: { id: string; name: string }[];
}) {
  switch (rule.type) {
    case "always":
      return <span style={{ fontSize: 12, color: "var(--admin-muted)" }}>Always active</span>;
    case "day_of_week":
      return (
        <label style={lab}>
          Mask (Sunâ†’Sat, 1=on)
          <input
            value={rule.mask}
            onChange={(e) => onChange({ ...rule, mask: e.target.value.slice(0, 7) })}
            style={input}
          />
        </label>
      );
    case "time_range":
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <label style={lab}>
            Start
            <input
              value={rule.startTime}
              onChange={(e) => onChange({ ...rule, startTime: e.target.value })}
              style={input}
            />
          </label>
          <label style={lab}>
            End
            <input value={rule.endTime} onChange={(e) => onChange({ ...rule, endTime: e.target.value })} style={input} />
          </label>
        </div>
      );
    case "gregorian_range":
    case "hebrew_range":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {(
            [
              ["startMonth", rule.startMonth],
              ["startDay", rule.startDay],
              ["endMonth", rule.endMonth],
              ["endDay", rule.endDay],
            ] as const
          ).map(([key, val]) => (
            <label key={key} style={lab}>
              {key}
              <input
                type="number"
                value={val}
                onChange={(e) => onChange({ ...rule, [key]: Number(e.target.value) })}
                style={input}
              />
            </label>
          ))}
        </div>
      );
    case "dst_aware":
      return (
        <label style={lab}>
          Show during
          <select
            value={rule.showDuring}
            onChange={(e) =>
              onChange({ ...rule, showDuring: e.target.value as "dst" | "standard" | "both" })
            }
            style={input}
          >
            <option value="both">both</option>
            <option value="dst">DST</option>
            <option value="standard">standard</option>
          </select>
        </label>
      );
    case "zman_trigger":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 6 }}>
          <label style={lab}>
            Zman
            <select
              value={rule.zmanType}
              onChange={(e) => onChange({ ...rule, zmanType: e.target.value })}
              style={input}
            >
              {zmanOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
          <label style={lab}>
            Offset (min)
            <input
              type="number"
              value={rule.offsetMinutes}
              onChange={(e) => onChange({ ...rule, offsetMinutes: Number(e.target.value) })}
              style={input}
            />
          </label>
          <label style={lab}>
            Before?
            <select
              value={rule.showBefore ? "1" : "0"}
              onChange={(e) => onChange({ ...rule, showBefore: e.target.value === "1" })}
              style={input}
            >
              <option value="1">before</option>
              <option value="0">after</option>
            </select>
          </label>
        </div>
      );
    case "group_trigger":
      return (
        <div style={{ display: "grid", gap: 6 }}>
          <label style={lab}>
            Groups (comma ids)
            <input
              value={rule.groupIds.join(",")}
              onChange={(e) =>
                onChange({
                  ...rule,
                  groupIds: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              style={input}
              list="group-trigger-options"
            />
            <datalist id="group-trigger-options">
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </datalist>
          </label>
          <label style={lab}>
            When active?
            <select
              value={rule.showWhenActive ? "1" : "0"}
              onChange={(e) => onChange({ ...rule, showWhenActive: e.target.value === "1" })}
              style={input}
            >
              <option value="1">show when active</option>
              <option value="0">show when inactive</option>
            </select>
          </label>
        </div>
      );
    case "recurring":
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <label style={lab}>
            Frequency
            <select
              value={rule.frequency}
              onChange={(e) =>
                onChange({
                  ...rule,
                  frequency: e.target.value as typeof rule.frequency,
                })
              }
              style={input}
            >
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly_gregorian">monthly gregorian</option>
              <option value="monthly_hebrew">monthly hebrew</option>
              <option value="yearly_gregorian">yearly gregorian</option>
              <option value="yearly_hebrew">yearly hebrew</option>
            </select>
          </label>
          <label style={lab}>
            Interval
            <input
              type="number"
              value={rule.interval}
              onChange={(e) => onChange({ ...rule, interval: Number(e.target.value) })}
              style={input}
            />
          </label>
        </div>
      );
    case "one_time":
      return (
        <label style={lab}>
          Date
          <input
            type="date"
            value={rule.date}
            onChange={(e) => onChange({ ...rule, date: e.target.value })}
            style={input}
          />
        </label>
      );
  }
}

const input: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-surface)",
  color: "var(--admin-text)",
  boxSizing: "border-box",
};

const lab: CSSProperties = { fontSize: 12, display: "block" };

const btn: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid var(--admin-border)",
  background: "var(--admin-surface)",
  color: "var(--admin-text)",
  cursor: "pointer",
  fontSize: 12,
};
