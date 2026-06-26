import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api";
import { getDispatchMapData } from "@/lib/dispatch/map-data";

export async function GET() {
  const auth = await requireApiPermission("dispatch:view");
  if ("error" in auth) return auth.error;

  const data = await getDispatchMapData(auth.session.account.id);
  return NextResponse.json(data);
}
