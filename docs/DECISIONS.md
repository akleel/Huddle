# Decisions (ADR-lite)

- Use Next.js App Router + TypeScript strict mode.
- Modular monolith: `app/` composes, `features/` owns domain logic, `shared/` owns primitives.