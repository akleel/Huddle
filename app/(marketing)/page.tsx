import { appConfig } from "@/config/app";

export default function MarketingPage(): JSX.Element {
  return (
    <main style={{ padding: 24 }}>
      <h1>{appConfig.name}</h1>
      <p>B2B client portal (multi-tenant, RBAC, billing).</p>
      <p>
        Health check: <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}