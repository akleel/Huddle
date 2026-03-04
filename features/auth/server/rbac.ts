// features/auth/server/rbac.ts
import type { Role } from "@prisma/client";

export type Permission =
  | "org:read"
  | "org:members:read"
  | "org:members:manage"
  | "audit:read"
  | "audit:write"
  | "billing:manage";

const rolePermissions: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  OWNER: new Set<Permission>([
    "org:read",
    "org:members:read",
    "org:members:manage",
    "audit:read",
    "audit:write",
    "billing:manage",
  ]),
  ADMIN: new Set<Permission>([
    "org:read",
    "org:members:read",
    "org:members:manage",
    "audit:read",
    "audit:write",
  ]),
  MEMBER: new Set<Permission>(["org:read", "org:members:read", "audit:read", "audit:write"]),
  VIEWER: new Set<Permission>(["org:read", "org:members:read", "audit:read"]),
} as const;

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].has(permission);
}