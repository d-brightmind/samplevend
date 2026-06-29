import { prisma } from "@/lib/prisma";
import type { SessionContext } from "@/lib/auth/types";

function now() {
  return new Date();
}

export async function getClientDashboard(session: SessionContext) {
  const email = session.user.email.toLowerCase();
  const today = now();

  const [upcomingBookings, bookingHistory, upcomingEngagements, completedEngagements, messages, reviews] =
    await Promise.all([
      prisma.bookingRequest.findMany({
        where: {
          clientEmail: email,
          status: { in: ["REQUESTED", "CONFIRMED"] },
          requestedStart: { gte: today }
        },
        include: { resource: true, providerService: true },
        orderBy: { requestedStart: "asc" },
        take: 6
      }),
      prisma.bookingRequest.findMany({
        where: {
          clientEmail: email,
          OR: [{ requestedStart: { lt: today } }, { status: { in: ["DECLINED", "CANCELLED", "CONVERTED"] } }]
        },
        include: { resource: true, providerService: true },
        orderBy: { requestedStart: "desc" },
        take: 8
      }),
      prisma.engagement.findMany({
        where: {
          clientEmail: email,
          status: { in: ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] }
        },
        include: { resource: true },
        orderBy: { scheduledStart: "asc" },
        take: 6
      }),
      prisma.engagement.findMany({
        where: {
          clientEmail: email,
          status: { in: ["COMPLETED", "CANCELLED"] }
        },
        include: { resource: true },
        orderBy: { updatedAt: "desc" },
        take: 8
      }),
      prisma.clientMessage.findMany({
        where: { clientEmail: email },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.providerReview.findMany({
        where: { reviewerEmail: email },
        include: { resource: true },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    ]);

  const providers = new Map<string, {
    id: string;
    name: string;
    title: string | null;
    photoUrl: string | null;
    status: string;
    locationLabel: string | null;
    nextVisit: string | null;
  }>();

  [...upcomingBookings, ...bookingHistory].forEach((booking) => {
    providers.set(booking.resource.id, {
      id: booking.resource.id,
      name: booking.resource.name,
      title: booking.resource.title,
      photoUrl: booking.resource.photoUrl,
      status: booking.resource.status,
      locationLabel: booking.resource.locationLabel,
      nextVisit: booking.requestedStart.toISOString()
    });
  });

  [...upcomingEngagements, ...completedEngagements].forEach((engagement) => {
    if (!engagement.resource) return;
    providers.set(engagement.resource.id, {
      id: engagement.resource.id,
      name: engagement.resource.name,
      title: engagement.resource.title,
      photoUrl: engagement.resource.photoUrl,
      status: engagement.resource.status,
      locationLabel: engagement.resource.locationLabel,
      nextVisit: engagement.scheduledStart?.toISOString() ?? null
    });
  });

  const upcoming = [
    ...upcomingBookings.map((booking) => ({
      id: booking.id,
      kind: "booking" as const,
      title: booking.serviceName,
      providerName: booking.resource.name,
      status: booking.status,
      startsAt: booking.requestedStart.toISOString(),
      locationLabel: booking.locationLabel,
      serviceName: booking.providerService?.name ?? booking.serviceName
    })),
    ...upcomingEngagements.map((engagement) => ({
      id: engagement.id,
      kind: "engagement" as const,
      title: engagement.title,
      providerName: engagement.resource?.name ?? "Provider pending",
      status: engagement.status,
      startsAt: engagement.scheduledStart?.toISOString() ?? null,
      locationLabel: engagement.locationLabel,
      serviceName: engagement.serviceType ?? "Service"
    }))
  ].sort((a, b) => new Date(a.startsAt ?? 0).getTime() - new Date(b.startsAt ?? 0).getTime());

  const history = [
    ...bookingHistory.map((booking) => ({
      id: booking.id,
      kind: "booking" as const,
      title: booking.serviceName,
      providerName: booking.resource.name,
      status: booking.status,
      date: booking.requestedStart.toISOString()
    })),
    ...completedEngagements.map((engagement) => ({
      id: engagement.id,
      kind: "engagement" as const,
      title: engagement.title,
      providerName: engagement.resource?.name ?? "Provider",
      status: engagement.status,
      date: engagement.completedAt?.toISOString() ?? engagement.updatedAt.toISOString()
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    metrics: {
      upcomingBookings: upcoming.length,
      completedBookings: history.filter((item) => item.status === "COMPLETED" || item.status === "CONVERTED").length,
      providers: providers.size,
      unreadMessages: messages.filter((message) => !message.isRead).length,
      reviews: reviews.length
    },
    upcoming,
    history,
    providers: Array.from(providers.values()).slice(0, 6),
    messages: messages.map((message) => ({
      id: message.id,
      subject: message.subject,
      body: message.body,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString()
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      providerName: review.resource.name,
      rating: review.rating,
      comment: review.comment,
      serviceName: review.serviceName,
      createdAt: review.createdAt.toISOString()
    }))
  };
}

export type ClientDashboardData = Awaited<ReturnType<typeof getClientDashboard>>;
