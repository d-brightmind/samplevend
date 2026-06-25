import Link from "next/link";
import { Plus, Search, UserRoundCog } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { ResourceCard } from "@/components/resources/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { formatResource, resourceInclude } from "@/lib/resources/format";

export default async function ResourcesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const params = await searchParams;
  const resources = await prisma.resource.findMany({
    where: {
      accountId: session.account.id,
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q, mode: "insensitive" } },
              { title: { contains: params.q, mode: "insensitive" } },
              { locationLabel: { contains: params.q, mode: "insensitive" } },
              { skills: { some: { skill: { name: { contains: params.q, mode: "insensitive" } } } } }
            ]
          }
        : {})
    },
    include: resourceInclude,
    orderBy: [{ isActive: "desc" }, { name: "asc" }]
  });

  return (
    <AppShell session={session} title="Resource directory" description="Manage service capacity, skills, availability, status, and current locations.">
      <section className="rounded-lg border bg-card p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input name="q" defaultValue={params.q ?? ""} placeholder="Search name, skill, or location" className="pl-9" />
          </div>
          <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            <Button asChild>
              <Link href="/resources/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </Link>
            </Button>
          </div>
        </form>
      </section>

      {resources.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={formatResource(resource)} />
          ))}
        </section>
      ) : (
        <EmptyState icon={UserRoundCog} title="No resources found" description="Add your first resource or adjust the filters to see available providers and team members." />
      )}
    </AppShell>
  );
}
