import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";
import { ResourceAvatar } from "@/components/resources/resource-avatar";
import { StatusBadge, type ResourceStatus } from "@/components/resources/status-badge";
import type { FormattedResource } from "@/lib/resources/format";

function workingHours(resource: FormattedResource) {
  const active = resource.availability.filter((item) => item.isWorking);
  if (active.length === 0) return "No hours set";
  const first = active[0];
  return `${first.startTime}-${first.endTime} ${first.timezone}`;
}

export function ResourceCard({ resource }: { resource: FormattedResource }) {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex gap-3">
        <ResourceAvatar name={resource.name} photoUrl={resource.photoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="truncate text-base font-semibold">{resource.name}</h2>
              <p className="text-sm text-muted-foreground">{resource.title || "Resource"}</p>
            </div>
            <StatusBadge status={resource.status as ResourceStatus} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {resource.skills.length > 0 ? (
              resource.skills.slice(0, 4).map((skill) => (
                <span key={skill.id} className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                  {skill.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No skills assigned</span>
            )}
          </div>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {workingHours(resource)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {resource.locationLabel || "No location"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
