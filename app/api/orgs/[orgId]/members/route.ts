import { NextResponse } from "next/server";
import { listOrgMembersForCurrentUser } from "@/features/orgs/server/list-members.service";
import { AppError } from "@/shared/http/errors";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const { orgId } = await ctx.params;
    const result = await listOrgMembersForCurrentUser({ orgId });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}