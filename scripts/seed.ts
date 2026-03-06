// scripts/seed.ts
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

type SeedResult = {
  orgId: string;
  ownerEmail: string;
  viewerEmail: string;
};

function loadEnv(): void {
  const repoRoot = process.cwd();
  const envPaths = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

async function seed(input: {
  prisma: typeof import("@/shared/db/prisma").prisma;
  Role: typeof import("@prisma/client").Role;
}): Promise<SeedResult> {
  const { prisma, Role } = input;

  const ownerEmail = "owner@huddle.dev";
  const viewerEmail = "viewer@huddle.dev";

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { email: ownerEmail },
    select: { id: true, email: true },
  });

  const viewer = await prisma.user.upsert({
    where: { email: viewerEmail },
    update: {},
    create: { email: viewerEmail },
    select: { id: true, email: true },
  });

  const org = await prisma.org.upsert({
    where: { slug: "acme" },
    update: { name: "Acme Inc." },
    create: {
      name: "Acme Inc.",
      slug: "acme",
      description: "Demo tenant for local development.",
    },
    select: { id: true, slug: true, name: true },
  });

  await prisma.membership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: owner.id } },
    update: { role: Role.OWNER },
    create: { orgId: org.id, userId: owner.id, role: Role.OWNER },
    select: { id: true },
  });

  await prisma.membership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: viewer.id } },
    update: { role: Role.VIEWER },
    create: { orgId: org.id, userId: viewer.id, role: Role.VIEWER },
    select: { id: true },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        orgId: org.id,
        actorUserId: owner.id,
        action: "org.created",
        entityType: "Org",
        entityId: org.id,
        metadata: { seed: true, name: org.name, slug: org.slug },
      },
      {
        orgId: org.id,
        actorUserId: owner.id,
        action: "member.added",
        entityType: "User",
        entityId: viewer.id,
        metadata: { seed: true, email: viewer.email, role: Role.VIEWER },
      },
    ],
    skipDuplicates: true,
  });

  return {
    orgId: org.id,
    ownerEmail,
    viewerEmail,
  };
}

function printInstructions(result: SeedResult): void {
  console.log("✅ Seed complete");
  console.log({
    orgId: result.orgId,
    ownerEmail: result.ownerEmail,
    viewerEmail: result.viewerEmail,
  });

  console.log("\nUnauthenticated check (expect 401):");
  console.log(
    `curl.exe "http://localhost:3000/api/orgs/${result.orgId}/members"`,
  );

  console.log("\nCreate or sign in to a Clerk user with one of these emails:");
  console.log(`- ${result.ownerEmail} (OWNER)`);
  console.log(`- ${result.viewerEmail} (VIEWER)`);

  console.log("\nAuthenticated check (same signed-in browser session):");
  console.log(`http://localhost:3000/api/orgs/${result.orgId}/members`);
}

async function main(): Promise<void> {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is missing. Put it in ".env" and/or ".env.local".',
    );
  }

  const [{ prisma }, { Role }] = await Promise.all([
    import("@/shared/db/prisma"),
    import("@prisma/client"),
  ]);

  try {
    const result = await seed({ prisma, Role });
    printInstructions(result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error("❌ Seed failed", err);
  process.exitCode = 1;
});
