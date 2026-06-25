"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeactivateResourceButton({ resourceId, disabled }: { resourceId: string; disabled?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function deactivate() {
    setIsLoading(true);
    await fetch(`/api/resources/${resourceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Deactivated from resource profile." })
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={deactivate} disabled={disabled || isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PowerOff className="h-4 w-4" aria-hidden="true" />}
      Deactivate
    </Button>
  );
}
