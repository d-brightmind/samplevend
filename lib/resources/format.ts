import type { Prisma } from "@prisma/client";

export const resourceInclude = {
  skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
  availability: { orderBy: { weekday: "asc" } },
  statusEvents: { orderBy: { createdAt: "desc" }, take: 5 }
} satisfies Prisma.ResourceInclude;

type ResourceWithRelations = Prisma.ResourceGetPayload<{ include: typeof resourceInclude }>;

export function formatResource(resource: ResourceWithRelations) {
  return {
    id: resource.id,
    photoUrl: resource.photoUrl,
    name: resource.name,
    email: resource.email,
    phone: resource.phone,
    title: resource.title,
    status: resource.status,
    isActive: resource.isActive,
    locationLabel: resource.locationLabel,
    latitude: resource.latitude ? Number(resource.latitude) : null,
    longitude: resource.longitude ? Number(resource.longitude) : null,
    lastSeenAt: resource.lastSeenAt?.toISOString() ?? null,
    notes: resource.notes,
    skills: resource.skills.map((item) => ({
      id: item.skill.id,
      name: item.skill.name,
      color: item.skill.color
    })),
    availability: resource.availability.map((item) => ({
      id: item.id,
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      timezone: item.timezone,
      isWorking: item.isWorking
    })),
    statusEvents: resource.statusEvents.map((event) => ({
      id: event.id,
      status: event.status,
      note: event.note,
      createdAt: event.createdAt.toISOString()
    }))
  };
}

export type FormattedResource = ReturnType<typeof formatResource>;
