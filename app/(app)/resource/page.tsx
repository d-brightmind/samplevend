import { ClipboardList } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { ProviderDashboard } from "@/components/provider-dashboard/provider-dashboard";
import { requireRole } from "@/lib/auth/session";
import { getIndividualProviderDashboard } from "@/lib/provider-dashboard/data";

export default async function ResourcePage() {
  const session = await requireRole(["ADMIN", "DISPATCHER", "RESOURCE"]);
  const dashboard = await getIndividualProviderDashboard(session);

  return (
    <AppShell session={session} title="Individual Provider Dashboard" description="Manage today’s schedule, route context, clients, notifications, and AI-powered operational suggestions.">
      {dashboard ? (
        <ProviderDashboard dashboard={dashboard} />
      ) : (
        <EmptyState icon={ClipboardList} title="No provider resource found" description="Create or assign a resource profile to this user to activate the individual provider dashboard." />
      )}
    </AppShell>
  );
}
