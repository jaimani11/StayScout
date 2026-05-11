'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronRight, Sparkle, Send } from '@/features/shared/icons';
import {
  buildExpediaSearchUrl,
  getExpediaAffiliateConfig,
} from '@lib/affiliate/expedia-link-builder';
import { encodeAffiliateLink } from '@lib/affiliate/link-encoder';
import { useWorkspaceStore } from '../store/workspace-store';
import { useConciergeStream } from '../hooks/use-concierge-stream';

/**
 * Landing page - what visitors see before they describe a trip.
 *
 * Layout (inspired by bedroomvillas.com):
 *
 *   1. Full-bleed hero with a rotating destination photo carousel
 *      as the background.
 *   2. Centered editorial title + tagline + a prominent search bar
 *      whose placeholder reads "Describe where you want to go..."
 *      so the natural-language input style is obvious at a glance.
 *   3. Featured destinations grid below the hero - 6 hand-curated
 *      cards, each clickable straight through to an Expedia search
 *      via the /r/[id] affiliate-tracking redirect.
 *
 * When the user submits the search (or types in the input + presses
 * enter), the workspace switches over to the existing chat-sidebar +
 * canvas split via the `useWorkspaceStore` state machine (a turn
 * appears, the landing page unmounts).
 *
 * This component is rendered by Workspace.tsx when no turn exists.
 * The chat-sidebar + canvas shell takes over after the first turn.
 */

interface CarouselSlide {
  name: string;
  region: string;
  country: string;
  id: string;
  alt: string;
  photographer: string;
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
    alt: 'Vancouver skyline and Stanley Park',
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
    name: 'Sydney',
    region: 'Australia',
    country: 'AU',
    id: '1506973035872-a4ec16b8e8d9',
    alt: 'Sydney Opera House and Harbour Bridge',
    photographer: 'Caleb',
    gradient: ['#1a3a5a', '#3a8aba'],
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

interface FeaturedDestination {
  name: string;
  tagline: string;
  /** Hex pair so the card renders cleanly even if its photo fails. */
  gradient: [string, string];
  /** Optional photo - falls through to the gradient on error. */
  photo?: { id: string; alt: string };
}

const FEATURED: readonly FeaturedDestination[] = [
  {
    name: 'Tokyo',
    tagline: 'Three days of standing-up ramen, late train rides, neon districts.',
    gradient: ['#1a1a3a', '#5b2466'],
    photo: { id: '1540959733332-eab4deabeeaf', alt: 'Tokyo Shibuya' },
  },
  {
    name: 'Paris',
    tagline: 'Coffee on rue Cler, museum lines, late dinners on the Left Bank.',
    gradient: ['#2a2a4a', '#7a5a3a'],
    photo: { id: '1431274172761-fca41d930114', alt: 'Paris Eiffel Tower' },
  },
  {
    name: 'Tuscany',
    tagline: 'Slow mornings, vineyard lunches, hill towns at golden hour.',
    gradient: ['#3a2a1a', '#aa7a4a'],
    photo: { id: '1500382017468-9049fed747ef', alt: 'Tuscan-Umbrian hills' },
  },
  {
    name: 'Iceland',
    tagline: 'The ring road, geothermal pools, northern lights when you slow down.',
    gradient: ['#0a1d2e', '#1c4d6e'],
    photo: { id: '1500530855697-b586d89ba3ee', alt: 'Iceland glacier' },
  },
  {
    name: 'Vancouver',
    tagline: 'Pacific-Northwest weekend: harbor light, cedar saunas, early-closing kitchens.',
    gradient: ['#1a2a3a', '#3a5a7a'],
    photo: { id: '1502086223501-7ea6ecd79368', alt: 'Vancouver skyline' },
  },
  {
    name: 'Maldives',
    tagline: 'Overwater bungalows, snorkel-clear water, almost nothing to do.',
    gradient: ['#0a4f7a', '#3aafbf'],
    photo: { id: '1499678329028-101435549a4e', alt: 'Maldives bungalows' },
  },
];

const SLIDE_INTERVAL_MS = 5000;
const FIRST_ADVANCE_MS = 1000;

function unsplashUrl(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80&fit=crop&auto=format`;
}

/** Default a homepage curious visitor's search to in 30 days, 5 nights, 2 adults. */
function defaultDates(): { checkIn: string; checkOut: string } {
  const today = new Date();
  const checkIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(checkIn.getTime() + 5 * 24 * 60 * 60 * 1000);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

function affiliateRedirectHref(destination: string): string {
  const { checkIn, checkOut } = defaultDates();
  const url = buildExpediaSearchUrl(
    { destination, checkIn, checkOut, adults: 2 },
    getExpediaAffiliateConfig(),
  );
  const id = encodeAffiliateLink({
    url,
    providerId: 'expedia',
    stayId: `landing-${destination.toLowerCase()}`,
  });
  return `/r/${id}`;
}

// ============== LandingPage ==============

export function LandingPage() {
  return (
    <div className="relative h-full w-full overflow-y-auto">
      <LandingHero />
      <FeaturedGrid />
      <LandingFooter />
    </div>
  );
}

// ============== Hero ==============

function LandingHero() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % SLIDES.length);
        schedule(SLIDE_INTERVAL_MS);
      }, delay);
    };
    schedule(FIRST_ADVANCE_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isHovered]);

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <section
      className="relative w-full"
      style={{ minHeight: '85vh' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo layer */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <SafePhoto slide={slide} />
        </motion.div>
      </AnimatePresence>

      {/* Base darkening layer over the whole photo - just enough to
       *  knock back hyper-saturated photography (neon-lit Tokyo,
       *  glacier sunlight) without losing the destination feel. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)' }}
      />

      {/* Radial vignette that focuses on the centered editorial block.
       *  Darkens more aggressively around the text than at the edges so
       *  the title + tagline + search bar are unambiguously legible. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Centered editorial + search */}
      <div className="relative z-10 flex h-full min-h-[85vh] flex-col items-center justify-center px-6 pt-16 pb-24">
        <div
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(237,230,219,0.85)',
            padding: '0.3rem 0.7rem',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(237,230,219,0.4)',
            borderRadius: '0.25rem',
            backdropFilter: 'blur(6px)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            marginBottom: '1.5rem',
          }}
        >
          StayScout · public preview
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#EDE6DB',
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.7)',
            margin: 0,
            textAlign: 'center',
            maxWidth: '46rem',
          }}
        >
          Where to,{' '}
          <em style={{ color: 'var(--accent-primary)', fontStyle: 'italic' }}>next?</em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            lineHeight: 1.5,
            color: '#EDE6DB',
            textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.7)',
            margin: '1.2rem 0 2.4rem',
            textAlign: 'center',
            maxWidth: '38rem',
          }}
        >
          A concierge for the trip you actually want to take. Tell me a city, a vibe, a budget,
          a party size. I&rsquo;ll find real stays or send you to Expedia, Vrbo and Hotels.com
          with your search already filled in.
        </p>

        <NaturalLanguageSearch />

        {/* Slide labels + nav */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous destination"
            style={chevronButtonStyle}
          >
            <ChevronRight
              size={14}
              strokeWidth={2.4}
              style={{ transform: 'rotate(180deg)' }}
            />
          </button>

          <div
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              color: 'rgba(237,230,219,0.85)',
              textShadow: '0 1px 2px rgba(0,0,0,0.55)',
              minWidth: '12rem',
              textAlign: 'center',
            }}
          >
            <strong style={{ fontWeight: 500 }}>{slide.name}</strong>
            <span style={{ opacity: 0.7 }}>{` · ${slide.region}`}</span>
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next destination"
            style={chevronButtonStyle}
          >
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
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
                transition: 'width 500ms ease, background 500ms ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SafePhoto({ slide }: { slide: CarouselSlide }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 100%)`,
        }}
      />
    );
  }
  return (
    <Image
      src={unsplashUrl(slide.id, 2000)}
      alt={slide.alt}
      fill
      sizes="100vw"
      style={{ objectFit: 'cover' }}
      priority
      onError={() => setOk(false)}
    />
  );
}

// ============== Natural-language search ==============

function NaturalLanguageSearch() {
  const draft = useWorkspaceStore((s) => s.inputDraft);
  const setDraft = useWorkspaceStore((s) => s.setInputDraft);
  const phase = useWorkspaceStore((s) => s.phase);
  const { send } = useConciergeStream();
  const [focused, setFocused] = useState(false);

  const isStreaming = phase === 'composing' || phase === 'shimmering' || phase === 'refining';

  const submit = () => {
    if (!draft.trim() || isStreaming) return;
    void send({ rawInput: draft, type: 'compose' });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ width: '100%', maxWidth: '38rem' }}
    >
      <div
        className="flex items-center gap-3 rounded-full px-5 py-3.5"
        style={{
          background: 'rgba(12, 12, 14, 0.88)',
          border: `1px solid ${
            focused ? 'var(--accent-primary)' : 'rgba(237,230,219,0.6)'
          }`,
          backdropFilter: 'blur(14px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
          transition: 'border-color var(--dur-fast) var(--ease-out)',
        }}
      >
        <Sparkle size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isStreaming}
          placeholder="Describe where you want to go..."
          aria-label="Describe where you want to go"
          className="flex-1 bg-transparent outline-none disabled:opacity-60"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '1rem',
            color: '#EDE6DB',
            letterSpacing: '0.005em',
          }}
        />
        <button
          type="submit"
          disabled={!draft.trim() || isStreaming}
          aria-label="Submit search"
          style={{
            flexShrink: 0,
            width: '2.4rem',
            height: '2.4rem',
            borderRadius: '999px',
            border: 'none',
            background: draft.trim() && !isStreaming ? 'var(--accent-primary)' : 'rgba(237,230,219,0.18)',
            color: draft.trim() && !isStreaming ? '#1a1a1a' : 'rgba(237,230,219,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: draft.trim() && !isStreaming ? 'pointer' : 'not-allowed',
            transition: 'background var(--dur-fast) var(--ease-out)',
          }}
        >
          <Send size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center justify-center gap-1.5"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(237,230,219,0.55)',
            marginRight: '0.4rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          Try
        </span>
        {[
          'Austria ski trip for 6 people',
          'Vancouver luxury weekend near restaurants',
          'Tokyo for a long weekend',
        ].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setDraft(q);
              void send({ rawInput: q, type: 'compose' });
            }}
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(12, 12, 14, 0.78)',
              border: '1px solid rgba(237,230,219,0.5)',
              color: '#EDE6DB',
              cursor: 'pointer',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </form>
  );
}

// ============== Featured destinations grid ==============

function FeaturedGrid() {
  return (
    <section
      className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16"
      style={{ background: 'var(--surface-base)' }}
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-tertiary)',
              marginBottom: '0.5rem',
            }}
          >
            Or start with one of these
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--ink-primary)',
              margin: 0,
            }}
          >
            Destinations StayScout loves.
          </h2>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.85rem',
            color: 'var(--ink-tertiary)',
            margin: 0,
            maxWidth: '20rem',
            textAlign: 'right',
          }}
        >
          Tap a card to search Expedia for that destination, prefilled.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((d) => (
          <FeaturedCard key={d.name} destination={d} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ destination }: { destination: FeaturedDestination }) {
  const [ok, setOk] = useState(true);
  const href = affiliateRedirectHref(destination.name);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`Search ${destination.name} on Expedia (affiliate link)`}
      className="group relative block overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{
        aspectRatio: '4/5',
        borderRadius: '0.9rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--elev-card)',
        textDecoration: 'none',
      }}
    >
      {ok && destination.photo ? (
        <Image
          src={unsplashUrl(destination.photo.id, 800)}
          alt={destination.photo.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          onError={() => setOk(false)}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(140deg, ${destination.gradient[0]} 0%, ${destination.gradient[1]} 100%)`,
          }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="absolute right-5 bottom-5 left-5 flex flex-col gap-1.5">
        <span
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: '1.65rem',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            color: '#EDE6DB',
            textShadow: '0 2px 8px rgba(0,0,0,0.55)',
          }}
        >
          {destination.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            color: 'rgba(237,230,219,0.88)',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          {destination.tagline}
        </span>
        <span
          className="mt-1 inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          Search on Expedia
          <ChevronRight size={10} strokeWidth={2.4} />
        </span>
      </div>
    </a>
  );
}

// ============== Footer ==============

function LandingFooter() {
  return (
    <footer
      className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-2 pb-12"
      style={{
        background: 'var(--surface-base)',
        fontFamily: 'var(--font-inter)',
        fontSize: '0.7rem',
        color: 'var(--ink-tertiary)',
        lineHeight: 1.55,
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        Affiliate links. Prices and availability come from our partners and may change. StayScout
        earns a small commission when you book through us; the price you pay is the same.
      </div>
    </footer>
  );
}

const chevronButtonStyle: CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '999px',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(237,230,219,0.4)',
  color: '#EDE6DB',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};
