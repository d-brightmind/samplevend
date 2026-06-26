"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Play, SquareCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EngagementStatusButton({
  engagementId,
  status,
  label
}: {
  engagementId: string;
  status: "IN_PROGRESS" | "COMPLETED";
  label: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const Icon = status === "COMPLETED" ? SquareCheck : Play;

  async function updateStatus() {
    setIsLoading(true);
    await fetch(`/api/engagements/${engagementId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: label })
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={updateStatus} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </Button>
  );
}

export function CancelEngagementButton({ engagementId, disabled }: { engagementId: string; disabled?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function cancel() {
    setIsLoading(true);
    await fetch(`/api/engagements/${engagementId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled from engagement profile." })
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={cancel} disabled={disabled || isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
      Cancel
    </Button>
  );
}
