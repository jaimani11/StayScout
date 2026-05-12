'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from '@/features/shared/icons';
import { buildPropertyAffiliateHref } from './affiliate-href';
import { SafePropertyPhoto } from './safe-property-photo';
import { cancellationLabel, countryFlag, formatPrice, formatRating, formatReviewCount, priceBandLabel } from './format';
import type { Property } from '@lib/discovery/property';

interface PropertyCardHeroProps {
  property: Property;
}

/**
 * Hero variant of the property card. The biggest, most editorial
 * shape: portrait aspect (4/5 or taller), large editorial copy,
 * amenity badges, price + rating on the bottom rail.
 *
 * Used as the left-side anchor of the `hero-rail` layout and as the
 * lead card in the `editorial-slab` layout. Should feel like a
 * magazine cover, not a directory tile.
 *
 * The motion treatment is intentionally subtle: a small Y lift on
 * hover and a slow photo zoom. No flashy entrance animations on
 * scroll because the whole rail is doing that work upstream.
 */
export function PropertyCardHero({ property }: PropertyCardHeroProps) {
  const href = buildPropertyAffiliateHref(property);
  const flag = countryFlag(property.country);
  const visibleAmenities = property.amenities.slice(0, 3);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${property.name} in ${property.destination} (affiliate link)`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative block w-full overflow-hidden"
      style={{
        aspectRatio: '4 / 5',
        borderRadius: '1.1rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--elev-card)',
        textDecoration: 'none',
        background: 'var(--surface-elevated)',
      }}
    >
      <SafePropertyPhoto
        photo={property.photo}
        width={1400}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
        priority
      />

      {/* Top-to-bottom darken so the editorial copy is legible. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 32%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Top-left: price-band eyebrow + flag. */}
      <div
        className="absolute top-5 left-5 flex items-center gap-2"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.65rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#EDE6DB',
          padding: '0.3rem 0.65rem',
          background: 'rgba(12,12,14,0.65)',
          backdropFilter: 'blur(6px)',
          borderRadius: '999px',
          border: '1px solid rgba(237,230,219,0.18)',
        }}
      >
        <span>{priceBandLabel(property.pricing.band)}</span>
        {flag ? <span aria-hidden>{flag}</span> : null}
      </div>

      {/* Top-right: rating chip. */}
      <div
        className="absolute top-5 right-5 flex items-baseline gap-1.5"
        style={{
          fontFamily: 'var(--font-inter)',
          padding: '0.3rem 0.65rem',
          background: 'rgba(12,12,14,0.65)',
          backdropFilter: 'blur(6px)',
          borderRadius: '999px',
          border: '1px solid rgba(237,230,219,0.18)',
        }}
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#EDE6DB' }}>
          {formatRating(property.rating.score)}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(237,230,219,0.7)' }}>
          {formatReviewCount(property.rating.reviews)} reviews
        </span>
      </div>

      {/* Bottom: editorial block. */}
      <div className="absolute right-6 bottom-6 left-6 flex flex-col gap-2">
        <div
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(237,230,219,0.78)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {property.destination}
          {property.neighborhood ? ` · ${property.neighborhood}` : ''}
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(1.7rem, 2.1vw, 2.1rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#EDE6DB',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.55)',
          }}
        >
          {property.name}
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '0.95rem',
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 1.45,
            color: 'rgba(237,230,219,0.92)',
            margin: 0,
            maxWidth: '32rem',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          {property.pitch}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {visibleAmenities.map((a) => (
            <span
              key={a}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                color: 'rgba(237,230,219,0.92)',
                padding: '0.22rem 0.55rem',
                background: 'rgba(12,12,14,0.55)',
                border: '1px solid rgba(237,230,219,0.22)',
                borderRadius: '999px',
                backdropFilter: 'blur(4px)',
              }}
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(237,230,219,0.65)',
              }}
            >
              From
            </div>
            <div
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '1.4rem',
                fontWeight: 400,
                color: '#EDE6DB',
                lineHeight: 1,
              }}
            >
              {formatPrice(property.pricing.fromUsd)}
              <span
                style={{
                  fontSize: '0.7rem',
                  marginLeft: '0.3rem',
                  color: 'rgba(237,230,219,0.7)',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 400,
                }}
              >
                / {property.pricing.unit}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.62rem',
                color: 'rgba(237,230,219,0.65)',
                marginTop: '0.18rem',
              }}
            >
              {cancellationLabel(property.cancellation)}
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              padding: '0.3rem 0.7rem',
              border: '1px solid var(--accent-primary)',
              borderRadius: '999px',
              background: 'rgba(12,12,14,0.45)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Search on Expedia
            <ChevronRight size={10} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
