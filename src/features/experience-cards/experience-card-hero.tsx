'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from '@/features/shared/icons';
import { viatorAffiliateHref } from '@lib/affiliate/viator-link-builder';
import {
  formatExperienceDuration,
  type Experience,
} from '@core/experience';
import { SafeExperiencePhoto } from './safe-experience-photo';
import {
  experienceFlagLabel,
  formatAverageRating,
  formatPerPerson,
  formatReviewCount,
} from './format';

interface ExperienceCardHeroProps {
  experience: Experience;
}

/**
 * Hero variant - the editorial showpiece. Mirror of PropertyCardHero
 * but for experiences: duration replaces the destination eyebrow, the
 * per-person price replaces the per-night price, and the trust chips
 * favor Viator's "Skip the line / Free cancellation / Likely to sell
 * out" signals over a stay's "Free flexible cancellation."
 *
 * If the experience has no affiliate URL (e.g. allowlist rejection),
 * the card renders as a non-clickable surface rather than a broken
 * link. Visitors still get the discovery value; we just lose the
 * outbound click.
 */
export function ExperienceCardHero({ experience }: ExperienceCardHeroProps) {
  const href = viatorAffiliateHref(experience);
  const rating = formatAverageRating(experience.reviews.averageRating);
  const durationLabel = formatExperienceDuration(experience.duration);
  const trustFlags = experience.flags.slice(0, 3);

  const Tag = href ? motion.a : motion.div;
  const linkProps = href
    ? {
        href,
        target: '_blank' as const,
        rel: 'noopener noreferrer sponsored',
        'aria-label': `${experience.title} on Viator (affiliate link)`,
      }
    : {};

  return (
    <Tag
      {...linkProps}
      whileHover={href ? { y: -4 } : undefined}
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
      <SafeExperiencePhoto
        experience={experience}
        width={1400}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
        priority
      />

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 32%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {durationLabel ? (
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
          {durationLabel}
        </div>
      ) : null}

      {rating !== null ? (
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
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#EDE6DB' }}>{rating}</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(237,230,219,0.7)' }}>
            {formatReviewCount(experience.reviews.total)} reviews
          </span>
        </div>
      ) : null}

      <div className="absolute right-6 bottom-6 left-6 flex flex-col gap-2">
        <h3
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(1.5rem, 2vw, 2rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#EDE6DB',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.55)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {experience.title}
        </h3>

        {experience.summary ? (
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.45,
              color: 'rgba(237,230,219,0.92)',
              margin: 0,
              maxWidth: '32rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {experience.summary}
          </p>
        ) : null}

        {trustFlags.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {trustFlags.map((flag) => (
              <span
                key={flag}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.05em',
                  color: 'rgba(237,230,219,0.92)',
                  padding: '0.22rem 0.55rem',
                  background: 'rgba(12,12,14,0.55)',
                  border: '1px solid rgba(237,230,219,0.22)',
                  borderRadius: '999px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {experienceFlagLabel(flag)}
              </span>
            ))}
          </div>
        ) : null}

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
              {experience.pricing.fromPerPerson > 0
                ? formatPerPerson(experience.pricing.fromPerPerson, experience.pricing.currency)
                : 'Price on request'}
              {experience.pricing.fromPerPerson > 0 ? (
                <span
                  style={{
                    fontSize: '0.7rem',
                    marginLeft: '0.3rem',
                    color: 'rgba(237,230,219,0.7)',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                  }}
                >
                  / person
                </span>
              ) : null}
            </div>
          </div>

          {href ? (
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
              Book on Viator
              <ChevronRight size={10} strokeWidth={2.4} />
            </span>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}
