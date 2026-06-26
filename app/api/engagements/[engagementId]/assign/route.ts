import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { findResourceScheduleConflict } from "@/lib/engagements/conflicts";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";
import { engagementAssignmentSchema } from "@/lib/validation/engagement";

type RouteContext = { params: Promise<{ engagementId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("engagements:assign");
  if ("error" in auth) return auth.error;
  const { engagementId } = await context.params;

  const parsed = engagementAssignmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid assignment." }, { status: 400 });
  }

  const [engagement, resource] = await Promise.all([
    prisma.engagement.findFirst({
      where: { id: engagementId, accountId: auth.session.account.id },
      select: { id: true, scheduledStart: true, scheduledEnd: true, status: true }
    }),
    prisma.resource.findFirst({
      where: { id: parsed.data.resourceId, accountId: auth.session.account.id, isActive: true },
      select: { id: true }
    })
  ]);

  if (!engagement) return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  if (!resource) return NextResponse.json({ error: "Selected resource is not available." }, { status: 400 });
  if (engagement.status === "CANCELLED" || engagement.status === "COMPLETED") {
    return NextResponse.json({ error: "Closed engagements cannot be assigned." }, { status: 409 });
  }

  const scheduledStart = parsed.data.scheduledStart ? new Date(parsed.data.scheduledStart) : engagement.scheduledStart;
  const scheduledEnd = parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : engagement.scheduledEnd;

  const conflict = await findResourceScheduleConflict({
    accountId: auth.session.account.id,
    resourceId: parsed.data.resourceId,
    scheduledStart,
    scheduledEnd,
    excludeEngagementId: engagementId
  });
  if (conflict) {
    return NextResponse.json({ error: `Schedule conflict with ${conflict.title}.` }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.engagementStatusEvent.create({
      data: {
        engagementId,
        status: "ASSIGNED",
        note: "Resource assigned.",
        createdBy: auth.session.user.id
      }
    });

    return tx.engagement.update({
      where: { id: engagementId },
      data: {
        resourceId: parsed.data.resourceId,
        scheduledStart,
        scheduledEnd,
        status: "ASSIGNED"
      },
      include: engagementInclude
    });
  });

  return NextResponse.json({ engagement: formatEngagement(updated) });
}
