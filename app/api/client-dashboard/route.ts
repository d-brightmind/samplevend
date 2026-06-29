import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { getClientDashboard } from "@/lib/client-dashboard/data";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (session.role !== "CLIENT" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dashboard = await getClientDashboard(session);
  return NextResponse.json({ dashboard });
}
