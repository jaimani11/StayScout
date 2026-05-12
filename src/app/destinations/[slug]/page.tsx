import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ITALIAN_DESTINATIONS, findDestinationBySlugOrAlias } from '@lib/curation/destinations';
import { resolveDestinationPhoto } from '@lib/imagery/destination-photo';
import {
  buildExpediaSearchUrl,
  getExpediaAffiliateConfig,
} from '@lib/affiliate/expedia-link-builder';
import { encodeAffiliateLink } from '@lib/affiliate/link-encoder';
import { DestinationHero } from '@/features/destinations/destination-hero';
import { PlanTripCta } from '@/features/destinations/plan-trip-cta';
import { DestinationThingsToDoRail } from '@/features/destinations/destination-things-to-do-rail';
import { DestinationStayCta } from '@/features/destinations/destination-stay-cta';
import { DestinationJsonLd } from './destination-jsonld';

/**
 * Destination detail page. Generated at build time for each curated
 * destination; unknown slugs 404.
 *
 * Post-H2 structure (no mock-italy):
 *
 *   1. Hero - background photo resolved by `resolveDestinationPhoto`
 *      (curated Unsplash IDs in `lib/imagery/destination-photo-data`),
 *      editorial copy from `lib/curation/destinations`.
 *   2. Live "Things to do" rail - Viator inventory scoped to the
 *      destination, fetched client-side.
 *   3. "Where to stay" CTA - destination-prefilled Expedia search,
 *      routed through `/r/[id]` for affiliate attribution. Until
 *      real stay inventory lands we don't pretend to have it; the
 *      CTA is honest about handing off to the partner.
 *   4. Plan-trip CTA - lands the visitor in the workspace with the
 *      destination prompt pre-filled.
 *
 * The page is SSG because each piece above is deterministic per slug;
 * the Viator rail fetches on the client so the static HTML stays
 * fast + cacheable.
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
  if (!destination) return { title: 'Destination not found · StayScout' };

  const heroPhoto = resolveDestinationPhoto({
    name: destination.name,
    country: 'IT',
    region: destination.region,
  });

  return {
    title: `${destination.name} · StayScout`,
    description: destination.oneLiner,
    openGraph: {
      title: `${destination.name} · StayScout`,
      description: destination.oneLiner,
      url: `${siteUrl()}/destinations/${destination.slug}`,
      type: 'article',
      images: [{ url: heroPhoto.url }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.name} · StayScout`,
      description: destination.oneLiner,
      images: [heroPhoto.url],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = findDestinationBySlugOrAlias(slug);
  if (!destination) notFound();

  const heroPhoto = resolveDestinationPhoto({
    name: destination.name,
    country: 'IT',
    region: destination.region,
  });

  // Build the Expedia search href once at request time so the date
  // window rolls forward and the affiliate config picks up env flips.
  const expediaHref = buildDestinationExpediaHref(destination.name);

  return (
    <main>
      <DestinationJsonLd
        destination={destination}
        baseUrl={siteUrl()}
        imageUrl={heroPhoto.url}
      />
      <DestinationHero
        destination={destination}
        heroImageUrl={heroPhoto.url}
        heroImageAlt={heroPhoto.alt}
      />
      <DestinationThingsToDoRail destinationName={destination.name} />
      <DestinationStayCta destination={destination} expediaHref={expediaHref} />
      <PlanTripCta destination={destination} />
    </main>
  );
}

function buildDestinationExpediaHref(destinationName: string): string {
  const today = new Date();
  const checkIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(checkIn.getTime() + 5 * 24 * 60 * 60 * 1000);
  const config = getExpediaAffiliateConfig();
  const url = buildExpediaSearchUrl(
    {
      destination: destinationName,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      adults: 2,
    },
    config,
  );
  const id = encodeAffiliateLink({
    url,
    providerId: 'expedia',
    stayId: `destination-page-${destinationName.toLowerCase().replace(/\s+/g, '-')}`,
  });
  return `/r/${id}`;
}
