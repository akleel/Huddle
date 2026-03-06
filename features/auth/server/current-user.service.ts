import { auth, currentUser } from "@clerk/nextjs/server";
import { AppError, UnauthorizedError } from "@/shared/http/errors";
import {
  findUserByExternalId,
  linkOrCreateClerkUser,
  type CurrentDbUser,
} from "./user.repo";

function getClerkEmail(
  clerkUser: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  return (
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function requireCurrentDbUser(): Promise<CurrentDbUser> {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const existingUser = await findUserByExternalId(userId);

  if (existingUser?.email) {
    return existingUser;
  }

  const clerkUser = await currentUser();
  const result = await linkOrCreateClerkUser({
    externalId: userId,
    email: getClerkEmail(clerkUser),
  });

  if (result.kind === "email-conflict") {
    throw new AppError("Email is already linked to another user.", 409);
  }

  return result.user;
}
