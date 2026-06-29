import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBookingProvider } from "@/lib/public-provider/booking";
import { bookingRequestSchema } from "@/lib/validation/booking";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const provider = await getBookingProvider(slug);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
  }

  const input = parsed.data;
  const selectedService = input.serviceId
    ? provider.publicServices.find((service) => service.id === input.serviceId)
    : null;

  if (input.serviceId && !selectedService) {
    return NextResponse.json({ error: "Selected service is unavailable." }, { status: 400 });
  }

  const requestedStart = new Date(input.requestedStart);
  const durationMinutes = selectedService?.durationMinutes ?? 60;
  const requestedEnd = new Date(requestedStart);
  requestedEnd.setMinutes(requestedEnd.getMinutes() + durationMinutes);

  const booking = await prisma.bookingRequest.create({
    data: {
      accountId: provider.accountId,
      resourceId: provider.id,
      providerServiceId: selectedService?.id ?? null,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone || null,
      serviceName: selectedService?.name ?? input.serviceName,
      requestedStart,
      requestedEnd,
      locationLabel: input.locationLabel,
      notes: input.notes || null
    }
  });

  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      requestedStart: booking.requestedStart.toISOString()
    }
  }, { status: 201 });
}
