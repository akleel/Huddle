// shared/env/env.ts
import { z } from "zod";

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // App
    APP_URL: z.string().url().optional(),

    // Database
    DATABASE_URL: z.string().min(1).optional(),

    // Clerk (server)
    CLERK_SECRET_KEY: z.string().min(1).optional(),

    // Stripe (later)
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

    // NextAuth (optional alternative later)
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV !== "production") return;

    if (!val.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production.",
      });
    }

    if (!val.CLERK_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CLERK_SECRET_KEY"],
        message: "CLERK_SECRET_KEY is required in production.",
      });
    }
  });

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Huddle"),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),

    // Clerk (public)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),

    // Clerk redirect URLs (recommended)
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (process.env.NODE_ENV !== "production") return;

    if (!val.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
        message: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required in production.",
      });
    }
  });

function parseServerEnv(): z.infer<typeof serverEnvSchema> {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success && process.env.NODE_ENV === "production") {
    throw new Error(`Invalid server environment variables: ${parsed.error.message}`);
  }
  return parsed.success ? parsed.data : ({} as z.infer<typeof serverEnvSchema>);
}

function parsePublicEnv(): z.infer<typeof publicEnvSchema> {
  const parsed = publicEnvSchema.safeParse(process.env);
  if (!parsed.success && process.env.NODE_ENV === "production") {
    throw new Error(`Invalid public environment variables: ${parsed.error.message}`);
  }
  return parsed.success
    ? parsed.data
    : ({ NEXT_PUBLIC_APP_NAME: "Huddle" } as z.infer<typeof publicEnvSchema>);
}

/** Server-only env. Import from server code only. */
export const env = parseServerEnv();

/** Public env. Safe to use in client components. */
export const publicEnv = parsePublicEnv();