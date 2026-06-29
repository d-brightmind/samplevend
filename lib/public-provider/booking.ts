import { prisma } from "@/lib/prisma";
import { weekdayKey } from "@/lib/schedule/range";

export async function getBookingProvider(slug: string) {
  return prisma.resource.findFirst({
    where: {
      publicSlug: slug,
      isActive: true,
      account: { isActive: true }
    },
    include: {
      account: true,
      publicServices: { orderBy: [{ isFeatured: "desc" }, { name: "asc" }] },
      availability: { orderBy: { weekday: "asc" } }
    }
  });
}

export function buildBookingSlots(
  availability: { weekday: string; startTime: string; endTime: string; isWorking: boolean }[],
  days = 10
) {
  const slots: { startsAt: string; label: string }[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const date = new Date();
    date.setDate(now.getDate() + dayOffset);
    const workingDay = availability.find((item) => item.weekday === weekdayKey(date) && item.isWorking);
    if (!workingDay) continue;

    const [startHour, startMinute] = workingDay.startTime.split(":").map(Number);
    const [endHour, endMinute] = workingDay.endTime.split(":").map(Number);
    const cursor = new Date(date);
    cursor.setHours(startHour, startMinute, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    while (cursor < end) {
      if (cursor.getTime() > now.getTime() + 30 * 60 * 1000) {
        slots.push({
          startsAt: cursor.toISOString(),
          label: cursor.toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })
        });
      }
      cursor.setMinutes(cursor.getMinutes() + 60);
    }
  }

  return slots.slice(0, 24);
}
