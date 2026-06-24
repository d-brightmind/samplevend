import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dashboardByRole } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return NextResponse.json({ error: "We could not sign you in. Check your details and try again." }, { status: 401 });
  }

  if (!data.user.email_confirmed_at) {
    return NextResponse.json({ redirectTo: "/verify-email" });
  }

  await prisma.userProfile.updateMany({
    where: { id: data.user.id },
    data: { emailVerified: true }
  });

  const membership = await prisma.accountUser.findFirst({
    where: { userId: data.user.id, status: "ACTIVE", account: { isActive: true } },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "No active workspace is assigned to this account." }, { status: 403 });
  }

  return NextResponse.json({ redirectTo: dashboardByRole[membership.role] });
}
