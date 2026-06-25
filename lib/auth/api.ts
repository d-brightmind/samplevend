import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import type { Permission } from "@/lib/auth/types";

export async function requireApiPermission(permission: Permission) {
  const session = await getSessionContext();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }
  if (!session.user.emailVerified) {
    return { error: NextResponse.json({ error: "Email verification required" }, { status: 403 }) };
  }
  if (!session.permissions.includes(permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
