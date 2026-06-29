import { prisma } from "@/lib/prisma";
import type { SessionContext } from "@/lib/auth/types";
import { weekdayKey } from "@/lib/schedule/range";

function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function getIndividualProviderDashboard(session: SessionContext) {
  const todayStart = startOfDay();
  const tomorrowStart = addDays(todayStart, 1);
  const upcomingEnd = addDays(todayStart, 14);

  const resource = await prisma.resource.findFirst({
    where: {
      accountId: session.account.id,
      isActive: true,
      OR: [
        { userProfileId: session.user.id },
        ...(session.role === "RESOURCE" ? [{ email: session.user.email }] : [])
      ]
    },
    include: {
      availability: true,
      skills: { include: { skill: true } },
      reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 3 }
    }
  }) ?? await prisma.resource.findFirst({
    where: { accountId: session.account.id, isActive: true },
    include: {
      availability: true,
      skills: { include: { skill: true } },
      reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 3 }
    },
    orderBy: { createdAt: "asc" }
  });

  if (!resource) {
    return null;
  }

  const [todayJobs, upcomingJobs, requestedBookings, activeJobs] = await Promise.all([
    prisma.engagement.findMany({
      where: {
        accountId: session.account.id,
        resourceId: resource.id,
        scheduledStart: { gte: todayStart, lt: tomorrowStart },
        status: { in: ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] }
      },
      orderBy: { scheduledStart: "asc" }
    }),
    prisma.engagement.findMany({
      where: {
        accountId: session.account.id,
        resourceId: resource.id,
        scheduledStart: { gte: tomorrowStart, lt: upcomingEnd },
        status: { in: ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] }
      },
      orderBy: { scheduledStart: "asc" },
      take: 8
    }),
    prisma.bookingRequest.findMany({
      where: {
        accountId: session.account.id,
        resourceId: resource.id,
        status: "REQUESTED"
      },
      orderBy: { requestedStart: "asc" },
      take: 6
    }),
    prisma.engagement.count({
      where: {
        accountId: session.account.id,
        resourceId: resource.id,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] }
      }
    })
  ]);

  const todayAvailability = resource.availability.find((item) => item.weekday === weekdayKey(todayStart));
  const completedToday = await prisma.engagement.count({
    where: {
      accountId: session.account.id,
      resourceId: resource.id,
      completedAt: { gte: todayStart, lt: tomorrowStart }
    }
  });

  const clients = Array.from(
    new Map(
      [...todayJobs, ...upcomingJobs].map((job) => [
        job.clientEmail ?? job.clientName,
        {
          name: job.clientName,
          email: job.clientEmail,
          phone: job.clientPhone,
          nextJob: job.title,
          nextVisit: job.scheduledStart?.toISOString() ?? null
        }
      ])
    ).values()
  ).slice(0, 5);

  const notifications = [
    ...requestedBookings.map((booking) => ({
      id: booking.id,
      title: "New booking request",
      detail: `${booking.clientName} requested ${booking.serviceName}`,
      tone: "info" as const
    })),
    ...todayJobs
      .filter((job) => job.status === "IN_PROGRESS")
      .map((job) => ({
        id: job.id,
        title: "Job in progress",
        detail: `${job.title} is currently active`,
        tone: "success" as const
      }))
  ].slice(0, 5);

  const aiSuggestions = [
    todayJobs.length > 1
      ? "Review today's route before leaving to reduce travel time between clients."
      : "Use open time today to confirm upcoming bookings and update availability.",
    requestedBookings.length > 0
      ? "Respond to new booking requests while client intent is fresh."
      : "No pending booking requests. Keep your profile services current to improve conversion.",
    todayAvailability?.isWorking
      ? `You are marked available ${todayAvailability.startTime}-${todayAvailability.endTime} today.`
      : "No working hours are set for today. Add availability to receive better assignments."
  ];

  return {
    resource: {
      id: resource.id,
      name: resource.name,
      title: resource.title,
      photoUrl: resource.photoUrl,
      status: resource.status,
      locationLabel: resource.locationLabel,
      latitude: resource.latitude ? Number(resource.latitude) : null,
      longitude: resource.longitude ? Number(resource.longitude) : null,
      ratingAverage: resource.ratingAverage ? Number(resource.ratingAverage) : null,
      ratingCount: resource.ratingCount,
      skills: resource.skills.map((item) => item.skill.name)
    },
    metrics: {
      todayJobs: todayJobs.length,
      upcomingJobs: upcomingJobs.length,
      activeJobs,
      completedToday,
      pendingRequests: requestedBookings.length
    },
    todayAvailability: todayAvailability
      ? {
          startTime: todayAvailability.startTime,
          endTime: todayAvailability.endTime,
          timezone: todayAvailability.timezone,
          isWorking: todayAvailability.isWorking
        }
      : null,
    todayJobs: todayJobs.map(formatProviderJob),
    upcomingJobs: upcomingJobs.map(formatProviderJob),
    clients,
    notifications,
    aiSuggestions
  };
}

function formatProviderJob(job: Awaited<ReturnType<typeof prisma.engagement.findMany>>[number]) {
  return {
    id: job.id,
    title: job.title,
    clientName: job.clientName,
    clientEmail: job.clientEmail,
    clientPhone: job.clientPhone,
    serviceType: job.serviceType,
    status: job.status,
    scheduledStart: job.scheduledStart?.toISOString() ?? null,
    scheduledEnd: job.scheduledEnd?.toISOString() ?? null,
    locationLabel: job.locationLabel,
    latitude: job.latitude ? Number(job.latitude) : null,
    longitude: job.longitude ? Number(job.longitude) : null
  };
}
