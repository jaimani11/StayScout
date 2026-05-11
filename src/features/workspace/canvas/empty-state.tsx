'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from '@/features/shared/icons';
import {
  buildExpediaSearchUrl,
  getExpediaAffiliateConfig,
} from '@lib/affiliate/expedia-link-builder';
import { encodeAffiliateLink } from '@lib/affiliate/link-encoder';

/**
 * Empty-state pane - Apple-style destination slider.
 *
 *   - Full-bleed photo crossfade across hand-picked destinations.
 *   - Auto-advances every 6s; pauses when the user is hovering or
 *     actively dragging.
 *   - Drag horizontally to advance/retreat (mouse + touch).
 *   - Prev / next chevron buttons in the corners.
 *   - Pagination dots at the bottom.
 *   - The whole slide is a clickable affiliate link that routes
 *     through `/r/[id]` to Expedia search, prefilled with the
 *     destination and a default 5-night window - so a curious
 *     visitor who hasn't typed anything yet can still click through
 *     and convert.
 *
 * Photo IDs are hand-picked from Unsplash. Unsplash occasionally
 * repurposes IDs (one ours pointed to a burger; another to London
 * masquerading as Tuscany), so the slide set is deliberately small
 * and an `onError` swap-out replaces a broken photo with a coloured
 * gradient + the destination name so the carousel never breaks the
 * page.
 */

interface CarouselSlide {
  name: string;
  region: string;
  /** ISO-3166 alpha-2 - used to build a working Expedia search URL. */
  country: string;
  /** Unsplash photo id (the part after `photo-` in the URL). */
  id: string;
  alt: string;
  photographer: string;
  /** Hex pair for the gradient fallback when the photo fails to load. */
  gradient: [string, string];
}

const SLIDES: readonly CarouselSlide[] = [
  {
    name: 'Tokyo',
    region: 'Japan',
    country: 'JP',
    id: '1540959733332-eab4deabeeaf',
    alt: 'Tokyo Shibuya neon at night',
    photographer: 'Jezael Melgoza',
    gradient: ['#0f1c3a', '#5b2466'],
  },
  {
    name: 'Paris',
    region: 'France',
    country: 'FR',
    id: '1431274172761-fca41d930114',
    alt: 'Paris Eiffel Tower at dusk',
    photographer: 'Chris Karidis',
    gradient: ['#2a2a4a', '#7a5a3a'],
  },
  {
    name: 'Iceland',
    region: 'Reykjavík + the ring road',
    country: 'IS',
    id: '1500530855697-b586d89ba3ee',
    alt: 'Iceland aurora over glacial landscape',
    photographer: 'Jonatan Pie',
    gradient: ['#0a1d2e', '#1c4d6e'],
  },
  {
    name: 'Kyoto',
    region: 'Japan',
    country: 'JP',
    id: '1493976040374-85c8e12f0c0e',
    alt: 'Kyoto Fushimi Inari torii gates',
    photographer: 'Sorasak',
    gradient: ['#3a1a1a', '#8b2c2c'],
  },
  {
    name: 'Vancouver',
    region: 'Canada · Pacific Northwest',
    country: 'CA',
    id: '1502086223501-7ea6ecd79368',
    alt: 'Vancouver skyline + Stanley Park',
    photographer: 'Mike Benna',
    gradient: ['#1a2a3a', '#3a5a7a'],
  },
  {
    name: 'Patagonia',
    region: 'Argentina + Chile',
    country: 'AR',
    id: '1486870591958-9b9d0d1dda99',
    alt: 'Patagonia Torres del Paine peaks',
    photographer: 'Casey Horner',
    gradient: ['#1a2a3a', '#5a7a9a'],
  },
  {
    name: 'Lisbon',
    region: 'Portugal',
    country: 'PT',
    id: '1513735718075-2e2d54f8de80',
    alt: 'Lisbon tram on a yellow street',
    photographer: 'Tom Byrom',
    gradient: ['#3a2a1a', '#aa7a4a'],
  },
  {
    name: 'Maldives',
    region: 'Indian Ocean',
    country: 'MV',
    id: '1499678329028-101435549a4e',
    alt: 'Maldives overwater bungalows',
    photographer: 'Cassie Matias',
    gradient: ['#0a4f7a', '#3aafbf'],
  },
];

const SLIDE_INTERVAL_MS = 6000;
const DRAG_THRESHOLD_PX = 70;

function unsplashUrl(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=1800&q=80&fit=crop&auto=format`;
}

/** Default a curious visitor's search to "in 30 days, 5 nights, 2 adults". */
function defaultDates(): { checkIn: string; checkOut: string } {
  const today = new Date();
  const checkIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(checkIn.getTime() + 5 * 24 * 60 * 60 * 1000);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

function tracedExpediaHref(slide: CarouselSlide): string {
  const { checkIn, checkOut } = defaultDates();
  const url = buildExpediaSearchUrl(
    {
      destination: `${slide.name}, ${slide.region}`,
      checkIn,
      checkOut,
      adults: 2,
    },
    getExpediaAffiliateConfig(),
  );
  const id = encodeAffiliateLink({
    url,
    providerId: 'expedia',
    stayId: `empty-state-${slide.name.toLowerCase()}`,
  });
  return `/r/${id}`;
}

export function EmptyState() {
  const [index, setIndex] = useState(0);
  const [imageOk, setImageOk] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const dragX = useMotionValue(0);

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
    setImageOk(true);
  }, []);

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // Auto-advance - pauses while hovered or dragging so the user can
  // study a slide without it slipping away.
  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => {
      if (!isDraggingRef.current) goNext();
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isHovered, goNext]);

  // Keyboard nav - arrows move slides, Enter opens the link.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  const slide = SLIDES[index]!;
  const href = tracedExpediaHref(slide);

  // The carousel root is `absolute inset-0` over its parent <section>.
  // That guarantees full-height regardless of how the grid measures the
  // cell - `h-full` was collapsing in some viewport / Turbopack-HMR
  // states. With inset-0 the overlay always fills its positioned
  // ancestor, which `workspace.tsx` already declares with
  // `relative min-h-0` on the canvas section.
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo layer - Apple-style drag-to-swipe over a crossfading
       *  background. The motion.div is dragged on the X axis; the
       *  AnimatePresence inside swaps the underlying Image. */}
      <motion.div
        className="absolute inset-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        style={{ x: dragX }}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          // Defer click suppression - onClick fires after onDragEnd.
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 50);
          if (info.offset.x < -DRAG_THRESHOLD_PX) goNext();
          else if (info.offset.x > DRAG_THRESHOLD_PX) goPrev();
        }}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            {imageOk ? (
              <Image
                src={unsplashUrl(slide.id)}
                alt={slide.alt}
                fill
                sizes="62vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0}
                onError={() => setImageOk(false)}
                draggable={false}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(140deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 100%)`,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Legibility gradient - dark top + dark bottom, transparent middle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Whole-photo affiliate click target. Suppresses the click when
       *  the user just finished a drag so swipes don't accidentally
       *  fire the redirect. */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="absolute inset-0 cursor-pointer"
        aria-label={`Search ${slide.name} on Expedia (affiliate link)`}
        onClick={(e) => {
          if (isDraggingRef.current) e.preventDefault();
        }}
        draggable={false}
      />

      {/* Editorial overlay - a single flex column so the top and bottom
       *  rows are physically separated by `flex-1` spacer. They can't
       *  overlap regardless of viewport height. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col p-6"
        style={{ gap: '1rem' }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(237,230,219,0.92)',
              padding: '0.3rem 0.55rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(237,230,219,0.35)',
              borderRadius: '0.25rem',
              backdropFilter: 'blur(6px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              maxWidth: '60%',
            }}
          >
            Where StayScout could send you
          </span>
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6rem',
              letterSpacing: '0.05em',
              color: 'rgba(237,230,219,0.75)',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)',
              textAlign: 'right',
              flexShrink: 0,
            }}
          >
            Photo · {slide.photographer} / Unsplash
          </span>
        </div>

        {/* Spacer - guarantees the top and bottom rows can never crash
         *  into each other, no matter how short the viewport gets. */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="flex items-end justify-between gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${slide.id}-label`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-1"
            >
              <h2
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: '#EDE6DB',
                  textShadow: '0 2px 10px rgba(0,0,0,0.65)',
                  margin: 0,
                }}
              >
                {slide.name}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 'var(--text-body)',
                  color: 'rgba(237,230,219,0.88)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  margin: 0,
                }}
              >
                {slide.region}
              </p>
            </motion.div>
          </AnimatePresence>

          <span
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#EDE6DB',
              padding: '0.5rem 0.9rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(237,230,219,0.5)',
              borderRadius: '999px',
              backdropFilter: 'blur(6px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              flexShrink: 0,
            }}
          >
            View on Expedia
            <ChevronRight size={12} strokeWidth={2.2} aria-hidden />
          </span>
        </div>

        {/* Pagination row - prev arrow, dots, next arrow. All bottom-
         *  centered together so the photo area itself stays clean. */}
        <div
          className="pointer-events-auto flex items-center justify-center gap-3"
          aria-label="Carousel navigation"
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous destination"
            style={chevronButtonStyle}
          >
            <ChevronRight
              size={14}
              strokeWidth={2.4}
              style={{ transform: 'rotate(180deg)' }}
            />
          </button>

          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.name}`}
                aria-current={i === index}
                style={{
                  width: i === index ? '1.4rem' : '0.4rem',
                  height: '0.2rem',
                  borderRadius: '0.2rem',
                  background: i === index ? 'rgba(237,230,219,0.95)' : 'rgba(237,230,219,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 600ms ease, background 600ms ease',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next destination"
            style={chevronButtonStyle}
          >
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

const chevronButtonStyle: CSSProperties = {
  width: '1.9rem',
  height: '1.9rem',
  borderRadius: '999px',
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(237,230,219,0.4)',
  color: '#EDE6DB',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};
