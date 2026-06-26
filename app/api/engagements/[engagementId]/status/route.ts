import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { engagementInclude, formatEngagement } from "@/lib/engagements/format";
import { engagementStatusSchema } from "@/lib/validation/engagement";

type RouteContext = { params: Promise<{ engagementId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("engagements:manage");
  if ("error" in auth) return auth.error;
  const { engagementId } = await context.params;

  const parsed = engagementStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid status." }, { status: 400 });
  }

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, accountId: auth.session.account.id },
    select: { id: true, status: true }
  });
  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }
  if (engagement.status === "CANCELLED" || engagement.status === "COMPLETED") {
    return NextResponse.json({ error: "Closed engagements cannot be updated." }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.engagementStatusEvent.create({
      data: {
        engagementId,
        status: parsed.data.status,
        note: parsed.data.note,
        createdBy: auth.session.user.id
      }
    });

    return tx.engagement.update({
      where: { id: engagementId },
      data: {
        status: parsed.data.status,
        completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
        cancelledAt: parsed.data.status === "CANCELLED" ? new Date() : null
      },
      include: engagementInclude
    });
  });

  return NextResponse.json({ engagement: formatEngagement(updated) });
}
