import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicProviderProfile } from "@/lib/public-provider/profile";

function ratingText(profile: PublicProviderProfile) {
  if (!profile.ratingAverage) return "New provider";
  return `${profile.ratingAverage.toFixed(1)} (${profile.ratingCount} reviews)`;
}

function minutesLabel(minutes?: number | null) {
  if (!minutes) return "Typically replies within 1 hour";
  if (minutes < 60) return `Typically replies in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `Typically replies in ${hours} hr`;
}

export function ProviderProfilePage({ profile }: { profile: PublicProviderProfile }) {
  const workingDays = profile.availability.filter((item) => item.isWorking);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">VB</span>
            <span>VendoBird</span>
          </Link>
          <Button asChild>
            <a href="#book">Book now</a>
          </Button>
        </div>
      </header>

      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:py-12">
          <div>
            <div className="flex flex-col gap-5 sm:flex-row">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="h-28 w-28 rounded-lg object-cover" />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-lg bg-secondary text-3xl font-semibold text-secondary-foreground">
                  {profile.name.slice(0, 1)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-primary">{profile.title}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-5xl">{profile.name}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{profile.headline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                    {ratingText(profile)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    {profile.serviceArea}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                    {minutesLabel(profile.responseTimeMinutes)}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-8 max-w-3xl text-base leading-7 text-muted-foreground">{profile.bio}</p>
          </div>

          <aside id="book" className="h-fit rounded-lg border bg-background p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Request a booking</h2>
            <p className="mt-2 text-sm text-muted-foreground">Send a request and VendoBird will route the details securely.</p>
            <div className="mt-5 space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/register?provider=${profile.slug ?? profile.id}`}>
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Book this provider
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href={`mailto:?subject=Booking request for ${profile.name}`}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask a question
                </a>
              </Button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />Verified through VendoBird operations.</p>
              <p className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />Availability and service area visible before booking.</p>
            </div>
          </aside>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Services</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {profile.services.length > 0 ? profile.services.map((service) => (
                <article key={service.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.priceLabel ? <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{service.priceLabel}</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description || "Available by request."}</p>
                  {service.durationMinutes ? <p className="mt-3 text-xs font-medium text-primary">{service.durationMinutes} min typical duration</p> : null}
                </article>
              )) : profile.skills.map((skill) => (
                <article key={skill} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{skill}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Service available in {profile.serviceArea}.</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-xl font-semibold">Reviews</h2>
            <div className="mt-4 grid gap-3">
              {profile.reviews.length > 0 ? profile.reviews.map((review) => (
                <article key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{review.reviewerName}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
                  {review.serviceName ? <p className="mt-3 text-xs font-medium text-primary">{review.serviceName}</p> : null}
                </article>
              )) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Reviews will appear here once clients complete bookings through VendoBird.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Service area</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{profile.serviceArea}</p>
            <div className="mt-4 grid h-40 place-items-center rounded-md border border-dashed bg-secondary text-center text-sm text-muted-foreground">
              Map preview ready
            </div>
          </section>
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Availability</h2>
            <div className="mt-3 space-y-2">
              {workingDays.length > 0 ? workingDays.map((item) => (
                <div key={item.weekday} className="flex justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{item.weekday.toLowerCase()}</span>
                  <span className="text-muted-foreground">{item.startTime}-{item.endTime}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">Availability is shared after request.</p>}
            </div>
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 border-t bg-card/95 p-3 backdrop-blur sm:hidden">
        <Button className="w-full" asChild>
          <a href="#book">Book {profile.name}</a>
        </Button>
      </div>
    </main>
  );
}
