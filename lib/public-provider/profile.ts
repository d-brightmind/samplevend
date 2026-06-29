import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const publicProviderInclude = {
  account: true,
  skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
  availability: { orderBy: { weekday: "asc" } },
  publicServices: { orderBy: [{ isFeatured: "desc" }, { name: "asc" }] },
  reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 8 }
} satisfies Prisma.ResourceInclude;

type PublicProviderRecord = Prisma.ResourceGetPayload<{ include: typeof publicProviderInclude }>;

function formatPublicProvider(provider: PublicProviderRecord) {
  const reviews = provider.reviews.map((review) => ({
    id: review.id,
    reviewerName: review.reviewerName,
    rating: review.rating,
    comment: review.comment,
    serviceName: review.serviceName,
    createdAt: review.createdAt.toISOString()
  }));

  const averageFromReviews =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return {
    id: provider.id,
    slug: provider.publicSlug,
    name: provider.name,
    title: provider.title ?? "Service provider",
    photoUrl: provider.photoUrl,
    headline: provider.publicHeadline ?? `Trusted ${provider.title ?? "service provider"} for local work`,
    bio:
      provider.publicBio ??
      provider.notes ??
      "Reliable, responsive provider available for service requests through VendoBird.",
    accountName: provider.account.name,
    serviceArea: provider.serviceArea ?? provider.locationLabel ?? "Local service area",
    locationLabel: provider.locationLabel,
    yearsExperience: provider.yearsExperience,
    responseTimeMinutes: provider.responseTimeMinutes ?? 60,
    ratingAverage: provider.ratingAverage ? Number(provider.ratingAverage) : averageFromReviews,
    ratingCount: provider.ratingCount || reviews.length,
    services: provider.publicServices.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      priceLabel: service.priceLabel,
      durationMinutes: service.durationMinutes,
      isFeatured: service.isFeatured
    })),
    skills: provider.skills.map((item) => item.skill.name),
    availability: provider.availability.map((item) => ({
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      timezone: item.timezone,
      isWorking: item.isWorking
    })),
    reviews
  };
}

export async function getPublicProviderProfile(slug: string) {
  const provider = await prisma.resource.findFirst({
    where: {
      publicSlug: slug,
      isActive: true,
      account: { isActive: true }
    },
    include: publicProviderInclude
  });

  if (!provider) return null;

  return formatPublicProvider(provider);
}

export type PublicProviderProfile = ReturnType<typeof formatPublicProvider>;
