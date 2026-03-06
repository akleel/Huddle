import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createProjectInputSchema } from "@/features/projects/model/project.schema";
import { createProjectForCurrentUser } from "@/features/projects/server/create-project.service";
import { listProjectsForCurrentUser } from "@/features/projects/server/list-projects.service";
import { AppError } from "@/shared/http/errors";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("Invalid JSON body.", 400);
  }
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId } = await ctx.params;
    const result = await listProjectsForCurrentUser({ orgId });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ orgId: string }> },
): Promise<NextResponse> {
  try {
    const { orgId } = await ctx.params;
    const body = await readJsonBody(request);
    const input = createProjectInputSchema.parse(body);

    const project = await createProjectForCurrentUser({
      orgId,
      title: input.title,
      description: input.description,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
          details: err.flatten(),
        },
        { status: 400 },
      );
    }

    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
