import { AppShell } from "@/components/app/app-shell";
import { EngagementForm } from "@/components/engagements/engagement-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function NewEngagementPage() {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const resources = await prisma.resource.findMany({
    where: { accountId: session.account.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  return (
    <AppShell session={session} title="Create engagement" description="Capture the client request, schedule window, location, and resource assignment.">
      <EngagementForm resources={resources} />
    </AppShell>
  );
}
