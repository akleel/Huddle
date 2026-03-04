# Huddle

**Huddle** is a **multi-tenant client portal** where teams collaborate with customers — built as a production-style full-stack project.

> Focus: **tenant isolation**, **RBAC**, **audit logs**, and (next) **Stripe subscriptions** + real auth.

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
- **Postgres** (Neon)
- **Prisma v7** (Postgres adapter)
- **Zod** (typed env)
- **ESLint** + **Tailwind**

---

## Project structure

High-level ownership rules:

- `app/` — routing + composition only
- `features/` — domain source of truth (services/repos/schemas per feature)
- `shared/` — reusable infra + utilities (db, env, errors, etc.)

Key folders:

- `features/auth` — RBAC + auth helpers
- `features/orgs` — org membership + tenant guards
- `features/audit` — audit logs (schema + services)
- `shared/db` — Prisma client
- `shared/http` — typed errors

---

## Commit philosophy

This repo is intentionally built in small, reviewable milestones so it's easy to follow progress from day 1.

- Small, scoped commits (easy to review)
- Each milestone is its own commit (scaffold → db → multi-tenancy → RBAC → billing)

---

## Current status

**Implemented:**

- ✅ Next.js app scaffold + `/api/health`
- ✅ Prisma + Postgres (Neon) configured
- ✅ Core multi-tenant schema: User, Org, Membership, AuditLog
- ✅ RBAC helpers + server-side permission guard
- ✅ Example protected endpoint: `GET /api/orgs/:orgId/members` *(dev-only `x-user-id` header for now)*

**Planned next:**

- ⏳ Real auth (Clerk or NextAuth)
- ⏳ Stripe subscriptions + webhooks + entitlement gating
- ⏳ Projects/Cases module + file uploads
- ⏳ Seed script + E2E tests + CI

---

## Getting started (local)

> Requires **Node 18+** and a Postgres database (Neon recommended).

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create `.env` (for Prisma CLI) and `.env.local` (for Next.js runtime).
These files are ignored by git.

Minimum required:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

See `.env.example` for placeholders.

> **Neon tip:** Prefer a **Direct** connection string for migrations. Pooling is fine for runtime later.

### 3) Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

(Optional)

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

## API endpoints (current)

| Method | Route | Description |
| ------ | ----- | ----------- |
| `GET` | `/api/health` | Basic service health response |
| `GET` | `/api/orgs/:orgId/members` | Org members list (RBAC-protected; dev-only auth header for now) |

---

## RBAC testing (dev-only)

Until real auth is wired, RBAC can be tested using a dev-only header:

**Header:** `x-user-id: <USER_ID>`

**Example:**

```bash
curl -H "x-user-id: YOUR_USER_ID" \
  http://localhost:3000/api/orgs/YOUR_ORG_ID/members
```

**Expected responses:**

| Status | Meaning |
| ------ | ------- |
| `200` | Allowed |
| `403` | Not a member / missing permission |
| `401` | Header missing |

---

## License

MIT