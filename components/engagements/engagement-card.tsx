import Link from "next/link";
import { CalendarClock, MapPin, UserRound } from "lucide-react";
import { EngagementStatusBadge, type EngagementStatus } from "@/components/engagements/engagement-status-badge";
import type { FormattedEngagement } from "@/lib/engagements/format";

function formatWindow(engagement: FormattedEngagement) {
  if (!engagement.scheduledStart || !engagement.scheduledEnd) return "No schedule set";
  const start = new Date(engagement.scheduledStart);
  const end = new Date(engagement.scheduledEnd);
  return `${start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} - ${end.toLocaleTimeString([], { timeStyle: "short" })}`;
}

export function EngagementCard({ engagement }: { engagement: FormattedEngagement }) {
  return (
    <Link
      href={`/engagements/${engagement.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{engagement.title}</h2>
          <p className="text-sm text-muted-foreground">{engagement.clientName}</p>
        </div>
        <EngagementStatusBadge status={engagement.status as EngagementStatus} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
        <span className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          {formatWindow(engagement)}
        </span>
        <span className="flex items-center gap-2">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {engagement.resource?.name ?? "Unassigned"}
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {engagement.locationLabel || "No location"}
        </span>
      </div>
      {engagement.serviceType ? (
        <span className="mt-3 inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium">
          {engagement.serviceType}
        </span>
      ) : null}
    </Link>
  );
}
