// scripts/seed.ts
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

type SeedResult = {
  orgId: string;
  ownerUserId: string;
  viewerUserId: string;
};

function loadEnv(): void {
  const repoRoot = process.cwd();
  const envPaths = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) dotenv.config({ path: p, override: true });
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

  return { orgId: org.id, ownerUserId: owner.id, viewerUserId: viewer.id };
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
    const res = await seed({ prisma, Role });

    console.log("✅ Seed complete");

    console.log(res);

    console.log("\nTry RBAC endpoint (Windows PowerShell):");

    console.log(
      `curl.exe -H "x-user-id: ${res.ownerUserId}" "http://localhost:3000/api/orgs/${res.orgId}/members"`,
    );

    console.log("\nTry RBAC endpoint (macOS/Linux):");

    console.log(
      `curl -H "x-user-id: ${res.ownerUserId}" "http://localhost:3000/api/orgs/${res.orgId}/members"`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {

    console.error("❌ Seed failed", err);
  process.exitCode = 1;
});
