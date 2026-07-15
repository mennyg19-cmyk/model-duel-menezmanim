import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import {
  commitImport,
  previewImport,
  sampleCsv,
  sampleJson,
  type ImportCategory,
} from "../../../../../src/io/import-export";
import { applyBzsImport } from "../../../../../src/io/bzs-apply";

type Ctx = { params: Promise<{ orgId: string }> };

/** E19 import — CSV/JSON/ICS/BZS with preview + commit. */
export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const contentType = request.headers.get("content-type") ?? "";
  let body: Record<string, unknown>;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const category = String(form.get("category") ?? "schedules") as ImportCategory;
    const mode = String(form.get("mode") ?? "append") as "append" | "replace";
    const action = String(form.get("action") ?? "preview");
    let content = String(form.get("content") ?? "");
    if (file && typeof file !== "string") {
      content = await file.text();
    }
    if (action === "sample") {
      return NextResponse.json({
        sample: category.startsWith("json-")
          ? sampleJson(category.replace("json-", "") as "announcements" | "yahrzeit" | "sponsors")
          : sampleCsv(category),
      });
    }
    if (action === "commit") {
      try {
        if (category === "bezee") {
          const result = await applyBzsImport(access.orgId, content, mode);
          return NextResponse.json({
            written: result.zmanimWritten + result.minyanimWritten,
            zmanimWritten: result.zmanimWritten,
            minyanimWritten: result.minyanimWritten,
            errors: [],
          });
        }
        const result = await commitImport({ orgId: access.orgId, category, content, mode });
        return NextResponse.json(result);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Import failed", written: 0, errors: [err instanceof Error ? err.message : "Import failed"] },
          { status: 400 },
        );
      }
    }
    const preview = await previewImport({ category, content });
    return NextResponse.json(preview);
  }

  body = (await request.json()) as Record<string, unknown>;
  const category = String(body.category ?? "schedules") as ImportCategory;
  const action = String(body.action ?? "preview");
  const content = String(body.content ?? "");
  const mode = (body.mode as "append" | "replace") ?? "append";
  const mapping = body.mapping as Record<string, string> | undefined;

  if (action === "sample") {
    return NextResponse.json({
      sample: category.startsWith("json-")
        ? sampleJson(category.replace("json-", "") as "announcements" | "yahrzeit" | "sponsors")
        : sampleCsv(category),
    });
  }
  if (action === "commit") {
    try {
      const result = await commitImport({ orgId: access.orgId, category, content, mapping, mode });
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Import failed", written: 0, errors: [err instanceof Error ? err.message : "Import failed"] },
        { status: 400 },
      );
    }
  }
  const preview = await previewImport({ category, content, mapping });
  return NextResponse.json(preview);
}
