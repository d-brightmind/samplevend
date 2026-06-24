import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dashboardByRole, rolePermissions, type Permission, type SessionContext, type UserRole } from "./types";

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    include: {
      accounts: {
        where: { status: "ACTIVE", account: { isActive: true } },
        include: { account: true },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  const membership = profile?.accounts[0];
  if (!profile || !membership) {
    return null;
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      emailVerified: Boolean(user.email_confirmed_at || profile.emailVerified)
    },
    account: {
      id: membership.account.id,
      type: membership.account.type,
      name: membership.account.name
    },
    role: membership.role,
    permissions: rolePermissions[membership.role]
  };
});

export async function requireSession() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }
  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();
  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  if (!session.permissions.includes(permission)) {
    redirect("/unauthorized");
  }
  return session;
}

export function redirectToDashboard(role: UserRole) {
  redirect(dashboardByRole[role]);
}
