// app/api/orgs/[orgId]/members/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDevUserId } from "@/shared/auth/dev-auth";
import { requireOrgPermission } from "@/features/orgs/server/guards";
import { prisma } from "@/shared/db/prisma";
import { AppError } from "@/shared/http/errors";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const userId = getDevUserId(req);
    const { orgId } = await ctx.params;

    await requireOrgPermission({ userId, orgId, permission: "org:members:read" });

    const members = await prisma.membership.findMany({
      where: { orgId },
      select: {
        role: true,
        user: { select: { id: true, email: true, externalId: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ orgId, members });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}