'use client';

import { useMemo } from 'react';
import { pickFeaturedToday } from '../featured-today';

/**
 * Empty-state pane shown before the user submits any trip.
 *
 * Temporary text-only treatment (no destination photo): a few of the
 * Unsplash IDs baked into the mock-italy dataset have been repurposed
 * by Unsplash and now resolve to non-travel imagery (one of them is a
 * burger). Until every ID is audited we render a clean editorial
 * intro instead of pulling a possibly-bad photo. The featured stay's
 * name + location still surfaces so the page doesn't feel empty.
 */
export function EmptyState() {
  const featured = useMemo(() => pickFeaturedToday(), []);

  return (
    <div className="flex h-full flex-col items-start justify-center gap-6 px-10 py-10">
      <div
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-label)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-tertiary)',
        }}
      >
        Featured today
      </div>

      <div className="flex flex-col gap-2">
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(2.6rem, 5vw, 3.4rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ink-primary)',
            margin: 0,
          }}
        >
          {featured.name}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-body)',
            color: 'var(--ink-secondary)',
            margin: 0,
          }}
        >
          {featured.location.region ?? featured.location.country}
          {featured.location.neighborhood ? ` · ${featured.location.neighborhood}` : ''}
          {' · '}
          <span style={{ color: 'var(--accent-primary)' }}>
            {featured.pricing.pricePerNight.amount.toLocaleString()}{' '}
            {featured.pricing.pricePerNight.currency}/night
          </span>
        </p>
      </div>

      <p
        className="max-w-lg"
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'var(--text-body)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--ink-secondary)',
          lineHeight: 1.5,
          marginTop: '0.5rem',
        }}
      >
        Tell me about your trip — or start with one of the suggestions.
      </p>
    </div>
  );
}
