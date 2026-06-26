import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Edit, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { CancelEngagementButton, EngagementStatusButton } from "@/components/engagements/engagement-actions";
import { EngagementStatusBadge, type EngagementStatus } from "@/components/engagements/engagement-status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";

type PageProps = { params: Promise<{ engagementId: string }> };

function formatWindow(start?: string | null, end?: string | null) {
  if (!start || !end) return "No schedule set";
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} - ${endDate.toLocaleTimeString([], { timeStyle: "short" })}`;
}

export default async function EngagementProfilePage({ params }: PageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const { engagementId } = await params;
  const engagementRecord = await prisma.engagement.findFirst({
    where: { id: engagementId, accountId: session.account.id },
    include: engagementInclude
  });

  if (!engagementRecord) notFound();
  const engagement = formatEngagement(engagementRecord);
  const isClosed = engagement.status === "COMPLETED" || engagement.status === "CANCELLED";

  return (
    <AppShell session={session} title="Engagement profile" description="Review service scope, resource assignment, schedule, status, and location.">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{engagement.title}</h2>
              <EngagementStatusBadge status={engagement.status as EngagementStatus} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{engagement.serviceType || "Service engagement"}</p>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><UserRound className="h-4 w-4" aria-hidden="true" />{engagement.clientName}</span>
              {engagement.clientEmail ? <span className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden="true" />{engagement.clientEmail}</span> : null}
              {engagement.clientPhone ? <span className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden="true" />{engagement.clientPhone}</span> : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={`/engagements/${engagement.id}/edit`}>
                <Edit className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <EngagementStatusButton engagementId={engagement.id} status="IN_PROGRESS" label="Start" />
            <EngagementStatusButton engagementId={engagement.id} status="COMPLETED" label="Complete" />
            <CancelEngagementButton engagementId={engagement.id} disabled={isClosed} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold">Work details</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{engagement.description || "No description provided."}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold">Status history</h3>
            <div className="mt-3 space-y-3">
              {engagement.statusEvents.length > 0 ? engagement.statusEvents.map((event) => (
                <div key={event.id} className="border-l-2 border-primary/30 pl-3 text-sm">
                  <p className="font-medium">{event.status.replace("_", " ").toLowerCase()}</p>
                  <p className="text-muted-foreground">{event.note || "Status updated"}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No status events yet.</p>}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />Schedule</h3>
            <p className="mt-3 text-sm text-muted-foreground">{formatWindow(engagement.scheduledStart, engagement.scheduledEnd)}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-primary" aria-hidden="true" />Assigned resource</h3>
            <p className="mt-3 text-sm text-muted-foreground">{engagement.resource?.name || "Unassigned"}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />Location</h3>
            <p className="mt-3 text-sm text-muted-foreground">{engagement.locationLabel || "No location provided."}</p>
            {engagement.latitude && engagement.longitude ? (
              <p className="mt-2 text-sm font-medium">{engagement.latitude}, {engagement.longitude}</p>
            ) : null}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
