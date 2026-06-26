"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormattedEngagement } from "@/lib/engagements/format";

type ResourceOption = {
  id: string;
  name: string;
};

const statusOptions = [
  { value: "UNSCHEDULED", label: "Unscheduled" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: FormDataEntryValue | null) {
  if (!value) return "";
  const raw = String(value);
  return raw ? new Date(raw).toISOString() : "";
}

export function EngagementForm({
  engagement,
  resources
}: {
  engagement?: FormattedEngagement;
  resources: ResourceOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(engagement ? `/api/engagements/${engagement.id}` : "/api/engagements", {
      method: engagement ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        clientName: formData.get("clientName"),
        clientEmail: formData.get("clientEmail") || "",
        clientPhone: formData.get("clientPhone") || "",
        serviceType: formData.get("serviceType") || "",
        description: formData.get("description") || "",
        status: formData.get("status"),
        resourceId: formData.get("resourceId") || "",
        scheduledStart: fromDateTimeLocal(formData.get("scheduledStart")),
        scheduledEnd: fromDateTimeLocal(formData.get("scheduledEnd")),
        locationLabel: formData.get("locationLabel") || "",
        latitude: formData.get("latitude") || "",
        longitude: formData.get("longitude") || ""
      })
    });

    const data = (await response.json().catch(() => null)) as { engagement?: { id: string }; error?: string } | null;
    setIsLoading(false);

    if (!response.ok || !data?.engagement) {
      setError(data?.error ?? "We could not save this engagement. Try again.");
      return;
    }

    router.push(`/engagements/${data.engagement.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Engagement title</Label>
          <Input id="title" name="title" defaultValue={engagement?.title ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientName">Client name</Label>
          <Input id="clientName" name="clientName" defaultValue={engagement?.clientName ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service type</Label>
          <Input id="serviceType" name="serviceType" defaultValue={engagement?.serviceType ?? ""} placeholder="Repair, inspection, cleaning..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client email</Label>
          <Input id="clientEmail" name="clientEmail" type="email" defaultValue={engagement?.clientEmail ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Client phone</Label>
          <Input id="clientPhone" name="clientPhone" defaultValue={engagement?.clientPhone ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={engagement?.description ?? ""} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={engagement?.status ?? "UNSCHEDULED"} className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="resourceId">Assigned resource</Label>
          <select id="resourceId" name="resourceId" defaultValue={engagement?.resource?.id ?? ""} className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Unassigned</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>{resource.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledStart">Start</Label>
          <Input id="scheduledStart" name="scheduledStart" type="datetime-local" defaultValue={toDateTimeLocal(engagement?.scheduledStart)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledEnd">End</Label>
          <Input id="scheduledEnd" name="scheduledEnd" type="datetime-local" defaultValue={toDateTimeLocal(engagement?.scheduledEnd)} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="locationLabel">Location</Label>
          <Input id="locationLabel" name="locationLabel" defaultValue={engagement?.locationLabel ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="0.0000001" defaultValue={engagement?.latitude ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="0.0000001" defaultValue={engagement?.longitude ?? ""} />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isLoading ? "Saving..." : "Save engagement"}
        </Button>
      </div>
    </form>
  );
}
