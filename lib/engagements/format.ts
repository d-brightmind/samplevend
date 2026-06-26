import type { Prisma } from "@prisma/client";

export const engagementInclude = {
  resource: true,
  statusEvents: { orderBy: { createdAt: "desc" }, take: 6 }
} satisfies Prisma.EngagementInclude;

type EngagementWithRelations = Prisma.EngagementGetPayload<{ include: typeof engagementInclude }>;

export function formatEngagement(engagement: EngagementWithRelations) {
  return {
    id: engagement.id,
    title: engagement.title,
    clientName: engagement.clientName,
    clientEmail: engagement.clientEmail,
    clientPhone: engagement.clientPhone,
    serviceType: engagement.serviceType,
    description: engagement.description,
    status: engagement.status,
    scheduledStart: engagement.scheduledStart?.toISOString() ?? null,
    scheduledEnd: engagement.scheduledEnd?.toISOString() ?? null,
    locationLabel: engagement.locationLabel,
    latitude: engagement.latitude ? Number(engagement.latitude) : null,
    longitude: engagement.longitude ? Number(engagement.longitude) : null,
    cancellationReason: engagement.cancellationReason,
    cancelledAt: engagement.cancelledAt?.toISOString() ?? null,
    completedAt: engagement.completedAt?.toISOString() ?? null,
    resource: engagement.resource
      ? {
          id: engagement.resource.id,
          name: engagement.resource.name,
          photoUrl: engagement.resource.photoUrl,
          status: engagement.resource.status,
          locationLabel: engagement.resource.locationLabel
        }
      : null,
    statusEvents: engagement.statusEvents.map((event) => ({
      id: event.id,
      status: event.status,
      note: event.note,
      createdAt: event.createdAt.toISOString()
    }))
  };
}

export type FormattedEngagement = ReturnType<typeof formatEngagement>;
