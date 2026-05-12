'use client';

import { motion } from 'framer-motion';
import { buildPropertyAffiliateHref } from './affiliate-href';
import { SafePropertyPhoto } from './safe-property-photo';
import { countryFlag, formatPrice, formatRating } from './format';
import type { Property } from '@lib/discovery/property';

interface PropertyCardCompactProps {
  property: Property;
}

/**
 * Compact carousel card. Used inside the horizontal `carousel` rail.
 * Smaller than Standard: photo dominates (5/6 aspect), copy underneath
 * is two lines, no editorial pitch, no amenities. Rating + price
 * carried on the photo itself so the scroll feels visual-first.
 *
 * Sized so 3.2 cards fit comfortably at desktop widths and 1.4 at
 * mobile - the partial-next-card peek is what cues "this scrolls."
 */
export function PropertyCardCompact({ property }: PropertyCardCompactProps) {
  const href = buildPropertyAffiliateHref(property);
  const flag = countryFlag(property.country);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${property.name} in ${property.destination} (affiliate link)`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative block w-full flex-shrink-0 overflow-hidden"
      style={{
        borderRadius: '0.85rem',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-elevated)',
        boxShadow: 'var(--elev-card)',
        textDecoration: 'none',
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: '5/6' }}>
        <SafePropertyPhoto
          photo={property.photo}
          width={700}
          sizes="(max-width: 768px) 70vw, 22vw"
        />

        {/* Photo-bottom gradient for legible bottom-rail copy. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        {/* Top-right floating rating */}
        <div
          className="absolute top-2.5 right-2.5 flex items-baseline gap-1"
          style={{
            padding: '0.22rem 0.5rem',
            background: 'rgba(12,12,14,0.65)',
            backdropFilter: 'blur(6px)',
            borderRadius: '999px',
            border: '1px solid rgba(237,230,219,0.18)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', fontWeight: 600, color: '#EDE6DB' }}>
            {formatRating(property.rating.score)}
          </span>
        </div>

        {/* Bottom-rail copy: stay name + price */}
        <div className="absolute right-3.5 bottom-3 left-3.5 flex flex-col gap-0.5">
          <div
            className="flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.62rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(237,230,219,0.85)',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)',
            }}
          >
            {flag ? <span aria-hidden>{flag}</span> : null}
            <span>{property.destination}</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1.1rem',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: '#EDE6DB',
              textShadow: '0 1px 4px rgba(0,0,0,0.65)',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {property.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.7rem',
              color: 'rgba(237,230,219,0.92)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              marginTop: '0.2rem',
            }}
          >
            From {formatPrice(property.pricing.fromUsd)} /{' '}
            {property.pricing.unit}
          </div>
        </div>
      </div>
    </motion.a>
  );
}
