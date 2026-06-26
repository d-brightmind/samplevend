# VendoBird Schedule Module

## UX Structure

- `/schedule` is the operational planning surface for Admin and Dispatcher users.
- Day view shows each active resource as a horizontal timeline with engagement blocks positioned across the day.
- Week view shows each resource across seven day cells with scheduled engagements grouped by day.
- Unassigned engagements appear below the timeline with inline assignment controls.
- Availability is visible in each resource lane so dispatchers can see working windows before assigning work.

## Component Architecture

- `ScheduleBoard`: Main day/week schedule renderer.
- `ScheduleAssignControl`: Client-side assignment action for unassigned engagements.
- `EngagementStatusBadge`: Reused status indicator.
- `AppShell`: Protected SaaS navigation shell.
- `/api/schedule`: Account-scoped read model for resources, availability, and engagements.
- `/api/schedule/assign`: Assignment endpoint with conflict detection.

## Scheduling Logic

- Day view range: selected date at `00:00` through the next day.
- Week view range: Monday through Sunday for the selected week.
- Engagements are included when their scheduled window overlaps the visible range.
- Resource lanes are built from active resources.
- Availability is matched by weekday.
- Unassigned scheduled engagements are kept visible so dispatchers can resolve them quickly.

## API Requirements

- `GET /api/schedule?view=day|week&date=YYYY-MM-DD`
  - Requires `schedule:view`.
  - Returns active resources, availability, and engagements in the selected range.
- `PATCH /api/schedule/assign`
  - Requires `schedule:manage`.
  - Body: `engagementId`, `resourceId`.
  - Validates account ownership, resource activity, engagement schedule, and closed status.

## Conflict Handling

The assignment endpoint blocks overlapping work for the same resource.

Overlap rule:

```text
existing.scheduledStart < new.scheduledEnd
AND existing.scheduledEnd > new.scheduledStart
```

Blocking statuses:

- Scheduled
- Assigned
- In Progress

Completed and Cancelled engagements do not block assignment.
