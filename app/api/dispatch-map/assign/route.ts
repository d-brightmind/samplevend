import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { findResourceScheduleConflict } from "@/lib/engagements/conflicts";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";

const dispatchAssignSchema = z.object({
  engagementId: z.string().uuid(),
  resourceId: z.string().uuid()
});

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("dispatch:assign");
  if ("error" in auth) return auth.error;

  const parsed = dispatchAssignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Select a valid engagement and resource." }, { status: 400 });
  }

  const [engagement, resource] = await Promise.all([
    prisma.engagement.findFirst({
      where: { id: parsed.data.engagementId, accountId: auth.session.account.id },
      select: { id: true, status: true, scheduledStart: true, scheduledEnd: true }
    }),
    prisma.resource.findFirst({
      where: { id: parsed.data.resourceId, accountId: auth.session.account.id, isActive: true },
      select: { id: true, latitude: true, longitude: true }
    })
  ]);

  if (!engagement) return NextResponse.json({ error: "Engagement not found." }, { status: 404 });
  if (!resource) return NextResponse.json({ error: "Resource not found or inactive." }, { status: 400 });
  if (!engagement.scheduledStart || !engagement.scheduledEnd) {
    return NextResponse.json({ error: "Schedule the engagement before assigning from the map." }, { status: 400 });
  }
  if (engagement.status === "COMPLETED" || engagement.status === "CANCELLED") {
    return NextResponse.json({ error: "Closed engagements cannot be assigned." }, { status: 409 });
  }

  const conflict = await findResourceScheduleConflict({
    accountId: auth.session.account.id,
    resourceId: parsed.data.resourceId,
    scheduledStart: engagement.scheduledStart,
    scheduledEnd: engagement.scheduledEnd,
    excludeEngagementId: engagement.id
  });
  if (conflict) {
    return NextResponse.json({ error: `Schedule conflict with ${conflict.title}.` }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.engagementStatusEvent.create({
      data: {
        engagementId: engagement.id,
        status: "ASSIGNED",
        note: "Assigned from dispatch map.",
        createdBy: auth.session.user.id
      }
    });

    return tx.engagement.update({
      where: { id: engagement.id },
      data: {
        resourceId: parsed.data.resourceId,
        status: "ASSIGNED"
      },
      include: engagementInclude
    });
  });

  return NextResponse.json({ engagement: formatEngagement(updated) });
}
