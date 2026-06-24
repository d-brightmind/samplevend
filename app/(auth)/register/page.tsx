import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout eyebrow="Create account">
      <AuthCard title="Create your account" description="Choose the workspace type that matches how you operate.">
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
