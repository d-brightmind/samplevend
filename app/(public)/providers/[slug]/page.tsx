import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderProfilePage } from "@/components/public-provider/provider-profile-page";
import { getPublicProviderProfile } from "@/lib/public-provider/profile";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProviderProfile(slug);

  if (!profile) {
    return {
      title: "Provider not found | VendoBird"
    };
  }

  const title = `${profile.name} | ${profile.title} in ${profile.serviceArea}`;
  const description = profile.bio.slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: profile.photoUrl ? [{ url: profile.photoUrl }] : undefined
    }
  };
}

export default async function PublicProviderPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublicProviderProfile(slug);

  if (!profile) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.name,
    description: profile.bio,
    areaServed: profile.serviceArea,
    aggregateRating: profile.ratingAverage
      ? {
          "@type": "AggregateRating",
          ratingValue: profile.ratingAverage.toFixed(1),
          reviewCount: profile.ratingCount
        }
      : undefined,
    review: profile.reviews.map((review) => ({
      "@type": "Review",
      author: review.reviewerName,
      reviewRating: { "@type": "Rating", ratingValue: review.rating },
      reviewBody: review.comment
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProviderProfilePage profile={profile} />
    </>
  );
}
