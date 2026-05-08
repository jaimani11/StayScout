'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { pickFeaturedToday } from '../featured-today';

export function EmptyState() {
  const featured = useMemo(() => pickFeaturedToday(), []);
  const photo = featured.photos[0];

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div
        className="mb-1"
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
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[22px] border"
        style={{
          aspectRatio: '4/3',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--elev-hero)',
        }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(max-width: 1280px) 60vw, 800px"
            className="object-cover"
            priority
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
          <div>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'var(--text-display-sm)',
                fontWeight: 400,
                color: '#EDE6DB',
                lineHeight: 1.1,
              }}
            >
              {featured.name}
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-body-sm)',
                color: 'rgba(237,230,219,0.7)',
              }}
            >
              {featured.location.region ?? featured.location.country}
              {featured.location.neighborhood ? ` · ${featured.location.neighborhood}` : ''}
            </p>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'var(--text-display-sm)',
              color: 'var(--accent-primary)',
            }}
          >
            {featured.pricing.pricePerNight.amount}{' '}
            <span style={{ fontSize: 'var(--text-body-sm)' }}>
              {featured.pricing.pricePerNight.currency}
            </span>
          </p>
        </div>
      </div>
      <p
        className="max-w-md"
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'var(--text-body)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--ink-secondary)',
          lineHeight: 1.5,
        }}
      >
        Tell me about your trip — or start with one of the suggestions.
      </p>
    </div>
  );
}
