import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { parseCsv } from "@/io/csv";
import { parseIcsToAnnouncementRecords } from "@/io/ics";
import { getEntityDef, type EntityKey } from "@/io/entities";
import { applyBzsImport } from "@/io/bzs-apply";
import {
  importEntityRows,
  restoreOrgBackup,
  type ImportMode,
  type OrgBackup,
} from "@/server/io-repo";

export const dynamic = "force-dynamic";

const ENTITY_KEYS: EntityKey[] = ["groups", "minyanim", "announcements", "memorials", "sponsors", "media"];

function recordsFromText(format: string, text: string, type: string): Record<string, string>[] {
  if (format === "ics" || type === "ics") {
    return parseIcsToAnnouncementRecords(text);
  }
  if (format === "json") {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of rows.");
    return parsed.map((row) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
        out[k] = v == null ? "" : typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
      }
      return out;
    });
  }
  return parseCsv(text);
}

/** E19 — import / preview / restore / BeeZee. */
export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "admin");

    const body = (await request.json().catch(() => null)) as {
      action?: "preview" | "commit" | "restore" | "beezee";
      type?: string;
      format?: string;
      text?: string;
      mode?: ImportMode;
      groupsText?: string;
      eventsText?: string;
    } | null;

    if (!body?.action) return NextResponse.json({ error: "action required." }, { status: 400 });

    if (body.action === "restore") {
      if (!body.text?.trim()) return NextResponse.json({ error: "Backup JSON required." }, { status: 400 });
      let backup: OrgBackup;
      try {
        backup = JSON.parse(body.text) as OrgBackup;
      } catch {
        return NextResponse.json({ error: "Invalid JSON backup." }, { status: 400 });
      }
      const outcome = await restoreOrgBackup(orgId, backup);
      return NextResponse.json({ ok: true, outcome });
    }

    if (body.action === "beezee") {
      if (!body.text?.trim()) return NextResponse.json({ error: "BZS file content required." }, { status: 400 });
      const mode = body.mode === "replace" ? "replace" : "append";
      const result = await applyBzsImport(orgId, body.text, mode);
      return NextResponse.json({
        ok: true,
        zmanimWritten: result.zmanimWritten,
        minyanimWritten: result.minyanimWritten,
        defs: result.parsed.zmanimDefs.length,
        toladot: result.parsed.toladotEntries.length,
      });
    }

    // P10.5 two-file Groups+Events
    if (body.type === "groups-events") {
      const mode = body.mode === "replace" ? "replace" : "append";
      const groupRecords = recordsFromText(body.format ?? "csv", body.groupsText ?? "", "groups");
      const eventRecords = recordsFromText(body.format ?? "csv", body.eventsText ?? "", "minyanim");
      if (body.action === "preview") {
        const gDef = getEntityDef("groups")!;
        const mDef = getEntityDef("minyanim")!;
        const errors: string[] = [];
        groupRecords.forEach((r, i) => {
          try {
            gDef.fromRecord(r, orgId);
          } catch (e) {
            errors.push(`Groups row ${i + 1}: ${e instanceof Error ? e.message : "invalid"}`);
          }
        });
        eventRecords.forEach((r, i) => {
          try {
            mDef.fromRecord(r, orgId);
          } catch (e) {
            errors.push(`Events row ${i + 1}: ${e instanceof Error ? e.message : "invalid"}`);
          }
        });
        return NextResponse.json({
          total: groupRecords.length + eventRecords.length,
          groups: groupRecords.length,
          events: eventRecords.length,
          columns: [...gDef.columns, ...mDef.columns],
          sample: { groups: groupRecords.slice(0, 5), events: eventRecords.slice(0, 5) },
          errors: errors.slice(0, 30),
        });
      }
      const g = await importEntityRows(orgId, "groups", groupRecords, mode);
      const m = await importEntityRows(orgId, "minyanim", eventRecords, mode);
      return NextResponse.json({ ok: true, groups: g.inserted, events: m.inserted, replaced: mode === "replace" });
    }

    const type = body.type === "ics" ? "announcements" : body.type;
    if (!type || !ENTITY_KEYS.includes(type as EntityKey)) {
      return NextResponse.json({ error: "Unknown type." }, { status: 400 });
    }
    const key = type as EntityKey;
    const format = body.format ?? "csv";
    if (!body.text?.trim()) return NextResponse.json({ error: "Paste or upload data first." }, { status: 400 });

    let records: Record<string, string>[];
    try {
      records = recordsFromText(format, body.text, body.type ?? key);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Parse failed." }, { status: 400 });
    }

    const def = getEntityDef(key)!;

    if (body.action === "preview") {
      const errors: string[] = [];
      records.forEach((record, i) => {
        try {
          def.fromRecord(record, orgId);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "invalid row"}`);
        }
      });
      return NextResponse.json({
        total: records.length,
        columns: def.columns,
        sample: records.slice(0, 10),
        errors: errors.slice(0, 20),
      });
    }

    if (body.action === "commit") {
      const mode = body.mode === "replace" ? "replace" : "append";
      const outcome = await importEntityRows(orgId, key, records, mode);
      return NextResponse.json({ ok: true, ...outcome });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
