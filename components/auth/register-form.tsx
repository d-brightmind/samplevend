"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountType } from "@/lib/auth/types";

const options: { value: AccountType; label: string; description: string }[] = [
  { value: "BUSINESS", label: "Business", description: "Teams with admins, dispatchers, and resources." },
  { value: "INDIVIDUAL_PROVIDER", label: "Individual Provider", description: "Solo operators managing their own work." },
  { value: "CLIENT", label: "Client", description: "Customers requesting and tracking services." }
];

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("BUSINESS");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType,
        accountName: formData.get("accountName") || undefined,
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
        serviceCategory: formData.get("serviceCategory") || undefined
      })
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "We could not create this account. Try again.");
      return;
    }

    router.replace("/verify-email");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Account type</legend>
        <div className="grid gap-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-md border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                className="mt-1"
                type="radio"
                name="accountType"
                checked={accountType === option.value}
                onChange={() => setAccountType(option.value)}
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {accountType === "BUSINESS" ? (
        <div className="space-y-2">
          <Label htmlFor="accountName">Business name</Label>
          <Input id="accountName" name="accountName" required />
        </div>
      ) : null}
      {accountType === "INDIVIDUAL_PROVIDER" ? (
        <div className="space-y-2">
          <Label htmlFor="serviceCategory">Service category</Label>
          <Input id="serviceCategory" name="serviceCategory" placeholder="Field services, cleaning, repairs..." required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
