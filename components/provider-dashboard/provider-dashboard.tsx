import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, Clock3, Lightbulb, MapPin, Navigation, Route, Sparkles, UserRound, Users } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { EngagementStatusBadge, type EngagementStatus } from "@/components/engagements/engagement-status-badge";

type ProviderJob = {
  id: string;
  title: string;
  clientName: string;
  serviceType: string | null;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  locationLabel: string | null;
};

type ProviderDashboardData = {
  resource: {
    name: string;
    title: string | null;
    photoUrl: string | null;
    status: string;
    locationLabel: string | null;
    ratingAverage: number | null;
    ratingCount: number;
    skills: string[];
  };
  metrics: {
    todayJobs: number;
    upcomingJobs: number;
    activeJobs: number;
    completedToday: number;
    pendingRequests: number;
  };
  todayAvailability: {
    startTime: string;
    endTime: string;
    timezone: string;
    isWorking: boolean;
  } | null;
  todayJobs: ProviderJob[];
  upcomingJobs: ProviderJob[];
  clients: {
    name: string;
    email: string | null;
    phone: string | null;
    nextJob: string;
    nextVisit: string | null;
  }[];
  notifications: {
    id: string;
    title: string;
    detail: string;
    tone: "info" | "success";
  }[];
  aiSuggestions: string[];
};

function timeRange(job: ProviderJob) {
  if (!job.scheduledStart || !job.scheduledEnd) return "Time not set";
  const start = new Date(job.scheduledStart);
  const end = new Date(job.scheduledEnd);
  return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function visitLabel(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function ProviderDashboard({ dashboard }: { dashboard: ProviderDashboardData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {dashboard.resource.photoUrl ? (
              <img src={dashboard.resource.photoUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-lg bg-secondary text-2xl font-semibold">
                {dashboard.resource.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">{dashboard.resource.title || "Individual Provider"}</p>
              <h2 className="mt-1 text-2xl font-semibold">{dashboard.resource.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {dashboard.resource.locationLabel || "Location not shared"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboard.resource.skills.length > 0 ? dashboard.resource.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{skill}</span>
                )) : <span className="text-sm text-muted-foreground">No skills listed</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold">Today’s availability</h3>
          <p className="mt-3 text-2xl font-semibold">
            {dashboard.todayAvailability?.isWorking ? `${dashboard.todayAvailability.startTime}-${dashboard.todayAvailability.endTime}` : "Unavailable"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{dashboard.todayAvailability?.timezone ?? "Availability not set"}</p>
          <div className="mt-4 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">{dashboard.resource.status.toLowerCase()}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard icon={CalendarClock} label="Today" value={String(dashboard.metrics.todayJobs)} detail="Scheduled jobs" />
        <DashboardCard icon={Route} label="Active" value={String(dashboard.metrics.activeJobs)} detail="Assigned or in progress" />
        <DashboardCard icon={CheckCircle2} label="Completed" value={String(dashboard.metrics.completedToday)} detail="Closed today" />
        <DashboardCard icon={Clock3} label="Upcoming" value={String(dashboard.metrics.upcomingJobs)} detail="Next 14 days" />
        <DashboardCard icon={Bell} label="Requests" value={String(dashboard.metrics.pendingRequests)} detail="Pending bookings" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Today’s schedule</h3>
              <Link href="/schedule" className="text-sm font-medium text-primary hover:underline">Open schedule</Link>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.todayJobs.length > 0 ? dashboard.todayJobs.map((job) => (
                <Link key={job.id} href={`/engagements/${job.id}`} className="block rounded-lg border p-4 hover:border-primary/50 hover:bg-primary/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{job.clientName} · {job.serviceType || "Service"}</p>
                    </div>
                    <EngagementStatusBadge status={job.status as EngagementStatus} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" aria-hidden="true" />{timeRange(job)}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" />{job.locationLabel || "No location"}</span>
                  </div>
                </Link>
              )) : (
                <EmptyState icon={CalendarClock} title="No jobs today" description="Assigned jobs for today will appear here with client, route, and status details." />
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-semibold">Route map</h3>
            </div>
            <div className="mt-4 grid min-h-64 place-items-center rounded-lg border border-dashed bg-[linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px),linear-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:42px_42px] p-4 text-center">
              <div>
                <MapPin className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                <p className="mt-3 font-medium">Route preview</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Today’s stops are ready for Mapbox route optimization once live route services are connected.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.notifications.length > 0 ? dashboard.notifications.map((notification) => (
                <div key={notification.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.detail}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No provider notifications right now.</p>}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">AI suggestions</h3>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.aiSuggestions.map((suggestion) => (
                <div key={suggestion} className="flex gap-2 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {suggestion}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Upcoming jobs</h3>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.upcomingJobs.length > 0 ? dashboard.upcomingJobs.map((job) => (
              <Link key={job.id} href={`/engagements/${job.id}`} className="block rounded-md border p-3 hover:border-primary/50">
                <p className="font-medium">{job.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{visitLabel(job.scheduledStart)} · {job.clientName}</p>
              </Link>
            )) : <p className="text-sm text-muted-foreground">No upcoming jobs in the next 14 days.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Clients</h3>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.clients.length > 0 ? dashboard.clients.map((client) => (
              <div key={client.email ?? client.name} className="flex gap-3 rounded-md border p-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.nextJob}</p>
                  <p className="text-xs text-muted-foreground">{visitLabel(client.nextVisit)}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Client history will appear after jobs are assigned.</p>}
          </div>
        </section>
      </section>
    </div>
  );
}
