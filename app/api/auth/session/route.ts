import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  return NextResponse.json(session);
}
