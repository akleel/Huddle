// shared/env/env.ts
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // App
  APP_URL: z.string().url().optional(),

  // Database (later)
  DATABASE_URL: z.string().min(1).optional(),

  // Auth (later)
  AUTH_PROVIDER: z.enum(["clerk", "nextauth"]).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Stripe (later)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Huddle"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function parseServerEnv(): z.infer<typeof serverEnvSchema> {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Only throw in runtime environments where env should be correct.
    // Keeps DX smoother while we scaffold.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid server environment variables: ${parsed.error.message}`);
    }
  }
  return parsed.success ? parsed.data : ({} as z.infer<typeof serverEnvSchema>);
}

function parsePublicEnv(): z.infer<typeof publicEnvSchema> {
  const parsed = publicEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid public environment variables: ${parsed.error.message}`);
    }
  }
  return parsed.success ? parsed.data : ({ NEXT_PUBLIC_APP_NAME: "Huddle" } as z.infer<
    typeof publicEnvSchema
  >);
}

/**
 * Server-only env. Import from server code only.
 */
export const env = parseServerEnv();

/**
 * Public env. Safe to use in client components.
 */
export const publicEnv = parsePublicEnv();