'use client';

import { motion } from 'framer-motion';
import { viatorAffiliateHref } from '@lib/affiliate/viator-link-builder';
import {
  formatExperienceDuration,
  type Experience,
} from '@core/experience';
import { SafeExperiencePhoto } from './safe-experience-photo';
import { formatAverageRating, formatPerPerson } from './format';

interface ExperienceCardCompactProps {
  experience: Experience;
}

/**
 * Compact carousel card for experiences. Used inside the horizontal
 * `carousel` rail variant. Photo dominates (5/6 aspect), duration +
 * rating overlay the photo, title + price sit on the bottom rail.
 */
export function ExperienceCardCompact({ experience }: ExperienceCardCompactProps) {
  const href = viatorAffiliateHref(experience);
  const rating = formatAverageRating(experience.reviews.averageRating);
  const durationLabel = formatExperienceDuration(experience.duration);

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
      whileHover={href ? { y: -3 } : undefined}
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
        <SafeExperiencePhoto
          experience={experience}
          width={700}
          sizes="(max-width: 768px) 70vw, 22vw"
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.82) 100%)',
          }}
        />

        {durationLabel ? (
          <div
            className="absolute top-2.5 left-2.5"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.58rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#EDE6DB',
              padding: '0.22rem 0.5rem',
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
            className="absolute top-2.5 right-2.5"
            style={{
              padding: '0.22rem 0.5rem',
              background: 'rgba(12,12,14,0.65)',
              backdropFilter: 'blur(6px)',
              borderRadius: '999px',
              border: '1px solid rgba(237,230,219,0.18)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', fontWeight: 600, color: '#EDE6DB' }}>
              {rating}
            </span>
          </div>
        ) : null}

        <div className="absolute right-3.5 bottom-3 left-3.5 flex flex-col gap-1">
          <div
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: '#EDE6DB',
              textShadow: '0 1px 4px rgba(0,0,0,0.65)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {experience.title}
          </div>
          {experience.pricing.fromPerPerson > 0 ? (
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.68rem',
                color: 'rgba(237,230,219,0.92)',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                marginTop: '0.15rem',
              }}
            >
              From {formatPerPerson(experience.pricing.fromPerPerson, experience.pricing.currency)} / person
            </div>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}
