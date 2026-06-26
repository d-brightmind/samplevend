import { prisma } from "@/lib/prisma";
import { findResourceScheduleConflict } from "@/lib/engagements/conflicts";
import { formatEngagement } from "@/lib/engagements/format";

export async function getDispatchMapData(accountId: string) {
  const [resources, engagements] = await Promise.all([
    prisma.resource.findMany({
      where: {
        accountId,
        isActive: true
      },
      include: {
        skills: { include: { skill: true } },
        availability: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.engagement.findMany({
      where: {
        accountId,
        status: { in: ["UNSCHEDULED", "SCHEDULED", "ASSIGNED", "IN_PROGRESS"] }
      },
      include: { resource: true, statusEvents: { orderBy: { createdAt: "desc" }, take: 3 } },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }]
    })
  ]);

  const conflictPairs = await Promise.all(
    engagements.map(async (engagement) => {
      const conflict = await findResourceScheduleConflict({
        accountId,
        resourceId: engagement.resourceId,
        scheduledStart: engagement.scheduledStart,
        scheduledEnd: engagement.scheduledEnd,
        excludeEngagementId: engagement.id
      });
      return [engagement.id, conflict] as const;
    })
  );

  const conflicts = new Map(conflictPairs);

  return {
    resources: resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      title: resource.title,
      status: resource.status,
      locationLabel: resource.locationLabel,
      latitude: resource.latitude ? Number(resource.latitude) : null,
      longitude: resource.longitude ? Number(resource.longitude) : null,
      lastSeenAt: resource.lastSeenAt?.toISOString() ?? null,
      travelRadiusKm: 8,
      skills: resource.skills.map((item) => item.skill.name),
      availability: resource.availability
    })),
    engagements: engagements.map((engagement) => ({
      ...formatEngagement(engagement),
      conflict: conflicts.get(engagement.id)
        ? {
            engagementId: conflicts.get(engagement.id)!.id,
            title: conflicts.get(engagement.id)!.title
          }
        : null
    }))
  };
}
