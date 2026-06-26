import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { ScheduleBoard } from "@/components/schedule/schedule-board";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { formatEngagement } from "@/lib/engagements/format";
import { getScheduleRange, parseScheduleDate, parseScheduleView, toInputDate, type ScheduleView } from "@/lib/schedule/range";

function shiftDate(date: Date, view: ScheduleView, direction: -1 | 1) {
  const next = new Date(date);
  next.setDate(next.getDate() + (view === "week" ? 7 * direction : direction));
  return next;
}

export default async function SchedulePage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const params = await searchParams;
  const view = parseScheduleView(params.view);
  const selectedDate = parseScheduleDate(params.date);
  const { start, end } = getScheduleRange(view, selectedDate);

  const [resources, engagements] = await Promise.all([
    prisma.resource.findMany({
      where: { accountId: session.account.id, isActive: true },
      include: { availability: true },
      orderBy: { name: "asc" }
    }),
    prisma.engagement.findMany({
      where: {
        accountId: session.account.id,
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

  const previousDate = toInputDate(shiftDate(selectedDate, view, -1));
  const nextDate = toInputDate(shiftDate(selectedDate, view, 1));
  const currentDate = toInputDate(selectedDate);

  return (
    <AppShell session={session} title="Schedule" description="Plan resource timelines, assign engagements, and spot availability gaps before they become dispatch problems.">
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant={view === "day" ? "default" : "outline"} size="sm">
            <Link href={`/schedule?view=day&date=${currentDate}`}>Day</Link>
          </Button>
          <Button asChild variant={view === "week" ? "default" : "outline"} size="sm">
            <Link href={`/schedule?view=week&date=${currentDate}`}>Week</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/schedule?view=${view}&date=${previousDate}`}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Link>
          </Button>
          <form className="flex gap-2">
            <input type="hidden" name="view" value={view} />
            <input
              name="date"
              type="date"
              defaultValue={currentDate}
              className="h-9 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" variant="secondary" size="sm">Go</Button>
          </form>
          <Button asChild variant="outline" size="sm">
            <Link href={`/schedule?view=${view}&date=${nextDate}`}>
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <ScheduleBoard
        view={view}
        rangeStart={start}
        resources={resources.map((resource) => ({
          id: resource.id,
          name: resource.name,
          title: resource.title,
          status: resource.status,
          availability: resource.availability
        }))}
        engagements={engagements.map(formatEngagement)}
      />
    </AppShell>
  );
}
