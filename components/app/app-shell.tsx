import Link from "next/link";
import { Activity, BriefcaseBusiness, CalendarClock, ClipboardList, Map, MapPinned, ShieldCheck, UserRoundCog, Users, type LucideIcon } from "lucide-react";
import { LogoutButton } from "@/components/app/logout-button";
import type { SessionContext, UserRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const nav: NavItem[] = [
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/dispatch", label: "Dispatch", icon: MapPinned, roles: ["ADMIN", "DISPATCHER"] },
  { href: "/dispatch-map", label: "Map", icon: Map, roles: ["ADMIN", "DISPATCHER"] },
  { href: "/schedule", label: "Schedule", icon: CalendarClock, roles: ["ADMIN", "DISPATCHER"] },
  { href: "/engagements", label: "Engagements", icon: ClipboardList, roles: ["ADMIN", "DISPATCHER"] },
  { href: "/resources", label: "Resources", icon: UserRoundCog, roles: ["ADMIN", "DISPATCHER"] },
  { href: "/resource", label: "Resource", icon: CalendarClock, roles: ["ADMIN", "DISPATCHER", "RESOURCE"] },
  { href: "/client", label: "Client", icon: BriefcaseBusiness, roles: ["CLIENT"] },
  { href: "/account", label: "Account", icon: Users, roles: ["ADMIN"] }
];

export function AppShell({
  session,
  title,
  description,
  children
}: {
  session: SessionContext;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const visibleNav = nav.filter((item) => item.roles.includes(session.role));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">VB</span>
            <span>VendoBird</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{session.user.fullName}</p>
              <p className="text-xs text-muted-foreground">{session.role.replace("_", " ")}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Primary">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="space-y-6">
          <section className="flex flex-col gap-3 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Activity className="h-4 w-4" aria-hidden="true" />
                {session.account.name}
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <span className="w-fit rounded-md bg-secondary px-3 py-1 text-sm font-medium">
              {session.account.type.replace("_", " ")}
            </span>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
