import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/db/prisma";
import type { CreateProjectInput } from "@/features/projects/model/project.schema";

const projectSelect = {
  id: true,
  orgId: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.ProjectSelect;

export type ProjectRecord = Prisma.ProjectGetPayload<{
  select: typeof projectSelect;
}>;

type CreateProjectRecordInput = CreateProjectInput & {
  orgId: string;
  createdByUserId: string;
};

export async function findOrgProjects(orgId: string): Promise<ProjectRecord[]> {
  return prisma.project.findMany({
    where: { orgId },
    select: projectSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function createProject(
  input: CreateProjectRecordInput,
): Promise<ProjectRecord> {
  return prisma.project.create({
    data: {
      orgId: input.orgId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      description: input.description ?? null,
    },
    select: projectSelect,
  });
}