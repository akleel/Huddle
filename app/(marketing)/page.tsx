import Link from "next/link";
import { appConfig } from "@/config/app";

export default function MarketingPage() {
  return (
    <main className="space-y-3 p-6">
      <h1 className="text-2xl font-semibold">{appConfig.name}</h1>
      <p className="text-sm text-neutral-600">
        Multi-tenant client portal with RBAC, audit logs, and (next) billing.
      </p>

      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded-md bg-black px-3 py-2 text-sm text-white">
          Go to dashboard
        </Link>
        <a href="/api/health" className="rounded-md border px-3 py-2 text-sm">
          Health
        </a>
      </div>
    </main>
  );
}