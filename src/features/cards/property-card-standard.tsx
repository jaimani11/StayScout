'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from '@/features/shared/icons';
import { buildPropertyAffiliateHref } from './affiliate-href';
import { SafePropertyPhoto } from './safe-property-photo';
import { cancellationLabel, countryFlag, formatPrice, formatRating, formatReviewCount, priceBandLabel } from './format';
import type { Property } from '@lib/discovery/property';

interface PropertyCardStandardProps {
  property: Property;
  /** When true the card uses a denser layout suitable for grids
   *  rendered at the same width as carousel cards. Default false
   *  gives the airy hero-rail-supporting-stack layout. */
  dense?: boolean;
}

/**
 * Mid-density card used in the right-side stack of `hero-rail` and
 * as the grid tile in `grid` layouts. Photo on top (16/10 aspect),
 * info on the bottom rail. No image overlay copy — keep that for
 * the hero variant.
 */
export function PropertyCardStandard({ property, dense = false }: PropertyCardStandardProps) {
  const href = buildPropertyAffiliateHref(property);
  const flag = countryFlag(property.country);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${property.name} in ${property.destination} (affiliate link)`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative flex w-full flex-col overflow-hidden"
      style={{
        borderRadius: '0.95rem',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-elevated)',
        boxShadow: 'var(--elev-card)',
        textDecoration: 'none',
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: dense ? '4/3' : '16/10' }}>
        <SafePropertyPhoto
          photo={property.photo}
          width={1000}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 26vw"
        />

        {/* Top rail floating chips */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#EDE6DB',
              padding: '0.25rem 0.55rem',
              background: 'rgba(12,12,14,0.65)',
              backdropFilter: 'blur(6px)',
              borderRadius: '999px',
              border: '1px solid rgba(237,230,219,0.18)',
            }}
          >
            {priceBandLabel(property.pricing.band)}
          </span>
          {flag ? (
            <span
              aria-hidden
              style={{
                fontSize: '0.85rem',
                padding: '0.18rem 0.4rem',
                background: 'rgba(12,12,14,0.65)',
                backdropFilter: 'blur(6px)',
                borderRadius: '999px',
                border: '1px solid rgba(237,230,219,0.18)',
                lineHeight: 1,
              }}
            >
              {flag}
            </span>
          ) : null}
        </div>

        <div
          className="absolute top-3 right-3 flex items-baseline gap-1.5"
          style={{
            padding: '0.25rem 0.55rem',
            background: 'rgba(12,12,14,0.65)',
            backdropFilter: 'blur(6px)',
            borderRadius: '999px',
            border: '1px solid rgba(237,230,219,0.18)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 600, color: '#EDE6DB' }}>
            {formatRating(property.rating.score)}
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', color: 'rgba(237,230,219,0.7)' }}>
            {formatReviewCount(property.rating.reviews)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          {property.destination}
          {property.neighborhood ? ` · ${property.neighborhood}` : ''}
        </div>

        <h4
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '1.25rem',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--ink-primary)',
            margin: 0,
          }}
        >
          {property.name}
        </h4>

        <p
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 1.45,
            color: 'var(--ink-secondary)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {property.pitch}
        </p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.6rem',
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
                fontSize: '1.1rem',
                fontWeight: 400,
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}
            >
              {formatPrice(property.pricing.fromUsd)}
              <span
                style={{
                  fontSize: '0.65rem',
                  marginLeft: '0.25rem',
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
                fontSize: '0.6rem',
                color: 'var(--ink-tertiary)',
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
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
            }}
          >
            Search
            <ChevronRight size={9} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
