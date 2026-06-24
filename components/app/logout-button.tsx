"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={logout}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Logout
    </Button>
  );
}
