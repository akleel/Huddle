// shared/auth/dev-auth.ts
import { UnauthorizedError } from "@/shared/http/errors";
import type { NextRequest } from "next/server";

/**
 * Temporary dev-only auth until Clerk/NextAuth is wired.
 * Provide a user id via header: x-user-id
 */
export function getDevUserId(req: NextRequest): string {
  const userId = req.headers.get("x-user-id");
  if (!userId) throw new UnauthorizedError('Missing "x-user-id" header.');
  return userId;
}