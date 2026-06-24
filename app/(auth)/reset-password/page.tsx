import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthLayout eyebrow="New password">
      <AuthCard title="Set a new password" description="Use a strong password that is unique to VendoBird.">
        <ResetPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
