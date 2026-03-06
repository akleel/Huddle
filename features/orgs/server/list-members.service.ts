import { requireCurrentDbUser } from "@/features/auth/server/current-user.service";
import { requireOrgPermission } from "./guards";
import { findOrgMembers, type OrgMember } from "./members.repo";

type ListOrgMembersForCurrentUserInput = {
  orgId: string;
};

type ListOrgMembersForCurrentUserResult = {
  orgId: string;
  members: OrgMember[];
};

export async function listOrgMembersForCurrentUser(
  input: ListOrgMembersForCurrentUserInput
): Promise<ListOrgMembersForCurrentUserResult> {
  const currentUser = await requireCurrentDbUser();

  await requireOrgPermission({
    userId: currentUser.id,
    orgId: input.orgId,
    permission: "org:members:read",
  });

  const members = await findOrgMembers(input.orgId);

  return {
    orgId: input.orgId,
    members,
  };
}