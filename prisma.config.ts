// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use process.env so commands like `prisma generate` don't crash if env isn't loaded somewhere
    url: process.env.DATABASE_URL ?? "",
  },
});