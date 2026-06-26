import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { findResourceScheduleConflict } from "@/lib/engagements/conflicts";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";
import { cancelEngagementSchema, engagementPayloadSchema } from "@/lib/validation/engagement";

type RouteContext = { params: Promise<{ engagementId: string }> };

function toDate(value?: string | "") {
  return value ? new Date(value) : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiPermission("engagements:view");
  if ("error" in auth) return auth.error;
  const { engagementId } = await context.params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, accountId: auth.session.account.id },
    include: engagementInclude
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  return NextResponse.json({ engagement: formatEngagement(engagement) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("engagements:manage");
  if ("error" in auth) return auth.error;
  const { engagementId } = await context.params;

  const parsed = engagementPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid engagement details." }, { status: 400 });
  }

  const exists = await prisma.engagement.findFirst({
    where: { id: engagementId, accountId: auth.session.account.id },
    select: { id: true }
  });
  if (!exists) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
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
    scheduledEnd,
    excludeEngagementId: engagementId
  });
  if (conflict) {
    return NextResponse.json({ error: `Schedule conflict with ${conflict.title}.` }, { status: 409 });
  }

  const engagement = await prisma.engagement.update({
    where: { id: engagementId },
    data: {
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
      completedAt: input.status === "COMPLETED" ? new Date() : null,
      cancelledAt: input.status === "CANCELLED" ? new Date() : null
    },
    include: engagementInclude
  });

  return NextResponse.json({ engagement: formatEngagement(engagement) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("engagements:cancel");
  if ("error" in auth) return auth.error;
  const { engagementId } = await context.params;

  const parsed = cancelEngagementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Cancellation reason is required." }, { status: 400 });
  }

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, accountId: auth.session.account.id },
    select: { id: true, status: true }
  });
  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }
  if (engagement.status === "COMPLETED") {
    return NextResponse.json({ error: "Completed engagements cannot be cancelled." }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.engagementStatusEvent.create({
      data: {
        engagementId,
        status: "CANCELLED",
        note: parsed.data.reason,
        createdBy: auth.session.user.id
      }
    });

    return tx.engagement.update({
      where: { id: engagementId },
      data: {
        status: "CANCELLED",
        cancellationReason: parsed.data.reason,
        cancelledAt: new Date()
      },
      include: engagementInclude
    });
  });

  return NextResponse.json({ engagement: formatEngagement(updated) });
}
