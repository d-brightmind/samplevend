import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/public-provider/booking-flow";
import { buildBookingSlots, getBookingProvider } from "@/lib/public-provider/booking";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getBookingProvider(slug);
  if (!provider) return { title: "Book provider | VendoBird" };
  return {
    title: `Book ${provider.name} | VendoBird`,
    description: `Request ${provider.name} for service in ${provider.serviceArea ?? provider.locationLabel ?? "your area"}.`
  };
}

export default async function ProviderBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const provider = await getBookingProvider(slug);
  if (!provider) notFound();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">VB</span>
            <span>VendoBird</span>
          </div>
          <span className="text-sm text-muted-foreground">Secure booking request</span>
        </div>
      </header>
      <BookingFlow
        slug={slug}
        provider={{
          name: provider.name,
          title: provider.title,
          serviceArea: provider.serviceArea ?? provider.locationLabel,
          responseTimeMinutes: provider.responseTimeMinutes ?? 60
        }}
        services={provider.publicServices.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          priceLabel: service.priceLabel,
          durationMinutes: service.durationMinutes
        }))}
        slots={buildBookingSlots(provider.availability)}
      />
    </main>
  );
}
