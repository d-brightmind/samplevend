# VendoBird Individual Provider Dashboard

## User Flow

1. Individual Provider signs in and lands on `/resource`.
2. They see current availability, today's schedule, active jobs, pending booking requests, and upcoming work.
3. They review today's route map preview before leaving for jobs.
4. They open job details from today's schedule or upcoming jobs.
5. They review client context and notifications.
6. AI suggestions highlight the next best operational action.

## Component Hierarchy

- `/resource/page.tsx`
  - `AppShell`
  - `ProviderDashboard`
    - Provider hero
    - Dashboard metrics
    - Today's schedule
    - Route map preview
    - Notifications
    - AI suggestions
    - Upcoming jobs
    - Clients

## Mobile UX

- Hero and availability appear first for quick context.
- Metrics collapse into a compact two-column grid.
- Today's schedule cards are large tap targets.
- Notifications and AI suggestions are short, scannable cards.
- Route map preview is visible without requiring map interaction.
- Job and client sections are stacked to avoid horizontal scrolling.

## API Requirements

- `GET /api/provider-dashboard`
  - Requires authenticated Admin, Dispatcher, or Resource role.
  - Resolves the provider resource by `userProfileId` or email.
  - Returns provider profile, today's jobs, upcoming jobs, clients, notifications, AI suggestions, and metrics.

## Dashboard Metrics

- Today's jobs
- Active jobs
- Completed today
- Upcoming jobs
- Pending booking requests

## Data Sources

- `Resource`
- `ResourceAvailability`
- `Engagement`
- `BookingRequest`
- `ProviderReview`
- `Skill`
