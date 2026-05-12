'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from '@/features/shared/icons';
import { buildPropertyAffiliateHref } from './affiliate-href';
import { SafePropertyPhoto } from './safe-property-photo';
import { cancellationLabel, countryFlag, formatPrice, formatRating, formatReviewCount } from './format';
import type { Property } from '@lib/discovery/property';

interface EditorialCardProps {
  property: Property;
  /** Side the photo sits on. Default 'left' - the copy block then
   *  appears to the right. Used by the editorial-slab layout to
   *  alternate sides for visual rhythm. */
  photoSide?: 'left' | 'right';
}

/**
 * Magazine-style "feature" card. Half photo, half copy column, the
 * widest of all variants. Designed for the `editorial-slab` layout
 * where two of these sit side-by-side with a center callout.
 *
 * The split is 50/50 on desktop, stacked photo-over-copy on mobile.
 */
export function EditorialCard({ property, photoSide = 'left' }: EditorialCardProps) {
  const href = buildPropertyAffiliateHref(property);
  const flag = countryFlag(property.country);
  const visibleAmenities = property.amenities.slice(0, 3);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${property.name} in ${property.destination} (affiliate link)`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative grid w-full grid-cols-1 overflow-hidden md:grid-cols-2"
      style={{
        borderRadius: '1.1rem',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-elevated)',
        boxShadow: 'var(--elev-card)',
        textDecoration: 'none',
        minHeight: '24rem',
      }}
    >
      {/* Photo column */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: '4 / 3',
          gridRow: 1,
          gridColumn: photoSide === 'right' ? 'md / 2' : 1,
        }}
      >
        <SafePropertyPhoto
          photo={property.photo}
          width={1200}
          sizes="(max-width: 768px) 100vw, 45vw"
        />

        <div
          className="absolute top-4 left-4 flex items-center gap-1.5"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.6rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#EDE6DB',
            padding: '0.3rem 0.6rem',
            background: 'rgba(12,12,14,0.7)',
            backdropFilter: 'blur(6px)',
            borderRadius: '999px',
            border: '1px solid rgba(237,230,219,0.18)',
          }}
        >
          {flag ? <span aria-hidden>{flag}</span> : null}
          <span>{property.destination}</span>
          {property.neighborhood ? (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{property.neighborhood}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Copy column */}
      <div
        className="flex w-full flex-col justify-between gap-5 p-7 md:p-10"
        style={{
          gridRow: 1,
          gridColumn: photoSide === 'right' ? 1 : 'md / 2',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--ink-primary)',
              }}
            >
              {formatRating(property.rating.score)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.7rem',
                color: 'var(--ink-tertiary)',
              }}
            >
              {formatReviewCount(property.rating.reviews)} reviews
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--ink-primary)',
              margin: 0,
            }}
          >
            {property.name}
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1rem',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.55,
              color: 'var(--ink-secondary)',
              margin: 0,
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
                  color: 'var(--ink-secondary)',
                  padding: '0.22rem 0.55rem',
                  background: 'var(--accent-primary-soft)',
                  borderRadius: '999px',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.62rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-tertiary)',
              }}
            >
              From
            </div>
            <div
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '1.4rem',
                fontWeight: 400,
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}
            >
              {formatPrice(property.pricing.fromUsd)}
              <span
                style={{
                  fontSize: '0.7rem',
                  marginLeft: '0.3rem',
                  color: 'var(--ink-tertiary)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                / {property.pricing.unit}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.62rem',
                color: 'var(--ink-tertiary)',
                marginTop: '0.18rem',
              }}
            >
              {cancellationLabel(property.cancellation)}
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              padding: '0.42rem 0.85rem',
              border: '1px solid var(--accent-primary)',
              borderRadius: '999px',
              background: 'var(--accent-primary-soft)',
            }}
          >
            Search on Expedia
            <ChevronRight size={11} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
