import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/db/prisma";

const currentDbUserSelect = {
  id: true,
  externalId: true,
  email: true,
} satisfies Prisma.UserSelect;

export type CurrentDbUser = Prisma.UserGetPayload<{
  select: typeof currentDbUserSelect;
}>;

type LinkOrCreateClerkUserInput = {
  externalId: string;
  email: string | null;
};

export type LinkOrCreateClerkUserResult =
  | { kind: "linked"; user: CurrentDbUser }
  | { kind: "email-conflict" };

const LINK_RETRY_LIMIT = 3;
const RETRYABLE_ERROR_CODES = new Set(["P2002", "P2034"]);

export async function findUserByExternalId(
  externalId: string,
): Promise<CurrentDbUser | null> {
  return prisma.user.findUnique({
    where: { externalId },
    select: currentDbUserSelect,
  });
}

export async function linkOrCreateClerkUser(
  input: LinkOrCreateClerkUserInput,
): Promise<LinkOrCreateClerkUserResult> {
  for (let attempt = 1; attempt <= LINK_RETRY_LIMIT; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingByExternalId = await tx.user.findUnique({
            where: { externalId: input.externalId },
            select: currentDbUserSelect,
          });

          if (existingByExternalId) {
            if (input.email && existingByExternalId.email !== input.email) {
              const updatedUser = await tx.user.update({
                where: { id: existingByExternalId.id },
                data: { email: input.email },
                select: currentDbUserSelect,
              });

              return { kind: "linked", user: updatedUser } as const;
            }

            return { kind: "linked", user: existingByExternalId } as const;
          }

          if (input.email) {
            const existingByEmail = await tx.user.findUnique({
              where: { email: input.email },
              select: currentDbUserSelect,
            });

            if (existingByEmail) {
              if (
                existingByEmail.externalId &&
                existingByEmail.externalId !== input.externalId
              ) {
                return { kind: "email-conflict" } as const;
              }

              const linkedUser = await tx.user.update({
                where: { id: existingByEmail.id },
                data: {
                  externalId: input.externalId,
                  email: input.email,
                },
                select: currentDbUserSelect,
              });

              return { kind: "linked", user: linkedUser } as const;
            }
          }

          const createdUser = await tx.user.create({
            data: {
              externalId: input.externalId,
              email: input.email,
            },
            select: currentDbUserSelect,
          });

          return { kind: "linked", user: createdUser } as const;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: unknown) {
      const isRetryablePrismaError =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        RETRYABLE_ERROR_CODES.has(error.code);

      if (!isRetryablePrismaError || attempt === LINK_RETRY_LIMIT) {
        throw error;
      }
    }
  }

  throw new Error("Failed to link Clerk user.");
}
