import { NextRequest, NextResponse } from "next/server";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import {
  createGroup,
  deleteGroup,
  listGroups,
  replaceGroups,
  updateGroup,
} from "../../../../../src/domain/groups";
import { toGroupDto } from "../../../../../src/domain/schedule-details";

type Ctx = { params: Promise<{ orgId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  return NextResponse.json({ groups: await listGroups(access.orgId) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as {
    name?: string;
    hebrewName?: string;
    color?: string;
    active?: boolean;
    sortOrder?: number;
  };
  try {
    const row = await createGroup(access.orgId, body);
    return NextResponse.json(
      { group: toGroupDto(row, 0), groups: await listGroups(access.orgId) },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create group failed" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as
    | {
        id: string;
        name?: string;
        hebrewName?: string;
        color?: string;
        active?: boolean;
        sortOrder?: number;
        autoActivationRules?: string | null;
      }
    | Array<{
        id?: string;
        name: string;
        hebrewName: string;
        color: string;
        active: boolean;
        sortOrder: number;
        isBuiltIn?: boolean;
      }>;

  try {
    if (Array.isArray(body)) {
      const groups = await replaceGroups(access.orgId, body);
      return NextResponse.json({ groups });
    }
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const row = await updateGroup(access.orgId, body.id, body);
    return NextResponse.json({
      group: toGroupDto(row),
      groups: await listGroups(access.orgId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update group failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  try {
    await deleteGroup(access.orgId, id);
    return NextResponse.json({ groups: await listGroups(access.orgId) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete group failed" },
      { status: 400 },
    );
  }
}
