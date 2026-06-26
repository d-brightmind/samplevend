# VendoBird Engagement Management Module

## User Journey

1. Admin or Dispatcher opens `/engagements` to review active and historical service work.
2. They create an engagement from `/engagements/new`, capturing client details, service scope, schedule, location, and optional resource.
3. The system checks whether the selected resource already has overlapping scheduled work.
4. The engagement moves through `Unscheduled`, `Scheduled`, `Assigned`, `In Progress`, `Completed`, or `Cancelled`.
5. Admin or Dispatcher can edit details, assign or reassign a resource, update status, or cancel the engagement.

## Component Structure

- `EngagementCard`: Directory item showing title, client, status, schedule, resource, and location.
- `EngagementForm`: Shared create/edit form for client, service, schedule, assignment, and location.
- `EngagementStatusBadge`: Consistent status display.
- `EngagementStatusButton`: Start/complete status actions.
- `CancelEngagementButton`: Cancellation action with API enforcement.
- `AppShell`: Protected operational SaaS shell with engagement navigation.

## Database Relationships

- `Account` has many `Engagement`.
- `Engagement` belongs to one account.
- `Engagement` optionally belongs to one `Resource`.
- `Resource` has many assigned engagements.
- `Engagement` has many `EngagementStatusEvent`.

Important fields:

- `status`
- `scheduledStart`
- `scheduledEnd`
- `resourceId`
- `clientName`
- `serviceType`
- `locationLabel`
- `cancellationReason`

## API Routes

- `GET /api/engagements`: List account-scoped engagements.
- `POST /api/engagements`: Create engagement.
- `GET /api/engagements/[engagementId]`: Fetch engagement profile.
- `PATCH /api/engagements/[engagementId]`: Edit engagement.
- `DELETE /api/engagements/[engagementId]`: Cancel engagement.
- `PATCH /api/engagements/[engagementId]/assign`: Assign resource.
- `PATCH /api/engagements/[engagementId]/status`: Update status.

## Conflict Detection Approach

When an engagement has a resource, start time, and end time, the API checks for overlapping engagements assigned to the same resource.

Overlap rule:

```text
existing.scheduledStart < new.scheduledEnd
AND existing.scheduledEnd > new.scheduledStart
```

Blocking statuses:

- Scheduled
- Assigned
- In Progress

Completed and Cancelled engagements do not block future assignment.

## Validation Rules

- Title is required.
- Client name is required.
- Email must be valid when provided.
- Scheduled or assigned engagements require start and end time.
- End time must be after start time.
- Assigned engagements require a resource.
- Assigned resource must belong to the active account.
- Closed engagements cannot be reassigned or status-updated.
- Completed engagements cannot be cancelled.
- Conflict detection returns `409` with the conflicting engagement title.
