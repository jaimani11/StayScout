import type { Metadata } from 'next';
import { ITALIAN_DESTINATIONS } from '@lib/curation/destinations';
import { STAYS_BY_DESTINATION } from '@/providers/mock-italy/data';
import { DestinationCard } from '@/features/destinations/destination-card';

/**
 * Index of curated destinations. Static — no runtime cost.
 */

export const metadata: Metadata = {
  title: 'Destinations · StayScout',
  description: 'Curated Italian destinations and the stays we love in each.',
};

export default function DestinationsIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
      <header className="mb-8 md:mb-12">
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          Curated · Italy
        </p>
        <h1
          className="mt-2"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-display-lg, 3.5rem)',
            fontWeight: 300,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          Destinations
        </h1>
        <p
          className="mt-3 max-w-xl"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-body)',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--ink-secondary)',
            lineHeight: 1.55,
          }}
        >
          Seven places we know well — the kind of working knowledge that comes from staying, not
          visiting.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITALIAN_DESTINATIONS.map((d) => {
          const photo = STAYS_BY_DESTINATION[d.slug]?.[0]?.photos[0];
          return (
            <DestinationCard
              key={d.slug}
              destination={d}
              {...(photo?.url ? { imageUrl: photo.url } : {})}
              {...(photo?.alt ? { imageAlt: photo.alt } : {})}
            />
          );
        })}
      </div>
    </main>
  );
}
