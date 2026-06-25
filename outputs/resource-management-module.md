# VendoBird Resource Management Module

## User Flows

1. Admin or Dispatcher opens `/resources` to search and filter the resource directory by name, skill, status, or location.
2. Admin or Dispatcher selects a resource to view profile details, photo, skills, working hours, status history, and current location.
3. Admin or Dispatcher creates a resource from `/resources/new`, assigning skills, weekly availability, status, and location.
4. Admin or Dispatcher edits a resource from `/resources/[resourceId]/edit`.
5. Admin deactivates a resource from the profile. The resource remains auditable but is removed from active capacity.

## Components

- `ResourceCard`: Directory card with photo, name, status, skills, working hours, and location.
- `ResourceForm`: Add/edit form for profile, skills, availability, status, and location.
- `ResourceAvatar`: Photo or accessible fallback avatar.
- `StatusBadge`: Consistent visual status indicator.
- `DeactivateResourceButton`: Permission-protected client action.
- `AppShell`: Shared protected SaaS shell with resource navigation.

## Database Structure

- `Resource`: Account-scoped resource profile, status, active flag, contact info, location, notes, and audit timestamps.
- `Skill`: Account-scoped skill catalog.
- `ResourceSkill`: Many-to-many resource skill assignment.
- `ResourceAvailability`: Weekly working-hour schedule.
- `ResourceStatusEvent`: Status tracking and audit history.

## API Endpoints

- `GET /api/resources`: List resources for the active account.
- `POST /api/resources`: Create a resource.
- `GET /api/resources/[resourceId]`: Fetch a single resource.
- `PATCH /api/resources/[resourceId]`: Edit resource profile, skills, availability, status, and location.
- `DELETE /api/resources/[resourceId]`: Deactivate a resource.
- `PATCH /api/resources/[resourceId]/status`: Update status and create status history.

## Validation

- Name is required and capped at 120 characters.
- Email must be valid when supplied.
- Photo URL must be valid when supplied.
- Status must be one of `AVAILABLE`, `BUSY`, `OFFLINE`, `ON_LEAVE`, `DEACTIVATED`.
- Skills are capped at 12 per resource.
- Availability is capped at 7 weekday records.
- Time values must use `HH:mm`.
- Latitude and longitude are range checked.
- Notes and deactivation reasons are length capped.

## Permissions

- `ADMIN`: Can view, create, edit, and deactivate resources.
- `DISPATCHER`: Can view, create, edit, and update resource status.
- `RESOURCE`: Uses the personal resource workspace, not the management directory.
- `CLIENT`: No resource management access.

All resource APIs scope data by the authenticated account and reject unauthenticated, unverified, or unauthorized access.
