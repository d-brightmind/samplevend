import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { formatEngagement } from "@/lib/engagements/format";
import { getScheduleRange, parseScheduleDate, parseScheduleView } from "@/lib/schedule/range";

export async function GET(request: Request) {
  const auth = await requireApiPermission("schedule:view");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const view = parseScheduleView(searchParams.get("view"));
  const date = parseScheduleDate(searchParams.get("date"));
  const { start, end } = getScheduleRange(view, date);

  const [resources, engagements] = await Promise.all([
    prisma.resource.findMany({
      where: { accountId: auth.session.account.id, isActive: true },
      include: { availability: true },
      orderBy: { name: "asc" }
    }),
    prisma.engagement.findMany({
      where: {
        accountId: auth.session.account.id,
        status: { not: "CANCELLED" },
        OR: [
          { scheduledStart: { gte: start, lt: end } },
          { scheduledEnd: { gt: start, lte: end } },
          { scheduledStart: { lt: start }, scheduledEnd: { gt: end } }
        ]
      },
      include: { resource: true, statusEvents: { orderBy: { createdAt: "desc" }, take: 3 } },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }]
    })
  ]);

  return NextResponse.json({
    view,
    range: { start: start.toISOString(), end: end.toISOString() },
    resources: resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      title: resource.title,
      status: resource.status,
      availability: resource.availability
    })),
    engagements: engagements.map(formatEngagement)
  });
}
