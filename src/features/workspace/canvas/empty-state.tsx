'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Empty-state pane — what the user sees before they describe a trip.
 *
 * A rotating, full-bleed carousel of hand-curated destination photos.
 * Each entry is verified-travel content sourced from the same lookup
 * that powers F1's search-opportunity hero band — so the welcome
 * surface can never accidentally render a non-travel image even if
 * a downstream Unsplash ID drifts (as one did and produced the
 * infamous "burger" landing).
 *
 * Slides crossfade every ~6s. Each shows the destination name + region
 * over a soft bottom gradient + a photographer credit in the corner.
 * Pure visual chrome — the actionable copy + suggestions live in the
 * chat sidebar (see `chat-sidebar/greeting.tsx`).
 */

interface CarouselSlide {
  name: string;
  region: string;
  /** Unsplash photo id (after `photo-` in the URL). */
  id: string;
  alt: string;
  photographer: string;
}

const SLIDES: readonly CarouselSlide[] = [
  {
    name: 'Tokyo',
    region: 'Japan',
    id: '1538970272646-f61fabb3a8a2',
    alt: 'Tokyo Shibuya at night',
    photographer: 'Jezael Melgoza',
  },
  {
    name: 'Paris',
    region: 'France',
    id: '1502602898657-3e91760cbb34',
    alt: 'Paris rooftops at dusk',
    photographer: 'Jonas Jacobsson',
  },
  {
    name: 'Iceland',
    region: 'Reykjavík + the ring road',
    id: '1531168556467-80aace0d0144',
    alt: 'Iceland glacier landscape',
    photographer: 'Cosmic Timetraveler',
  },
  {
    name: 'Tuscany',
    region: 'Italy',
    id: '1490642914619-7955a3fd483c',
    alt: 'Tuscany cypress road',
    photographer: 'Florian Wehde',
  },
  {
    name: 'Vancouver',
    region: 'Canada · Pacific Northwest',
    id: '1502086223501-7ea6ecd79368',
    alt: 'Vancouver skyline + Stanley Park',
    photographer: 'Mike Benna',
  },
  {
    name: 'Patagonia',
    region: 'Argentina + Chile',
    id: '1486870591958-9b9d0d1dda99',
    alt: 'Patagonia Torres del Paine peaks',
    photographer: 'Casey Horner',
  },
  {
    name: 'Lisbon',
    region: 'Portugal',
    id: '1513735718075-2e2d54f8de80',
    alt: 'Lisbon tram on yellow street',
    photographer: 'Tom Byrom',
  },
  {
    name: 'Maldives',
    region: 'Indian Ocean',
    id: '1499678329028-101435549a4e',
    alt: 'Maldives overwater bungalows',
    photographer: 'Cassie Matias',
  },
];

const SLIDE_INTERVAL_MS = 6000;

function unsplashUrl(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=1800&q=80&fit=crop&auto=format`;
}

export function EmptyState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <Image
            src={unsplashUrl(slide.id)}
            alt={slide.alt}
            fill
            sizes="(max-width: 1280px) 70vw, 1100px"
            style={{ objectFit: 'cover' }}
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom gradient so the editorial overlay stays legible. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Eyebrow */}
      <div
        className="absolute top-8 left-8"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-label)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(237,230,219,0.85)',
          padding: '0.3rem 0.6rem',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(237,230,219,0.35)',
          borderRadius: '0.2rem',
          backdropFilter: 'blur(4px)',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        Where StayScout could send you
      </div>

      {/* Destination name + region */}
      <div className="absolute right-8 bottom-12 left-8 flex items-end justify-between gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${slide.id}-label`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-1"
          >
            <h2
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(2.6rem, 5vw, 3.6rem)',
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#EDE6DB',
                textShadow: '0 2px 8px rgba(0,0,0,0.55)',
                margin: 0,
              }}
            >
              {slide.name}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-body)',
                color: 'rgba(237,230,219,0.85)',
                textShadow: '0 1px 3px rgba(0,0,0,0.55)',
                margin: 0,
              }}
            >
              {slide.region}
            </p>
          </motion.div>
        </AnimatePresence>

        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
            color: 'rgba(237,230,219,0.7)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          Photo · {slide.photographer} / Unsplash
        </p>
      </div>

      {/* Slide indicators */}
      <div
        className="absolute right-8 bottom-4 flex items-center gap-1.5"
        aria-label="Carousel progress"
      >
        {SLIDES.map((s, i) => (
          <span
            key={s.id}
            aria-hidden
            style={{
              width: i === index ? '1.5rem' : '0.4rem',
              height: '0.18rem',
              borderRadius: '0.18rem',
              background: i === index ? 'rgba(237,230,219,0.9)' : 'rgba(237,230,219,0.35)',
              transition: 'width 600ms ease, background 600ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
