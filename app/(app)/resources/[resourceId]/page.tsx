import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Edit, Mail, MapPin, Phone, Radar, UserRoundCog } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { DeactivateResourceButton } from "@/components/resources/resource-actions";
import { ResourceAvatar } from "@/components/resources/resource-avatar";
import { StatusBadge, type ResourceStatus } from "@/components/resources/status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { formatResource, resourceInclude } from "@/lib/resources/format";

type PageProps = { params: Promise<{ resourceId: string }> };

export default async function ResourceProfilePage({ params }: PageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const { resourceId } = await params;
  const resourceRecord = await prisma.resource.findFirst({
    where: { id: resourceId, accountId: session.account.id },
    include: resourceInclude
  });

  if (!resourceRecord) notFound();
  const resource = formatResource(resourceRecord);

  return (
    <AppShell session={session} title="Resource profile" description="Review resource status, skills, working hours, and current location.">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <ResourceAvatar name={resource.name} photoUrl={resource.photoUrl} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">{resource.name}</h2>
                <StatusBadge status={resource.status as ResourceStatus} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{resource.title || "Resource"}</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {resource.email ? <span className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden="true" />{resource.email}</span> : null}
                {resource.phone ? <span className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden="true" />{resource.phone}</span> : null}
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" />{resource.locationLabel || "No current location"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={`/resources/${resource.id}/edit`}>
                <Edit className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <DeactivateResourceButton resourceId={resource.id} disabled={!resource.isActive} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {resource.skills.length > 0 ? resource.skills.map((skill) => (
                <span key={skill.id} className="rounded-md bg-secondary px-2 py-1 text-sm font-medium">{skill.name}</span>
              )) : <p className="text-sm text-muted-foreground">No skills assigned.</p>}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold">Availability</h3>
            <div className="mt-3 grid gap-2">
              {resource.availability.length > 0 ? resource.availability.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{item.weekday.toLowerCase()}</span>
                  <span className="text-muted-foreground">{item.isWorking ? `${item.startTime}-${item.endTime} ${item.timezone}` : "Not working"}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">No working hours set.</p>}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Radar className="h-4 w-4 text-primary" aria-hidden="true" />Current location</h3>
            <p className="mt-3 text-sm text-muted-foreground">{resource.locationLabel || "No location reported."}</p>
            {resource.latitude && resource.longitude ? (
              <p className="mt-2 text-sm font-medium">{resource.latitude}, {resource.longitude}</p>
            ) : null}
            <div className="mt-4 grid h-40 place-items-center rounded-md border border-dashed bg-secondary text-center text-sm text-muted-foreground">
              Mapbox location preview ready
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />Status history</h3>
            <div className="mt-3 space-y-3">
              {resource.statusEvents.length > 0 ? resource.statusEvents.map((event) => (
                <div key={event.id} className="border-l-2 border-primary/30 pl-3 text-sm">
                  <p className="font-medium">{event.status.replace("_", " ").toLowerCase()}</p>
                  <p className="text-muted-foreground">{event.note || "Status updated"}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No status events yet.</p>}
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
