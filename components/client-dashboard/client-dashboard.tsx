import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, Clock3, History, MapPin, MessageCircle, Star, UserRound, Users } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import type { ClientDashboardData } from "@/lib/client-dashboard/data";

function dateTime(value: string | null) {
  if (!value) return "Time pending";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status: string) {
  return status.replace("_", " ").toLowerCase();
}

export function ClientDashboard({ dashboard }: { dashboard: ClientDashboardData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard icon={CalendarClock} label="Upcoming" value={String(dashboard.metrics.upcomingBookings)} detail="Bookings and jobs" />
        <DashboardCard icon={CheckCircle2} label="Completed" value={String(dashboard.metrics.completedBookings)} detail="Finished services" />
        <DashboardCard icon={Users} label="Providers" value={String(dashboard.metrics.providers)} detail="Tracked providers" />
        <DashboardCard icon={Bell} label="Messages" value={String(dashboard.metrics.unreadMessages)} detail="Unread updates" />
        <DashboardCard icon={Star} label="Reviews" value={String(dashboard.metrics.reviews)} detail="Reviews submitted" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Upcoming bookings</h2>
              </div>
              <Link href="/providers" className="text-sm font-medium text-primary hover:underline">Find provider</Link>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.upcoming.length > 0 ? dashboard.upcoming.map((booking) => (
                <div key={`${booking.kind}-${booking.id}`} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{booking.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{booking.providerName} · {booking.serviceName}</p>
                    </div>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{statusLabel(booking.status)}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" aria-hidden="true" />{dateTime(booking.startsAt)}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" />{booking.locationLabel || "Location pending"}</span>
                  </div>
                </div>
              )) : (
                <EmptyState icon={CalendarClock} title="No upcoming bookings" description="Your confirmed and requested services will appear here." />
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Booking history</h2>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.history.length > 0 ? dashboard.history.map((booking) => (
                <div key={`${booking.kind}-${booking.id}`} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{booking.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.providerName} · {dateTime(booking.date)}</p>
                  </div>
                  <span className="w-fit rounded-md bg-secondary px-2 py-1 text-xs font-medium">{statusLabel(booking.status)}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">Completed, cancelled, and converted bookings will appear here.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">Messages</h2>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.messages.length > 0 ? dashboard.messages.map((message) => (
                <div key={message.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{message.subject}</p>
                    {!message.isRead ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">New</span> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{message.body}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Provider updates and booking messages will appear here.</p>}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">Reviews</h2>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.reviews.length > 0 ? dashboard.reviews.map((review) => (
                <div key={review.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{review.providerName}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Reviews you leave after completed services will appear here.</p>}
            </div>
          </section>
        </aside>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Provider tracking</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.providers.length > 0 ? dashboard.providers.map((provider) => (
            <div key={provider.id} className="rounded-lg border p-4">
              <div className="flex gap-3">
                {provider.photoUrl ? (
                  <img src={provider.photoUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-secondary">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">{provider.title || "Provider"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{provider.locationLabel || "Location pending"}</p>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-secondary p-2 text-xs text-muted-foreground">
                Next visit: {dateTime(provider.nextVisit)}
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">Providers linked to your bookings will appear here.</p>}
        </div>
      </section>
    </div>
  );
}
