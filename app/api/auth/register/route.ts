import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validation/auth";

function roleForAccountType(accountType: "BUSINESS" | "INDIVIDUAL_PROVIDER" | "CLIENT") {
  if (accountType === "BUSINESS") return "ADMIN";
  if (accountType === "INDIVIDUAL_PROVIDER") return "RESOURCE";
  return "CLIENT";
}

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid registration details." }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${origin}/login`
    }
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "We could not create this account. Try again." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        type: input.accountType,
        name:
          input.accountType === "BUSINESS"
            ? input.accountName!
            : input.accountType === "INDIVIDUAL_PROVIDER"
              ? `${input.fullName} Provider Workspace`
              : `${input.fullName} Client Workspace`
      }
    });

    await tx.userProfile.create({
      data: {
        id: data.user!.id,
        email: input.email,
        fullName: input.fullName,
        emailVerified: Boolean(data.user!.email_confirmed_at)
      }
    });

    await tx.accountUser.create({
      data: {
        accountId: account.id,
        userId: data.user!.id,
        role: roleForAccountType(input.accountType)
      }
    });
  });

  return NextResponse.json({ status: "verification_required" }, { status: 201 });
}
