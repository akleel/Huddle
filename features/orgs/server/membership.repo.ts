// features/orgs/server/membership.repo.ts
import type { Role } from "@prisma/client";
import { prisma } from "@/shared/db/prisma";

export async function getUserRoleInOrg(input: {
  userId: string;
  orgId: string;
}): Promise<Role | null> {
  const membership = await prisma.membership.findUnique({
    where: { orgId_userId: { orgId: input.orgId, userId: input.userId } },
    select: { role: true },
  });

  return membership?.role ?? null;
}