import { requireCurrentDbUser } from "@/features/auth/server/current-user.service";
import type { CreateProjectInput } from "@/features/projects/model/project.schema";
import { requireOrgPermission } from "@/features/orgs/server/guards";
import { createProject, type ProjectRecord } from "./projects.repo";

type CreateProjectForCurrentUserInput = CreateProjectInput & {
  orgId: string;
};

export async function createProjectForCurrentUser(
  input: CreateProjectForCurrentUserInput,
): Promise<ProjectRecord> {
  const currentUser = await requireCurrentDbUser();

  await requireOrgPermission({
    userId: currentUser.id,
    orgId: input.orgId,
    permission: "projects:write",
  });

  return createProject({
    orgId: input.orgId,
    createdByUserId: currentUser.id,
    title: input.title,
    description: input.description,
  });
}