import { AppShell } from "@/components/app/app-shell";
import { ResourceForm } from "@/components/resources/resource-form";
import { requireRole } from "@/lib/auth/session";

export default async function NewResourcePage() {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  return (
    <AppShell session={session} title="Add resource" description="Create a dispatch-ready resource profile with skills, hours, and location context.">
      <ResourceForm />
    </AppShell>
  );
}
