# VendoBird Public Provider Profile

## User Experience

The profile is designed as a public conversion page for clients evaluating a provider.

Primary flow:

1. Visitor lands on `/providers/[slug]`.
2. They immediately see provider name, title, photo, rating, service area, response time, and headline.
3. They scan services, availability, and reviews.
4. They use the booking CTA to start a VendoBird request.

The page supports a calm SaaS marketplace feel: high trust, clear sections, restrained layout, and persistent mobile booking action.

## Layout Structure

- Header with VendoBird identity and booking CTA.
- Hero section:
  - Provider information
  - Rating
  - Service area
  - Response time
  - Booking panel
- Main content:
  - Services
  - Reviews
- Sidebar:
  - Service area
  - Availability
- Mobile sticky booking CTA.

## SEO Strategy

- Dynamic metadata per provider.
- Title format: `Provider Name | Provider Title in Service Area`.
- Meta description from provider bio.
- Open Graph support with provider image.
- JSON-LD `LocalBusiness` schema.
- JSON-LD aggregate rating and reviews when available.
- Slug-based public route for crawlable URLs.

## API Requirements

- `GET /api/public/providers/[slug]`
  - Public endpoint.
  - Returns provider info, service area, services, availability, skills, ratings, and published reviews.

Data source:

- `Resource`
- `ProviderService`
- `ProviderReview`
- `ResourceAvailability`
- `Skill`

## Conversion Optimization Recommendations

- Keep the primary booking CTA visible above the fold.
- Show rating, reviews, response time, and verification near the provider name.
- Use specific service names and price labels where possible.
- Make availability visible before the client starts booking.
- Add client-friendly review snippets with service names.
- Use service area language that matches local search intent.
- Add a Mapbox service-area preview once Mapbox token is configured.
