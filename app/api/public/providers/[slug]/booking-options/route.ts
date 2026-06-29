import { NextResponse } from "next/server";
import { buildBookingSlots, getBookingProvider } from "@/lib/public-provider/booking";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const provider = await getBookingProvider(slug);

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json({
    provider: {
      id: provider.id,
      name: provider.name,
      title: provider.title,
      serviceArea: provider.serviceArea ?? provider.locationLabel,
      responseTimeMinutes: provider.responseTimeMinutes ?? 60
    },
    services: provider.publicServices.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      priceLabel: service.priceLabel,
      durationMinutes: service.durationMinutes
    })),
    slots: buildBookingSlots(provider.availability)
  });
}
