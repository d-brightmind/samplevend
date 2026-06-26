import { prisma } from "@/lib/prisma";

const blockingStatuses = ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] as const;

export async function findResourceScheduleConflict({
  accountId,
  resourceId,
  scheduledStart,
  scheduledEnd,
  excludeEngagementId
}: {
  accountId: string;
  resourceId?: string | null;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  excludeEngagementId?: string;
}) {
  if (!resourceId || !scheduledStart || !scheduledEnd) {
    return null;
  }

  return prisma.engagement.findFirst({
    where: {
      accountId,
      resourceId,
      id: excludeEngagementId ? { not: excludeEngagementId } : undefined,
      status: { in: [...blockingStatuses] },
      scheduledStart: { lt: scheduledEnd },
      scheduledEnd: { gt: scheduledStart }
    },
    select: {
      id: true,
      title: true,
      scheduledStart: true,
      scheduledEnd: true
    }
  });
}
