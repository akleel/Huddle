export default function Home(): JSX.Element {
  return (
    <main style={{ padding: 24 }}>
      <h1>Huddle</h1>
      <p>Local dev is up.</p>
      <p>
        Health check: <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}