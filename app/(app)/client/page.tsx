import { CreditCard, FileText, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/auth/session";

export default async function ClientPage() {
  const session = await requireRole(["CLIENT"]);
  return (
    <AppShell session={session} title="Client workspace" description="Request services, track jobs, and review invoices.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard icon={PlusCircle} label="Requests" value="0" detail="No current service requests." />
        <DashboardCard icon={FileText} label="History" value="Ready" detail="Completed work will be listed here." />
        <DashboardCard icon={CreditCard} label="Invoices" value="0" detail="No invoices due." />
      </div>
      <EmptyState icon={PlusCircle} title="No service requests yet" description="Once request creation is connected, clients can start and track service work from this page." />
    </AppShell>
  );
}
