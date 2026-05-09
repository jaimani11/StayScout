import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ITALIAN_DESTINATIONS, findDestinationBySlugOrAlias } from '@lib/curation/destinations';
import { STAYS_BY_DESTINATION } from '@/providers/mock-italy/data';
import { DestinationHero } from '@/features/destinations/destination-hero';
import { FeaturedStays } from '@/features/destinations/featured-stays';
import { PlanTripCta } from '@/features/destinations/plan-trip-cta';
import { DestinationJsonLd } from './destination-jsonld';

/**
 * Static destination page. Generated at build time for the 7 curated
 * Italian destinations; unknown slugs 404.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ITALIAN_DESTINATIONS.map((d) => ({ slug: d.slug }));
}

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = findDestinationBySlugOrAlias(slug);
  if (!destination) {
    return { title: 'Destination not found · StayScout' };
  }
  const stays = STAYS_BY_DESTINATION[destination.slug] ?? [];
  const heroImage = stays[0]?.photos[0]?.url;
  return {
    title: `${destination.name} · StayScout`,
    description: destination.oneLiner,
    openGraph: {
      title: `${destination.name} · StayScout`,
      description: destination.oneLiner,
      url: `${siteUrl()}/destinations/${destination.slug}`,
      type: 'article',
      ...(heroImage ? { images: [{ url: heroImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.name} · StayScout`,
      description: destination.oneLiner,
      ...(heroImage ? { images: [heroImage] } : {}),
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = findDestinationBySlugOrAlias(slug);
  if (!destination) notFound();

  const stays = STAYS_BY_DESTINATION[destination.slug] ?? [];
  const heroPhoto = stays[0]?.photos[0];
  const featured = stays.slice(0, 6);

  return (
    <main>
      <DestinationJsonLd
        destination={destination}
        baseUrl={siteUrl()}
        {...(heroPhoto ? { imageUrl: heroPhoto.url } : {})}
      />
      <DestinationHero
        destination={destination}
        {...(heroPhoto?.url ? { heroImageUrl: heroPhoto.url } : {})}
        {...(heroPhoto?.alt ? { heroImageAlt: heroPhoto.alt } : {})}
      />
      <FeaturedStays stays={featured} prefillPrompt={`${destination.name}, 7 nights, couple`} />
      <PlanTripCta destination={destination} />
    </main>
  );
}
