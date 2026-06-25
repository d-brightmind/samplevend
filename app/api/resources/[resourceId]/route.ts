import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { formatResource, resourceInclude } from "@/lib/resources/format";
import { deactivateResourceSchema, resourcePayloadSchema } from "@/lib/validation/resource";

type RouteContext = { params: Promise<{ resourceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiPermission("resources:view");
  if ("error" in auth) return auth.error;
  const { resourceId } = await context.params;

  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, accountId: auth.session.account.id },
    include: resourceInclude
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json({ resource: formatResource(resource) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("resources:manage");
  if ("error" in auth) return auth.error;
  const { resourceId } = await context.params;

  const parsed = resourcePayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid resource details." }, { status: 400 });
  }

  const exists = await prisma.resource.findFirst({
    where: { id: resourceId, accountId: auth.session.account.id },
    select: { id: true }
  });
  if (!exists) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const input = parsed.data;
  const resource = await prisma.$transaction(async (tx) => {
    const skillRows = await Promise.all(
      input.skills.map((name) =>
        tx.skill.upsert({
          where: { accountId_name: { accountId: auth.session.account.id, name } },
          update: {},
          create: { accountId: auth.session.account.id, name }
        })
      )
    );

    await tx.resourceSkill.deleteMany({ where: { resourceId } });
    await tx.resourceAvailability.deleteMany({ where: { resourceId } });

    return tx.resource.update({
      where: { id: resourceId },
      data: {
        photoUrl: input.photoUrl || null,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        title: input.title || null,
        status: input.status,
        isActive: input.status !== "DEACTIVATED",
        locationLabel: input.locationLabel || null,
        latitude: input.latitude === "" ? null : input.latitude,
        longitude: input.longitude === "" ? null : input.longitude,
        lastSeenAt: input.locationLabel ? new Date() : null,
        notes: input.notes || null,
        skills: { create: skillRows.map((skill) => ({ skillId: skill.id })) },
        availability: { create: input.availability }
      },
      include: resourceInclude
    });
  });

  return NextResponse.json({ resource: formatResource(resource) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("resources:deactivate");
  if ("error" in auth) return auth.error;
  const { resourceId } = await context.params;
  const parsed = deactivateResourceSchema.safeParse(await request.json().catch(() => ({})));

  const resource = await prisma.resource.updateMany({
    where: { id: resourceId, accountId: auth.session.account.id },
    data: {
      status: "DEACTIVATED",
      isActive: false,
      deactivatedAt: new Date()
    }
  });

  if (resource.count === 0) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  await prisma.resourceStatusEvent.create({
    data: {
      resourceId,
      status: "DEACTIVATED",
      note: parsed.success ? parsed.data.reason : undefined,
      createdBy: auth.session.user.id
    }
  });

  return NextResponse.json({ ok: true });
}
