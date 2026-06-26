# VendoBird Dispatch Map Experience

## UX Flow

1. Admin or Dispatcher opens `/dispatch-map`.
2. The map loads active resources, open engagements, assignment conflicts, and current location metadata.
3. Resource markers show live location, status, skills, and travel radius context.
4. Engagement markers show client work, location, status, and conflict state.
5. Dispatcher uses the assignment workflow to assign or reassign an engagement to an active resource.
6. The API blocks conflicting assignments and the UI refreshes after successful assignment.

## Map Architecture

- `DispatchMap` is a client component that renders Mapbox GL when `NEXT_PUBLIC_MAPBOX_TOKEN` is configured.
- Without a token, the module renders an operational fallback map so the dispatch workflow remains testable.
- Marker layers:
  - Resources: live resource locations.
  - Engagements: service destinations.
  - Conflicts: red engagement markers and side-panel warnings.
  - Radius rings: represented as travel radius metadata now, ready for Mapbox circle layers.

## Component Hierarchy

- `/dispatch-map/page.tsx`
  - `AppShell`
  - `DispatchMap`
  - `DispatchAssignPanel`
  - `EngagementStatusBadge`
  - `StatusBadge`

## Realtime Implementation

- The client subscribes to Supabase Realtime `postgres_changes`.
- Tables watched:
  - `Resource`
  - `Engagement`
- On change, the client refetches `GET /api/dispatch-map`.
- A 30-second polling fallback is also active so the map recovers if realtime drops.

## API Requirements

- `GET /api/dispatch-map`
  - Requires `dispatch:view`.
  - Returns active resources, live coordinates, engagement markers, conflict metadata, skills, and availability.
- `PATCH /api/dispatch-map/assign`
  - Requires `dispatch:assign`.
  - Body: `engagementId`, `resourceId`.
  - Validates resource activity, account ownership, engagement status, schedule presence, and conflicts.

## Performance Optimization

- Server returns a map-specific read model instead of full records.
- Realtime events trigger a single read-model refetch.
- Polling fallback is throttled to 30 seconds.
- Mapbox markers are recreated from compact arrays.
- Engagement queries only include active dispatch statuses.
- Conflict detection uses indexed `resourceId`, `scheduledStart`, and `scheduledEnd` fields.
