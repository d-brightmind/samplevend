import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { formatResource, resourceInclude } from "@/lib/resources/format";
import { resourceStatusSchema } from "@/lib/validation/resource";

type RouteContext = { params: Promise<{ resourceId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("resources:manage");
  if ("error" in auth) return auth.error;
  const { resourceId } = await context.params;

  const parsed = resourceStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid status." }, { status: 400 });
  }

  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, accountId: auth.session.account.id },
    select: { id: true }
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.resourceStatusEvent.create({
      data: {
        resourceId,
        status: parsed.data.status,
        note: parsed.data.note,
        createdBy: auth.session.user.id
      }
    });

    return tx.resource.update({
      where: { id: resourceId },
      data: {
        status: parsed.data.status,
        isActive: parsed.data.status !== "DEACTIVATED",
        deactivatedAt: parsed.data.status === "DEACTIVATED" ? new Date() : null
      },
      include: resourceInclude
    });
  });

  return NextResponse.json({ resource: formatResource(updated) });
}
