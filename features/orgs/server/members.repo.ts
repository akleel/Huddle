import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/shared/db/prisma";

const orgMemberSelect = {
  role: true,
  user: {
    select: {
      id: true,
      email: true,
      externalId: true,
    },
  },
} satisfies Prisma.MembershipSelect;

export type OrgMember = Prisma.MembershipGetPayload<{
  select: typeof orgMemberSelect;
}>;

type GetUserRoleInOrgInput = {
  orgId: string;
  userId: string;
};

export async function findOrgMembers(orgId: string): Promise<OrgMember[]> {
  return prisma.membership.findMany({
    where: { orgId },
    select: orgMemberSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export async function getUserRoleInOrg(
  input: GetUserRoleInOrgInput,
): Promise<Role | null> {
  const membership = await prisma.membership.findUnique({
    where: {
      orgId_userId: {
        orgId: input.orgId,
        userId: input.userId,
      },
    },
    select: {
      role: true,
    },
  });

  return membership?.role ?? null;
}
