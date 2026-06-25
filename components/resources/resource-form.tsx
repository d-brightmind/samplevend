"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormattedResource } from "@/lib/resources/format";
import { weekdays } from "@/lib/validation/resource";

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "OFFLINE", label: "Offline" },
  { value: "ON_LEAVE", label: "On leave" }
];

export function ResourceForm({ resource }: { resource?: FormattedResource }) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(resource?.skills.map((skill) => skill.name) ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const availabilityByDay = useMemo(
    () => new Map(resource?.availability.map((item) => [item.weekday, item])),
    [resource]
  );

  function addSkill() {
    const next = skillInput.trim();
    if (!next || skills.includes(next)) return;
    setSkills([...skills, next]);
    setSkillInput("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const availability = weekdays.map((weekday) => ({
      weekday,
      startTime: String(formData.get(`${weekday}_start`) || "09:00"),
      endTime: String(formData.get(`${weekday}_end`) || "17:00"),
      timezone: String(formData.get(`${weekday}_timezone`) || "UTC"),
      isWorking: formData.get(`${weekday}_working`) === "on"
    }));

    const response = await fetch(resource ? `/api/resources/${resource.id}` : "/api/resources", {
      method: resource ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoUrl: formData.get("photoUrl") || "",
        name: formData.get("name"),
        email: formData.get("email") || "",
        phone: formData.get("phone") || "",
        title: formData.get("title") || "",
        status: formData.get("status"),
        locationLabel: formData.get("locationLabel") || "",
        latitude: formData.get("latitude") || "",
        longitude: formData.get("longitude") || "",
        notes: formData.get("notes") || "",
        skills,
        availability
      })
    });

    const data = (await response.json().catch(() => null)) as { resource?: { id: string }; error?: string } | null;
    setIsLoading(false);

    if (!response.ok || !data?.resource) {
      setError(data?.error ?? "We could not save this resource. Try again.");
      return;
    }

    router.push(`/resources/${data.resource.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={resource?.name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={resource?.title ?? ""} placeholder="Technician, cleaner, driver..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={resource?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={resource?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoUrl">Photo URL</Label>
          <Input id="photoUrl" name="photoUrl" type="url" defaultValue={resource?.photoUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={resource?.status ?? "AVAILABLE"} className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-base font-semibold">Skills</h2>
        <div className="mt-3 flex gap-2">
          <Input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} placeholder="Add a skill" />
          <Button type="button" variant="secondary" onClick={addSkill}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.length > 0 ? skills.map((skill) => (
            <button
              key={skill}
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm font-medium"
              onClick={() => setSkills(skills.filter((item) => item !== skill))}
            >
              {skill}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )) : <p className="text-sm text-muted-foreground">Add skills for filtering and dispatch matching.</p>}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="locationLabel">Current location</Label>
          <Input id="locationLabel" name="locationLabel" defaultValue={resource?.locationLabel ?? ""} placeholder="Lekki Phase 1, Lagos" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="0.0000001" defaultValue={resource?.latitude ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="0.0000001" defaultValue={resource?.longitude ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={resource?.notes ?? ""} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-base font-semibold">Availability</h2>
        <div className="mt-4 grid gap-3">
          {weekdays.map((weekday) => {
            const existing = availabilityByDay.get(weekday);
            return (
              <div key={weekday} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_7rem_7rem_8rem] sm:items-center">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input name={`${weekday}_working`} type="checkbox" defaultChecked={existing?.isWorking ?? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].includes(weekday)} />
                  {weekday.replace("_", " ").toLowerCase()}
                </label>
                <Input name={`${weekday}_start`} type="time" defaultValue={existing?.startTime ?? "09:00"} aria-label={`${weekday} start time`} />
                <Input name={`${weekday}_end`} type="time" defaultValue={existing?.endTime ?? "17:00"} aria-label={`${weekday} end time`} />
                <Input name={`${weekday}_timezone`} defaultValue={existing?.timezone ?? "Africa/Lagos"} aria-label={`${weekday} timezone`} />
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isLoading ? "Saving..." : "Save resource"}
        </Button>
      </div>
    </form>
  );
}
