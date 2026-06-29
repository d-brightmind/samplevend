"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ChevronLeft, Loader2, MapPin, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BookingService = {
  id: string;
  name: string;
  description: string | null;
  priceLabel: string | null;
  durationMinutes: number | null;
};

type BookingSlot = {
  startsAt: string;
  label: string;
};

type BookingProvider = {
  name: string;
  title: string | null;
  serviceArea: string | null;
  responseTimeMinutes: number;
};

type BookingStep = 1 | 2 | 3 | 4;

export function BookingFlow({
  provider,
  slug,
  services,
  slots
}: {
  provider: BookingProvider;
  slug: string;
  services: BookingService[];
  slots: BookingSlot[];
}) {
  const fallbackService = services[0] ?? {
    id: "",
    name: "General service request",
    description: "Tell the provider what you need.",
    priceLabel: null,
    durationMinutes: 60
  };
  const [step, setStep] = useState<BookingStep>(1);
  const [serviceId, setServiceId] = useState(fallbackService.id);
  const [serviceName, setServiceName] = useState(fallbackService.name);
  const [requestedStart, setRequestedStart] = useState(slots[0]?.startsAt ?? "");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [locationLabel, setLocationLabel] = useState(provider.serviceArea ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? fallbackService,
    [fallbackService, serviceId, services]
  );
  const selectedSlot = slots.find((slot) => slot.startsAt === requestedStart);

  function next() {
    setError(null);
    if (step === 1 && !serviceName) {
      setError("Choose a service to continue.");
      return;
    }
    if (step === 2 && !requestedStart) {
      setError("Choose a date and time.");
      return;
    }
    if (step === 3) {
      if (!clientName.trim()) return setError("Enter your name.");
      if (!clientEmail.includes("@")) return setError("Enter a valid email.");
      if (!locationLabel.trim()) return setError("Enter the service address or area.");
    }
    setStep((current) => Math.min(4, current + 1) as BookingStep);
  }

  async function submit() {
    setError(null);
    setIsLoading(true);
    const response = await fetch(`/api/public/providers/${slug}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        serviceName,
        requestedStart,
        clientName,
        clientEmail,
        clientPhone,
        locationLabel,
        notes
      })
    });
    const data = (await response.json().catch(() => null)) as { booking?: { id: string }; error?: string } | null;
    setIsLoading(false);

    if (!response.ok || !data?.booking) {
      setError(data?.error ?? "We could not submit this booking request. Try again.");
      return;
    }

    setBookingId(data.booking.id);
  }

  if (bookingId) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border bg-card p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold">Booking request sent</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {provider.name} has received your request. We sent the details to the email you provided.
        </p>
        <div className="mt-6 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
          Reference: <span className="font-medium text-foreground">{bookingId.slice(0, 8)}</span>
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href={`/providers/${slug}`}>Back to provider profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem]">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Step {step} of 4</p>
            <h1 className="mt-1 text-2xl font-semibold">Book {provider.name}</h1>
          </div>
          <Link href={`/providers/${slug}`} className="text-sm font-medium text-primary hover:underline">
            Profile
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={`h-2 rounded-full ${item <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        {error ? <Alert variant="error" className="mt-5">{error}</Alert> : null}

        {step === 1 ? (
          <div className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold">Choose service</h2>
            {(services.length > 0 ? services : [fallbackService]).map((service) => (
              <button
                key={service.id || service.name}
                type="button"
                onClick={() => {
                  setServiceId(service.id);
                  setServiceName(service.name);
                }}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${serviceName === service.name ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{service.description || "Available by request."}</p>
                  </div>
                  {service.priceLabel ? <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{service.priceLabel}</span> : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Select date and time</h2>
            {slots.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => setRequestedStart(slot.startsAt)}
                    className={`rounded-md border px-3 py-3 text-left text-sm font-medium ${requestedStart === slot.startsAt ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="requestedStart">Preferred date and time</Label>
                <Input
                  id="requestedStart"
                  type="datetime-local"
                  onChange={(event) => setRequestedStart(event.target.value ? new Date(event.target.value).toISOString() : "")}
                />
              </div>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 grid gap-4">
            <h2 className="text-lg font-semibold">Enter details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Name</Label>
                <Input id="clientName" value={clientName} onChange={(event) => setClientName(event.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} type="email" autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input id="clientPhone" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} autoComplete="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationLabel">Service address or area</Label>
                <Input id="locationLabel" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything the provider should know?" />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Confirm booking</h2>
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-semibold">{serviceName}</p>
              <p className="mt-2 flex gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" aria-hidden="true" />{selectedSlot?.label ?? new Date(requestedStart).toLocaleString()}</p>
              <p className="mt-2 flex gap-2 text-muted-foreground"><UserRound className="h-4 w-4" aria-hidden="true" />{clientName} · {clientEmail}</p>
              <p className="mt-2 flex gap-2 text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden="true" />{locationLabel}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={step === 1 || isLoading} onClick={() => setStep((current) => Math.max(1, current - 1) as BookingStep)}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={next}>Continue</Button>
          ) : (
            <Button type="button" onClick={submit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              Confirm booking
            </Button>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-lg border bg-card p-5">
        <h2 className="font-semibold">{provider.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{provider.title || "Service provider"}</p>
        <div className="mt-5 space-y-3 text-sm text-muted-foreground">
          <p className="flex gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />{provider.serviceArea || "Local service area"}</p>
          <p className="flex gap-2"><CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />Fast request completion</p>
        </div>
        <div className="mt-5 rounded-md bg-secondary p-3 text-sm">
          <p className="font-medium">Selected</p>
          <p className="mt-1 text-muted-foreground">{selectedService.name}</p>
          <p className="mt-1 text-muted-foreground">{selectedSlot?.label ?? "Choose a time"}</p>
        </div>
      </aside>
    </div>
  );
}
