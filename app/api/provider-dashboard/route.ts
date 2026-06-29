import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getIndividualProviderDashboard } from "@/lib/provider-dashboard/data";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (!["ADMIN", "DISPATCHER", "RESOURCE"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dashboard = await getIndividualProviderDashboard(session);
  if (!dashboard) {
    return NextResponse.json({ error: "No provider resource found" }, { status: 404 });
  }

  return NextResponse.json({ dashboard });
}
