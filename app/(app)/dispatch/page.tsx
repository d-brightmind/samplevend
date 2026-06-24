import { MapPinned, Route, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/auth/session";

export default async function DispatchPage() {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  return (
    <AppShell session={session} title="Dispatch command" description="Coordinate jobs, resources, schedules, and service coverage.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard icon={Route} label="Routes" value="0" detail="No active route plans." />
        <DashboardCard icon={Users} label="Resources" value="0" detail="No resources assigned today." />
        <DashboardCard icon={MapPinned} label="Coverage" value="Live" detail="Mapbox-ready dispatch surface." />
      </div>
      <EmptyState icon={MapPinned} title="No jobs to dispatch" description="New service requests will appear here with location, priority, and assignment actions." />
    </AppShell>
  );
}
