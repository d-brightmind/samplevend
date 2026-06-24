import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <AuthLayout eyebrow="Verification required">
      <AuthCard title="Check your email" description="Verify your address before opening your workspace.">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-md bg-secondary p-4">
            <MailCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              We sent a verification link to your inbox. After verifying, sign in again to continue.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
