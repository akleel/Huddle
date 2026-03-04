import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="space-y-2">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="text-sm text-neutral-600">
        Signed in as: {user?.primaryEmailAddress?.emailAddress ?? "unknown"}
      </p>
    </main>
  );
}