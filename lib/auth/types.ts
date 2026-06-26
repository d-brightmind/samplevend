export const accountTypes = ["BUSINESS", "INDIVIDUAL_PROVIDER", "CLIENT"] as const;
export type AccountType = (typeof accountTypes)[number];

export const userRoles = ["ADMIN", "DISPATCHER", "RESOURCE", "CLIENT"] as const;
export type UserRole = (typeof userRoles)[number];

export type Permission =
  | "account:manage"
  | "users:invite"
  | "users:remove"
  | "resources:manage"
  | "resources:deactivate"
  | "engagements:view"
  | "engagements:manage"
  | "engagements:assign"
  | "engagements:cancel"
  | "jobs:create"
  | "jobs:assign"
  | "jobs:view_all"
  | "jobs:view_assigned"
  | "jobs:update_status"
  | "resources:view"
  | "availability:manage"
  | "requests:create"
  | "requests:view_own"
  | "invoices:view_own"
  | "billing:manage";

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "account:manage",
    "users:invite",
    "users:remove",
    "resources:manage",
    "resources:deactivate",
    "engagements:view",
    "engagements:manage",
    "engagements:assign",
    "engagements:cancel",
    "jobs:create",
    "jobs:assign",
    "jobs:view_all",
    "resources:view",
    "billing:manage"
  ],
  DISPATCHER: [
    "jobs:create",
    "jobs:assign",
    "jobs:view_all",
    "resources:view",
    "resources:manage",
    "engagements:view",
    "engagements:manage",
    "engagements:assign",
    "engagements:cancel"
  ],
  RESOURCE: ["jobs:view_assigned", "jobs:update_status", "availability:manage", "engagements:view"],
  CLIENT: ["requests:create", "requests:view_own", "invoices:view_own", "engagements:view"]
};

export const dashboardByRole: Record<UserRole, string> = {
  ADMIN: "/admin",
  DISPATCHER: "/dispatch",
  RESOURCE: "/resource",
  CLIENT: "/client"
};

export type SessionContext = {
  user: {
    id: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
  };
  account: {
    id: string;
    type: AccountType;
    name: string;
  };
  role: UserRole;
  permissions: Permission[];
};
