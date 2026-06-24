import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout eyebrow="Secure sign in">
      <AuthCard title="Sign in" description="Access your VendoBird workspace.">
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
