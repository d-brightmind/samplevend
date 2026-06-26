import { AppShell } from "@/components/app/app-shell";
import { DispatchAssignPanel } from "@/components/dispatch/dispatch-assign-panel";
import { DispatchMap } from "@/components/dispatch/dispatch-map";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { getDispatchMapData } from "@/lib/dispatch/map-data";

export default async function DispatchMapPage() {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const [mapData, assignableEngagements, resources] = await Promise.all([
    getDispatchMapData(session.account.id),
    prisma.engagement.findMany({
      where: {
        accountId: session.account.id,
        status: { in: ["UNSCHEDULED", "SCHEDULED", "ASSIGNED"] },
        scheduledStart: { not: null },
        scheduledEnd: { not: null }
      },
      include: { resource: true, statusEvents: { orderBy: { createdAt: "desc" }, take: 3 } },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }]
    }),
    prisma.resource.findMany({
      where: { accountId: session.account.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, status: true }
    })
  ]);

  return (
    <AppShell session={session} title="Dispatch map" description="Monitor live resource locations, engagement markers, travel radius, conflicts, and assignments from one operational map.">
      <DispatchMap
        initialResources={mapData.resources}
        initialEngagements={mapData.engagements}
        accountId={session.account.id}
        mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
        supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}
      />
      <DispatchAssignPanel
        resources={resources}
        engagements={mapData.engagements
          .filter((engagement) => assignableEngagements.some((item) => item.id === engagement.id))
          .map((engagement) => ({
            id: engagement.id,
            title: engagement.title,
            clientName: engagement.clientName,
            conflict: engagement.conflict
          }))}
      />
    </AppShell>
  );
}
