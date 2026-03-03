# Huddle Architecture

## Ownership
- `app/`: routing + composition only.
- `features/*`: domain source of truth (schemas, services, repos, domain UI).
- `shared/`: reusable primitives (env, db, ui atoms, utils).

## Conventions
- Domain types + validation in `features/<domain>/model`.
- Database access only in `features/<domain>/server/*.repo.ts`.
- Business logic in `features/<domain>/server/*.service.ts`.