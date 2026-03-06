**Huddle** is a **multi-tenant client portal** where teams collaborate with customers — built as a production-style full-stack project.

> Focus: **tenant isolation**, **RBAC**, **audit logs**, and (next) **Stripe subscriptions**.

---

## What Huddle is (and why)

Most "portfolio apps" are single-tenant and skip the hard parts. Huddle is designed to showcase the parts businesses pay for:

- Multi-tenancy (organizations + secure data separation)
- Role-Based Access Control (OWNER/ADMIN/MEMBER/VIEWER)
- Audit logging (org-scoped)
- Production-style architecture (feature modules + clear ownership)

---

## Architecture at a glance

- **Routing layer** (`app/`) — thin; composes features, owns no logic
- **Feature modules** (`features/`) — each domain owns its services, repos, and schemas
- **Shared infra** (`shared/`) — DB client, typed env, error helpers — imported by features, never the reverse

---

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Clerk** (auth — modal sign-in/sign-up, route protection via `proxy.ts`)
- **Postgres** (Neon) + **Prisma v7** (Postgres adapter)
- **Zod** (typed env)
- **ESLint** + **Tailwind**

---

## Project structure

High-level ownership rules:

- `app/` — routing + composition only
- `features/` — domain source of truth (services/repos/schemas per feature)
- `shared/` — reusable infra + utilities (db, env, errors, etc.)

Key folders:

- `features/auth` — auth helpers + Clerk user mapping
- `features/orgs` — org membership + tenant guards
- `features/audit` — audit logs (schema + services)
- `shared/db` — Prisma client
- `shared/env` — typed env validation
- `shared/http` — typed errors

---

## Commit philosophy

This repo is intentionally built in small, reviewable milestones so it's easy to follow progress from day 1.

- Small, scoped commits (easy to review)
- Each milestone is its own commit (scaffold → db → multi-tenancy → RBAC → auth → billing)

---

## Current status

**Implemented:**

- ✅ Next.js app scaffold + `/api/health`
- ✅ Prisma + Postgres (Neon) configured
- ✅ Core multi-tenant schema: User, Org, Membership, AuditLog
- ✅ RBAC helpers + server-side permission guard
- ✅ Example protected endpoint: `GET /api/orgs/:orgId/members` _(Clerk session + org RBAC enforced server-side)_
- ✅ Clerk auth for UI + route protection + API user mapping
- ✅ Typed env parsing in `shared/env/env.ts`
- ✅ Seed script (`npm run seed`) — demo org, users, memberships, audit logs

**Planned next:**

- ⏳ Projects/Cases module
- ⏳ File uploads
- ⏳ E2E tests + CI
- ⏳ Stripe subscriptions + webhooks + entitlement gating

---

## Getting started (local)

> Requires **Node 18+** (**Node 20 LTS recommended**). Postgres database required (Neon recommended).

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create `.env` (for Prisma CLI) and `.env.local` (for Next.js runtime).  
Prisma CLI reads `.env`; Next.js reads `.env.local`. Both files are ignored by git.

Minimum required:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

See `.env.example` for placeholders.

> **Neon tip:** Prefer a **Direct** connection string for migrations. Pooling is fine for runtime later.

### 3) Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

Optional:

```bash
npx prisma studio
```

### 4) Run the dev server

```bash
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Demo data (seed)

Populate a demo org + users + memberships + audit logs:

```bash
npm run seed
```

This prints:

- `orgId`
- seeded emails to use with Clerk sign-in
- an unauthenticated `curl.exe` check
- the authenticated browser URL to test

---

## API endpoints (current)

| Method | Route                      | Description                                               |
| ------ | -------------------------- | --------------------------------------------------------- |
| `GET`  | `/api/health`              | Basic service health response                             |
| `GET`  | `/api/orgs/:orgId/members` | Org members list (RBAC-protected; Clerk session required) |

---

## Authenticated API testing

1. Run:

```bash
npm run seed
```

2. Create or sign in to a Clerk user with one of the seeded emails:
   - `owner@huddle.dev`
   - `viewer@huddle.dev`

3. Open this URL in the same signed-in browser session:

```text
http://localhost:3000/api/orgs/YOUR_ORG_ID/members
```

**Expected responses:**

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| `200`  | Signed in and allowed                           |
| `403`  | Signed in but not a member / missing permission |
| `401`  | Not signed in                                   |

---

## License

MIT
