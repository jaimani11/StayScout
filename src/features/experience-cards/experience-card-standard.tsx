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

interface ExperienceCardStandardProps {
  experience: Experience;
  /** Dense variant for grid layouts. Slightly tighter aspect + smaller
   *  type. Default false for the airy hero-rail use case. */
  dense?: boolean;
}

/**
 * Standard experience card: photo on top, info on the bottom.
 * Used in grid and hero-rail-supporting layouts.
 */
export function ExperienceCardStandard({ experience, dense = false }: ExperienceCardStandardProps) {
  const href = viatorAffiliateHref(experience);
  const rating = formatAverageRating(experience.reviews.averageRating);
  const durationLabel = formatExperienceDuration(experience.duration);
  const topFlag = experience.flags[0];

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
        <SafeExperiencePhoto
          experience={experience}
          width={1000}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 26vw"
        />

        {durationLabel ? (
          <div
            className="absolute top-3 left-3"
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
            {durationLabel}
          </div>
        ) : null}

        {rating !== null ? (
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
              {rating}
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', color: 'rgba(237,230,219,0.7)' }}>
              {formatReviewCount(experience.reviews.total)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h4
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '1.1rem',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--ink-primary)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {experience.title}
        </h4>

        {experience.summary ? (
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '0.82rem',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.4,
              color: 'var(--ink-secondary)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {experience.summary}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
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
                fontSize: '1.05rem',
                fontWeight: 400,
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}
            >
              {experience.pricing.fromPerPerson > 0
                ? formatPerPerson(experience.pricing.fromPerPerson, experience.pricing.currency)
                : 'Inquire'}
              {experience.pricing.fromPerPerson > 0 ? (
                <span
                  style={{
                    fontSize: '0.62rem',
                    marginLeft: '0.25rem',
                    color: 'var(--ink-tertiary)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  / person
                </span>
              ) : null}
            </div>
            {topFlag ? (
              <div
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.6rem',
                  color: 'var(--ink-tertiary)',
                  marginTop: '0.2rem',
                }}
              >
                {experienceFlagLabel(topFlag)}
              </div>
            ) : null}
          </div>
          {href ? (
            <span
              className="inline-flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
              }}
            >
              Book
              <ChevronRight size={9} strokeWidth={2.4} />
            </span>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}
