// shared/env/env.ts
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // App
  APP_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().min(1).optional(),

  // Clerk (server)
  CLERK_SECRET_KEY: z.string().min(1).optional(),

  // Stripe (later)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Huddle"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Clerk (public)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Clerk redirect URLs
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z
    .string()
    .default("/dashboard"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z
    .string()
    .default("/dashboard"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "env";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function parseServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables: ${formatEnvError(parsed.error)}`,
    );
  }

  return parsed.data;
}

function parsePublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables: ${formatEnvError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export const env = parseServerEnv();
export const publicEnv = parsePublicEnv();

export function requireServerEnv<Key extends keyof ServerEnv>(
  key: Key,
): NonNullable<ServerEnv[Key]> {
  const value = env[key];

  if (!value) {
    throw new Error(`${String(key)} is not set.`);
  }

  return value as NonNullable<ServerEnv[Key]>;
}
