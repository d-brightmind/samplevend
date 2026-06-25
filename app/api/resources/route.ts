import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/auth/api";
import { formatResource, resourceInclude } from "@/lib/resources/format";
import { resourcePayloadSchema } from "@/lib/validation/resource";

export async function GET(request: Request) {
  const auth = await requireApiPermission("resources:view");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const query = searchParams.get("q") || undefined;

  const resources = await prisma.resource.findMany({
    where: {
      accountId: auth.session.account.id,
      ...(status ? { status: status as never } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { title: { contains: query, mode: "insensitive" } },
              { locationLabel: { contains: query, mode: "insensitive" } },
              { skills: { some: { skill: { name: { contains: query, mode: "insensitive" } } } } }
            ]
          }
        : {})
    },
    include: resourceInclude,
    orderBy: [{ isActive: "desc" }, { name: "asc" }]
  });

  return NextResponse.json({ resources: resources.map(formatResource) });
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("resources:manage");
  if ("error" in auth) return auth.error;

  const parsed = resourcePayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid resource details." }, { status: 400 });
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

    return tx.resource.create({
      data: {
        accountId: auth.session.account.id,
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

  return NextResponse.json({ resource: formatResource(resource) }, { status: 201 });
}
