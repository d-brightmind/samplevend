import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EngagementForm } from "@/components/engagements/engagement-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";

type PageProps = { params: Promise<{ engagementId: string }> };

export default async function EditEngagementPage({ params }: PageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const { engagementId } = await params;
  const [engagement, resources] = await Promise.all([
    prisma.engagement.findFirst({
      where: { id: engagementId, accountId: session.account.id },
      include: engagementInclude
    }),
    prisma.resource.findMany({
      where: { accountId: session.account.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (!engagement) notFound();

  return (
    <AppShell session={session} title="Edit engagement" description="Update schedule, assignment, status, location, and service details.">
      <EngagementForm engagement={formatEngagement(engagement)} resources={resources} />
    </AppShell>
  );
}
