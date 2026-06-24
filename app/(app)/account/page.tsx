import { ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/auth/session";

export default async function AccountPage() {
  const session = await requireRole(["ADMIN"]);
  return (
    <AppShell session={session} title="Account settings" description="Manage workspace identity, members, security, and permissions.">
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState icon={Users} title="No invited users" description="Admins will be able to invite dispatchers and resources from this area." />
        <EmptyState icon={ShieldCheck} title="Role permissions active" description="Permission assignments are centralized and enforced by server checks." />
      </div>
    </AppShell>
  );
}
