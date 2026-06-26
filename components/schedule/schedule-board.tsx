import Link from "next/link";
import { CalendarClock, Clock3, MapPin, UserRound } from "lucide-react";
import { EngagementStatusBadge, type EngagementStatus } from "@/components/engagements/engagement-status-badge";
import { ScheduleAssignControl } from "@/components/schedule/schedule-assign-control";
import { eachDay, weekdayKey, type ScheduleView } from "@/lib/schedule/range";

type ScheduleResource = {
  id: string;
  name: string;
  title: string | null;
  status: string;
  availability: {
    weekday: string;
    startTime: string;
    endTime: string;
    timezone: string;
    isWorking: boolean;
  }[];
};

type ScheduleEngagement = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  locationLabel: string | null;
  resource: { id: string; name: string } | null;
};

function minutesSinceStart(value: string, rangeStart: Date) {
  return Math.max(0, (new Date(value).getTime() - rangeStart.getTime()) / 60000);
}

function dayBlockStyle(engagement: ScheduleEngagement, rangeStart: Date) {
  if (!engagement.scheduledStart || !engagement.scheduledEnd) return {};
  const start = minutesSinceStart(engagement.scheduledStart, rangeStart);
  const end = minutesSinceStart(engagement.scheduledEnd, rangeStart);
  const left = Math.max(0, Math.min(100, (start / 1440) * 100));
  const width = Math.max(7, Math.min(100 - left, ((end - start) / 1440) * 100));
  return { left: `${left}%`, width: `${width}%` };
}

function formatTime(value?: string | null) {
  if (!value) return "Unscheduled";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function availabilityFor(resource: ScheduleResource, date: Date) {
  return resource.availability.find((item) => item.weekday === weekdayKey(date));
}

function isSameDay(value: string | null, date: Date) {
  if (!value) return false;
  const next = new Date(value);
  return next.toDateString() === date.toDateString();
}

export function ScheduleBoard({
  view,
  rangeStart,
  resources,
  engagements
}: {
  view: ScheduleView;
  rangeStart: Date;
  resources: ScheduleResource[];
  engagements: ScheduleEngagement[];
}) {
  const days = view === "week" ? eachDay(rangeStart, 7) : [rangeStart];
  const assigned = engagements.filter((engagement) => engagement.resource);
  const unassigned = engagements.filter((engagement) => !engagement.resource);
  const resourceOptions = resources.map((resource) => ({ id: resource.id, name: resource.name }));

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card">
        <div className="grid grid-cols-[12rem_1fr] border-b px-4 py-3 text-xs font-medium uppercase tracking-normal text-muted-foreground">
          <span>Resource</span>
          <div className={view === "week" ? "grid grid-cols-7 gap-2" : "grid grid-cols-4 gap-2"}>
            {view === "week" ? days.map((day) => (
              <span key={day.toISOString()}>{day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
            )) : ["00:00", "06:00", "12:00", "18:00"].map((hour) => <span key={hour}>{hour}</span>)}
          </div>
        </div>

        {resources.length > 0 ? resources.map((resource) => {
          const resourceEngagements = assigned.filter((engagement) => engagement.resource?.id === resource.id);
          return (
            <div key={resource.id} className="grid min-h-32 grid-cols-[12rem_1fr] border-b last:border-b-0">
              <div className="border-r p-4">
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-muted-foreground">{resource.title || "Resource"}</p>
                <span className="mt-2 inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium">{resource.status.toLowerCase()}</span>
              </div>
              <div className={view === "week" ? "grid grid-cols-7 gap-2 p-3" : "relative min-h-32 p-3"}>
                {view === "week" ? days.map((day) => {
                  const availability = availabilityFor(resource, day);
                  const dayEngagements = resourceEngagements.filter((engagement) => isSameDay(engagement.scheduledStart, day));
                  return (
                    <div key={day.toISOString()} className="min-h-28 rounded-md border bg-background p-2">
                      <p className="text-xs text-muted-foreground">
                        {availability?.isWorking ? `${availability.startTime}-${availability.endTime}` : "Unavailable"}
                      </p>
                      <div className="mt-2 space-y-2">
                        {dayEngagements.map((engagement) => (
                          <Link key={engagement.id} href={`/engagements/${engagement.id}`} className="block rounded-md border bg-primary/10 p-2 text-xs hover:border-primary">
                            <span className="block font-medium text-foreground">{engagement.title}</span>
                            <span className="text-muted-foreground">{formatTime(engagement.scheduledStart)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }) : (
                  <>
                    <div className="absolute inset-x-3 top-3 flex h-8 items-center rounded-md bg-secondary px-3 text-xs text-muted-foreground">
                      {availabilityFor(resource, rangeStart)?.isWorking
                        ? `Available ${availabilityFor(resource, rangeStart)?.startTime}-${availabilityFor(resource, rangeStart)?.endTime}`
                        : "No working hours set"}
                    </div>
                    <div className="absolute inset-x-3 bottom-3 top-14 rounded-md border bg-background">
                      {[25, 50, 75].map((left) => <span key={left} className="absolute top-0 h-full border-l" style={{ left: `${left}%` }} />)}
                      {resourceEngagements.map((engagement) => (
                        <Link
                          key={engagement.id}
                          href={`/engagements/${engagement.id}`}
                          className="absolute top-4 rounded-md border border-primary/30 bg-primary/10 p-2 text-xs shadow-sm hover:border-primary"
                          style={dayBlockStyle(engagement, rangeStart)}
                        >
                          <span className="block truncate font-medium text-foreground">{engagement.title}</span>
                          <span className="text-muted-foreground">{formatTime(engagement.scheduledStart)}-{formatTime(engagement.scheduledEnd)}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="p-6 text-sm text-muted-foreground">No active resources are available for scheduling.</div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">Unassigned engagements</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {unassigned.length > 0 ? unassigned.map((engagement) => (
            <div key={engagement.id} className="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_18rem] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/engagements/${engagement.id}`} className="font-medium hover:underline">{engagement.title}</Link>
                  <EngagementStatusBadge status={engagement.status as EngagementStatus} />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UserRound className="h-4 w-4" aria-hidden="true" />{engagement.clientName}</span>
                  <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" aria-hidden="true" />{formatTime(engagement.scheduledStart)}-{formatTime(engagement.scheduledEnd)}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{engagement.locationLabel || "No location"}</span>
                </div>
              </div>
              <ScheduleAssignControl engagementId={engagement.id} resources={resourceOptions} />
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No unassigned engagements in this schedule window.</p>
          )}
        </div>
      </section>
    </div>
  );
}
