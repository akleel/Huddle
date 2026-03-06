import { z } from "zod";

export const projectStatusValues = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.length > 0 ? value : undefined;
  });

export const createProjectInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: optionalDescriptionSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
