"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResourceOption = {
  id: string;
  name: string;
  status: string;
};

type EngagementOption = {
  id: string;
  title: string;
  clientName: string;
  conflict: { title: string } | null;
};

export function DispatchAssignPanel({
  resources,
  engagements
}: {
  resources: ResourceOption[];
  engagements: EngagementOption[];
}) {
  const router = useRouter();
  const [engagementId, setEngagementId] = useState(engagements[0]?.id ?? "");
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedEngagement = engagements.find((engagement) => engagement.id === engagementId);

  async function assign() {
    setError(null);
    setIsLoading(true);
    const response = await fetch("/api/dispatch-map/assign", {
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
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">Assignment workflow</h2>
      </div>
      <div className="mt-4 grid gap-3">
        <label className="space-y-2 text-sm font-medium">
          Engagement
          <select value={engagementId} onChange={(event) => setEngagementId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {engagements.map((engagement) => (
              <option key={engagement.id} value={engagement.id}>{engagement.title} - {engagement.clientName}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Resource
          <select value={resourceId} onChange={(event) => setResourceId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>{resource.name} - {resource.status.toLowerCase()}</option>
            ))}
          </select>
        </label>
        {selectedEngagement?.conflict ? (
          <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Potential conflict: {selectedEngagement.conflict.title}
          </div>
        ) : null}
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button onClick={assign} disabled={!engagementId || !resourceId || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          Assign resource
        </Button>
      </div>
    </section>
  );
}
