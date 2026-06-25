import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ResourceForm } from "@/components/resources/resource-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { formatResource, resourceInclude } from "@/lib/resources/format";

type PageProps = { params: Promise<{ resourceId: string }> };

export default async function EditResourcePage({ params }: PageProps) {
  const session = await requireRole(["ADMIN", "DISPATCHER"]);
  const { resourceId } = await params;
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, accountId: session.account.id },
    include: resourceInclude
  });

  if (!resource) notFound();

  return (
    <AppShell session={session} title="Edit resource" description="Update profile details, skills, availability, status, and location.">
      <ResourceForm resource={formatResource(resource)} />
    </AppShell>
  );
}
