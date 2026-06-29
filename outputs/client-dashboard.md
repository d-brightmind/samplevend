# VendoBird Client Dashboard

## UX Structure

- The dashboard opens at `/client`.
- Top metric cards summarize upcoming bookings, completed services, tracked providers, unread messages, and reviews.
- Main column prioritizes upcoming bookings and booking history.
- Side column shows messages and reviews.
- Provider tracking appears as a full-width section for quick status and next-visit context.

## Components

- `ClientDashboard`
  - Metric cards
  - Upcoming bookings
  - Booking history
  - Provider tracking
  - Messages
  - Reviews
- `/client/page.tsx`
  - Protected page wrapper.
- `GET /api/client-dashboard`
  - Client dashboard API read model.

## API Requirements

- `GET /api/client-dashboard`
  - Requires authenticated `CLIENT` or `ADMIN`.
  - Resolves dashboard data by authenticated user email.
  - Returns upcoming bookings, booking history, provider tracking, messages, reviews, and metrics.

## Permissions

- `CLIENT`: Can view their own dashboard by email-scoped booking and engagement records.
- `ADMIN`: Can preview client dashboard behavior during setup.
- Other roles receive `403` from the API and cannot open `/client`.

## Mobile Experience

- Metric cards collapse into a two-column mobile grid.
- Upcoming booking cards use large tap targets.
- Messages and reviews stack below primary booking content.
- Provider tracking cards avoid horizontal scrolling.
- Empty states explain what will appear once bookings exist.
