// features/orgs/server/guards.ts
import type { Role } from "@prisma/client";
import type { Permission } from "@/features/auth/server/rbac";
import { can } from "@/features/auth/server/rbac";
import { ForbiddenError, UnauthorizedError } from "@/shared/http/errors";
import { getUserRoleInOrg } from "./members.repo";

export async function requireOrgPermission(input: {
  userId: string | null;
  orgId: string;
  permission: Permission;
}): Promise<{ role: Role }> {
  if (!input.userId) {
    throw new UnauthorizedError();
  }

  const role = await getUserRoleInOrg({
    userId: input.userId,
    orgId: input.orgId,
  });

  if (!role) {
    throw new ForbiddenError("Not a member of this organization.");
  }

  if (!can(role, input.permission)) {
    throw new ForbiddenError(`Missing permission: ${input.permission}`);
  }

  return { role };
}