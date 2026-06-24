import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout eyebrow="Password reset">
      <AuthCard title="Reset your password" description="We will send a secure reset link if the account exists.">
        <ForgotPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
