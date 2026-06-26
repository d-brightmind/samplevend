import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { findResourceScheduleConflict } from "@/lib/engagements/conflicts";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";
import { engagementPayloadSchema } from "@/lib/validation/engagement";

function toDate(value?: string | "") {
  return value ? new Date(value) : null;
}

export async function GET(request: Request) {
  const auth = await requireApiPermission("engagements:view");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const query = searchParams.get("q") || undefined;

  const engagements = await prisma.engagement.findMany({
    where: {
      accountId: auth.session.account.id,
      ...(status ? { status: status as never } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { clientName: { contains: query, mode: "insensitive" } },
              { serviceType: { contains: query, mode: "insensitive" } },
              { locationLabel: { contains: query, mode: "insensitive" } },
              { resource: { name: { contains: query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: engagementInclude,
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ engagements: engagements.map(formatEngagement) });
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("engagements:manage");
  if ("error" in auth) return auth.error;

  const parsed = engagementPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid engagement details." }, { status: 400 });
  }

  const input = parsed.data;
  const scheduledStart = toDate(input.scheduledStart);
  const scheduledEnd = toDate(input.scheduledEnd);
  const resourceId = input.resourceId || null;

  if (resourceId) {
    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, accountId: auth.session.account.id, isActive: true },
      select: { id: true }
    });
    if (!resource) {
      return NextResponse.json({ error: "Selected resource is not available." }, { status: 400 });
    }
  }

  const conflict = await findResourceScheduleConflict({
    accountId: auth.session.account.id,
    resourceId,
    scheduledStart,
    scheduledEnd
  });
  if (conflict) {
    return NextResponse.json({ error: `Schedule conflict with ${conflict.title}.` }, { status: 409 });
  }

  const engagement = await prisma.engagement.create({
    data: {
      accountId: auth.session.account.id,
      resourceId,
      title: input.title,
      clientName: input.clientName,
      clientEmail: input.clientEmail || null,
      clientPhone: input.clientPhone || null,
      serviceType: input.serviceType || null,
      description: input.description || null,
      status: input.status,
      scheduledStart,
      scheduledEnd,
      locationLabel: input.locationLabel || null,
      latitude: input.latitude === "" ? null : input.latitude,
      longitude: input.longitude === "" ? null : input.longitude,
      createdBy: auth.session.user.id,
      statusEvents: {
        create: {
          status: input.status,
          note: "Engagement created.",
          createdBy: auth.session.user.id
        }
      }
    },
    include: engagementInclude
  });

  return NextResponse.json({ engagement: formatEngagement(engagement) }, { status: 201 });
}
