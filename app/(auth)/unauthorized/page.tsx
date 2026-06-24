import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { getSessionContext } from "@/lib/auth/session";
import { dashboardByRole } from "@/lib/auth/types";

export default async function UnauthorizedPage() {
  const session = await getSessionContext();
  const href = session ? dashboardByRole[session.role] : "/login";

  return (
    <AuthLayout eyebrow="Access blocked">
      <AuthCard title="You do not have access" description="Your account role cannot open this area.">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-md bg-secondary p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              If this looks wrong, ask an account admin to update your role or permissions.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href={href}>Go to my dashboard</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
