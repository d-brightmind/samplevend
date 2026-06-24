import { BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/auth/session";

export default async function AdminPage() {
  const session = await requireRole(["ADMIN"]);
  return (
    <AppShell session={session} title="Admin workspace" description="Manage accounts, users, roles, and operational controls.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard icon={Users} label="Team access" value="Ready" detail="Invite admins, dispatchers, and resources." />
        <DashboardCard icon={ShieldCheck} label="Permissions" value="Enforced" detail="Server-side role checks are active." />
        <DashboardCard icon={BriefcaseBusiness} label="Account" value="Active" detail="Workspace is verified for operations." />
      </div>
      <EmptyState icon={BriefcaseBusiness} title="No operational modules yet" description="Jobs, billing, and customer workflows will appear here as VendoBird modules are connected." />
    </AppShell>
  );
}
