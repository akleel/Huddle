// shared/db/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireServerEnv } from "@/shared/env/env";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: requireServerEnv("DATABASE_URL"),
});

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
