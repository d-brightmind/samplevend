import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { EngagementCard } from "@/components/engagements/engagement-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";

export default async function EngagementsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const params = await searchParams;
  const engagements = await prisma.engagement.findMany({
    where: {
      accountId: session.account.id,
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: "insensitive" } },
              { clientName: { contains: params.q, mode: "insensitive" } },
              { serviceType: { contains: params.q, mode: "insensitive" } },
              { locationLabel: { contains: params.q, mode: "insensitive" } },
              { resource: { name: { contains: params.q, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: engagementInclude,
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }]
  });

  return (
    <AppShell session={session} title="Engagement management" description="Create, schedule, assign, track, and close service engagements.">
      <section className="rounded-lg border bg-card p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input name="q" defaultValue={params.q ?? ""} placeholder="Search client, service, resource, or location" className="pl-9" />
          </div>
          <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">All statuses</option>
            <option value="UNSCHEDULED">Unscheduled</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            <Button asChild>
              <Link href="/engagements/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create
              </Link>
            </Button>
          </div>
        </form>
      </section>

      {engagements.length > 0 ? (
        <section className="grid gap-4">
          {engagements.map((engagement) => (
            <EngagementCard key={engagement.id} engagement={formatEngagement(engagement)} />
          ))}
        </section>
      ) : (
        <EmptyState icon={ClipboardList} title="No engagements found" description="Create the first engagement or adjust the filters to review active service work." />
      )}
    </AppShell>
  );
}
