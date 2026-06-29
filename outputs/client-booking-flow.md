# VendoBird Client Booking Flow

## UX Flow

The public booking flow is designed for low-friction completion from a provider profile.

Steps:

1. Choose service
   - Client selects a provider service card.
   - If no configured services exist, a general service request fallback appears.
2. Select date and time
   - Suggested slots are generated from provider availability.
   - If no availability exists, the client can choose a preferred time manually.
3. Enter details
   - Name, email, optional phone, address/service area, and notes.
4. Confirm booking
   - Client reviews service, time, contact, and location before submitting.

After confirmation, the system creates a `BookingRequest` and shows a success state with a short reference.

## Components

- `BookingFlow`
  - Four-step client booking wizard.
  - Mobile-first controls.
  - Inline validation and success state.
- `/providers/[slug]/book`
  - Public booking page.
  - Loads provider services and generated slots.
- `ProviderProfilePage`
  - Booking CTA now routes directly to the booking flow.

## Validation

- Service is required.
- Requested start time must be valid.
- Requested start must be at least 30 minutes in the future.
- Client name is required.
- Client email must be valid.
- Service address or area is required.
- Notes are capped at 1000 characters.
- Selected service must belong to the provider.

## Error Handling

- Step-level errors appear inline.
- API validation errors return clear public-safe messages.
- Missing provider returns `404`.
- Invalid service returns `400`.
- Failed submission keeps the user on the confirmation step with their data intact.
- Success state confirms receipt without exposing internal operational data.

## API Endpoints

- `GET /api/public/providers/[slug]/booking-options`
  - Public.
  - Returns provider summary, services, and generated availability slots.
- `POST /api/public/providers/[slug]/bookings`
  - Public.
  - Creates a `BookingRequest`.
  - Returns booking ID, status, and requested start time.

## Database

- `BookingRequest`
  - Stores public booking leads.
  - Links to `Account`, `Resource`, and optionally `ProviderService`.
  - Tracks request status independently from internal engagements.
