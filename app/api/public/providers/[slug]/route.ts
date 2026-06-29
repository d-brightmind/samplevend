import { NextResponse } from "next/server";
import { getPublicProviderProfile } from "@/lib/public-provider/profile";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const profile = await getPublicProviderProfile(slug);

  if (!profile) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json({ provider: profile });
}
