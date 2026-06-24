import { CalendarClock, CheckCircle2, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/auth/session";

export default async function ResourcePage() {
  const session = await requireRole(["ADMIN", "DISPATCHER", "RESOURCE"]);
  return (
    <AppShell session={session} title="Resource workspace" description="View assignments, manage availability, and update job progress.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard icon={ClipboardList} label="Assigned jobs" value="0" detail="No open assignments." />
        <DashboardCard icon={CalendarClock} label="Availability" value="Open" detail="Availability controls are ready." />
        <DashboardCard icon={CheckCircle2} label="Updates" value="Synced" detail="Realtime-ready job status flow." />
      </div>
      <EmptyState icon={ClipboardList} title="No assigned work" description="Assigned jobs will appear here with status actions and customer context." />
    </AppShell>
  );
}
