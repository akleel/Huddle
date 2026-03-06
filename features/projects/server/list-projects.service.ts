import { requireCurrentDbUser } from "@/features/auth/server/current-user.service";
import { requireOrgPermission } from "@/features/orgs/server/guards";
import { findOrgProjects, type ProjectRecord } from "./projects.repo";

type ListProjectsForCurrentUserInput = {
  orgId: string;
};

type ListProjectsForCurrentUserResult = {
  orgId: string;
  projects: ProjectRecord[];
};

export async function listProjectsForCurrentUser(
  input: ListProjectsForCurrentUserInput,
): Promise<ListProjectsForCurrentUserResult> {
  const currentUser = await requireCurrentDbUser();

  await requireOrgPermission({
    userId: currentUser.id,
    orgId: input.orgId,
    permission: "projects:read",
  });

  const projects = await findOrgProjects(input.orgId);

  return {
    orgId: input.orgId,
    projects,
  };
}