import { AppShell } from "@/components/app/app-shell";
import { ClientDashboard } from "@/components/client-dashboard/client-dashboard";
import { requireRole } from "@/lib/auth/session";
import { getClientDashboard } from "@/lib/client-dashboard/data";

export default async function ClientPage() {
  const session = await requireRole(["CLIENT", "ADMIN"]);
  const dashboard = await getClientDashboard(session);

  return (
    <AppShell session={session} title="Client Dashboard" description="Track bookings, providers, messages, service history, and reviews in one place.">
      <ClientDashboard dashboard={dashboard} />
    </AppShell>
  );
}
