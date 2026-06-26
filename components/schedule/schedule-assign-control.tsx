"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResourceOption = {
  id: string;
  name: string;
};

export function ScheduleAssignControl({
  engagementId,
  resources
}: {
  engagementId: string;
  resources: ResourceOption[];
}) {
  const router = useRouter();
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function assign() {
    setError(null);
    setIsLoading(true);
    const response = await fetch("/api/schedule/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagementId, resourceId })
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Could not assign resource.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={resourceId}
          onChange={(event) => setResourceId(event.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name}</option>
          ))}
        </select>
        <Button type="button" size="sm" onClick={assign} disabled={!resourceId || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          Assign
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
