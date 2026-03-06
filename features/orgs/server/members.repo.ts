import { Prisma } from "@prisma/client";
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

export async function findOrgMembers(orgId: string): Promise<OrgMember[]> {
  return prisma.membership.findMany({
    where: { orgId },
    select: orgMemberSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}
