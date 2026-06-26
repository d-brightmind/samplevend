"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { AlertTriangle, MapPin, Navigation, Radio, UserRound } from "lucide-react";
import { EngagementStatusBadge, type EngagementStatus } from "@/components/engagements/engagement-status-badge";
import { StatusBadge, type ResourceStatus } from "@/components/resources/status-badge";

type DispatchResource = {
  id: string;
  name: string;
  title: string | null;
  status: string;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  lastSeenAt: string | null;
  travelRadiusKm: number;
  skills: string[];
};

type DispatchEngagement = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  resource: { id: string; name: string } | null;
  conflict: { title: string } | null;
};

function coordinateBounds(resources: DispatchResource[], engagements: DispatchEngagement[]) {
  const coords = [
    ...resources.filter((item) => item.latitude && item.longitude).map((item) => [item.longitude!, item.latitude!] as [number, number]),
    ...engagements.filter((item) => item.latitude && item.longitude).map((item) => [item.longitude!, item.latitude!] as [number, number])
  ];
  return coords.length ? coords : [[3.3792, 6.5244] as [number, number]];
}

export function DispatchMap({
  initialResources,
  initialEngagements,
  accountId,
  mapboxToken,
  supabaseUrl,
  supabaseKey
}: {
  initialResources: DispatchResource[];
  initialEngagements: DispatchEngagement[];
  accountId: string;
  mapboxToken?: string;
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [resources, setResources] = useState(initialResources);
  const [engagements, setEngagements] = useState(initialEngagements);
  const coords = useMemo(() => coordinateBounds(resources, engagements), [resources, engagements]);

  useEffect(() => {
    if (!mapboxToken || !mapNodeRef.current || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    mapRef.current = new mapboxgl.Map({
      container: mapNodeRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coords[0],
      zoom: 10
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [coords, mapboxToken]);

  useEffect(() => {
    if (!mapRef.current) return;
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    resources.forEach((resource) => {
      if (!resource.latitude || !resource.longitude) return;
      const element = document.createElement("div");
      element.className = "h-4 w-4 rounded-full border-2 border-white bg-emerald-600 shadow";
      const marker = new mapboxgl.Marker(element)
        .setLngLat([resource.longitude, resource.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${resource.name}</strong><br/>${resource.locationLabel ?? "Live resource"}`))
        .addTo(mapRef.current!);
      markerRefs.current.push(marker);
    });

    engagements.forEach((engagement) => {
      if (!engagement.latitude || !engagement.longitude) return;
      const element = document.createElement("div");
      element.className = `h-5 w-5 rounded-md border-2 border-white shadow ${engagement.conflict ? "bg-red-600" : "bg-primary"}`;
      const marker = new mapboxgl.Marker(element)
        .setLngLat([engagement.longitude, engagement.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${engagement.title}</strong><br/>${engagement.clientName}`))
        .addTo(mapRef.current!);
      markerRefs.current.push(marker);
    });
  }, [engagements, resources]);

  useEffect(() => {
    let isMounted = true;
    async function refresh() {
      const response = await fetch("/api/dispatch-map", { cache: "no-store" });
      if (!response.ok || !isMounted) return;
      const data = (await response.json()) as { resources: DispatchResource[]; engagements: DispatchEngagement[] };
      setResources(data.resources);
      setEngagements(data.engagements);
    }

    const interval = window.setInterval(refresh, 30_000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let channel: { unsubscribe: () => void } | null = null;
    async function connectRealtime() {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      channel = supabase
        .channel(`dispatch-map-${accountId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "Resource" }, async () => {
          const response = await fetch("/api/dispatch-map", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as { resources: DispatchResource[]; engagements: DispatchEngagement[] };
            setResources(data.resources);
            setEngagements(data.engagements);
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "Engagement" }, async () => {
          const response = await fetch("/api/dispatch-map", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as { resources: DispatchResource[]; engagements: DispatchEngagement[] };
            setResources(data.resources);
            setEngagements(data.engagements);
          }
        })
        .subscribe();
    }
    connectRealtime();
    return () => {
      channel?.unsubscribe();
    };
  }, [accountId, supabaseKey, supabaseUrl]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="font-semibold">Dispatch map</h2>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Realtime ready
          </span>
        </div>
        {mapboxToken ? (
          <div ref={mapNodeRef} className="h-[34rem] w-full" />
        ) : (
          <div className="relative h-[34rem] overflow-hidden bg-[linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px),linear-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:48px_48px] p-4">
            <div className="absolute left-4 top-4 rounded-md bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
              Add `NEXT_PUBLIC_MAPBOX_TOKEN` for live Mapbox tiles.
            </div>
            <div className="grid h-full place-items-center">
              <div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
                {resources.slice(0, 6).map((resource) => (
                  <div key={resource.id} className="rounded-lg border bg-card/95 p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span className="font-medium">{resource.name}</span>
                      </div>
                      <StatusBadge status={resource.status as ResourceStatus} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{resource.locationLabel || "No live location"}</p>
                    <div className="mt-3 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                      Travel radius {resource.travelRadiusKm}km
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <aside className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Conflict indicators</h2>
          <div className="mt-3 space-y-3">
            {engagements.filter((engagement) => engagement.conflict).length > 0 ? engagements.filter((engagement) => engagement.conflict).map((engagement) => (
              <div key={engagement.id} className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{engagement.title} conflicts with {engagement.conflict?.title}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No active dispatch conflicts detected.</p>}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Engagement markers</h2>
          <div className="mt-3 space-y-3">
            {engagements.slice(0, 6).map((engagement) => (
              <div key={engagement.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{engagement.title}</p>
                    <p className="text-sm text-muted-foreground">{engagement.locationLabel || "No location"}</p>
                  </div>
                  <EngagementStatusBadge status={engagement.status as EngagementStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
