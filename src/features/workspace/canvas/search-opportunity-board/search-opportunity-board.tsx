'use client';

import Image from 'next/image';
import type { SearchOpportunity } from '@core/search-opportunity';
import { useWorkspaceStore } from '../../store/workspace-store';
import { SearchOpportunityCard } from './search-opportunity-card';

/**
 * Slice F1 - SearchOpportunityBoard.
 *
 * Renders when the orchestrator decided not to build a proposal because
 * neither a real provider nor curated inventory can serve the
 * destination. Three goals:
 *
 *   1. Honesty - show the user that we're routing them to the partner
 *      for live availability, never invent a hotel.
 *   2. Continuity - keep the same intent digest visible so the user
 *      can refine ("make it 6 people") and see the URLs update.
 *   3. Monetization - every CTA routes through `/r/[id]` for click
 *      attribution + affcid attachment (E2 plumbing).
 *
 * Structure:
 *   Hero band  - destination name, optional flavor line, intent digest
 *                chip, destination photo background
 *   Cards row  - Expedia / Vrbo / Hotels.com tiles (in builder order)
 *   Footnote   - "We pull real availability from these partners. Your
 *                click earns commission and is logged at /admin/clicks."
 *                (subtle, present-tense, honest)
 */

interface Props {
  opportunity: SearchOpportunity;
}

export function SearchOpportunityBoard({ opportunity }: Props) {
  const turnId = useWorkspaceStore((s) => s.currentTurnId);

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <HeroBand opportunity={opportunity} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {opportunity.providers.map((p) => (
          <SearchOpportunityCard
            key={p.providerId}
            provider={p}
            destinationName={opportunity.destination.name}
            {...(turnId ? { turnId } : {})}
          />
        ))}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.7rem',
          lineHeight: 1.5,
          color: 'var(--ink-tertiary)',
          marginTop: '0.4rem',
          maxWidth: '46rem',
        }}
      >
        We don&rsquo;t have direct inventory for {opportunity.destination.name} yet. These links
        send you straight to our partners for live availability. Affiliate links · prices may
        change.
      </p>
    </div>
  );
}

function HeroBand({ opportunity }: { opportunity: SearchOpportunity }) {
  const digest = describeDigest(opportunity);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        borderRadius: '1.1rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--elev-card)',
        minHeight: '15rem',
      }}
    >
      <Image
        src={opportunity.photoUrl}
        alt={opportunity.photoAlt}
        fill
        sizes="(max-width: 768px) 100vw, 70vw"
        style={{ objectFit: 'cover' }}
        // Photo lookup is hash-deterministic - same destination always
        // gets the same image. Priority because this is above-the-fold
        // for the opportunity flow.
        priority
      />
      {/* Darkening gradient so the editorial copy stays legible across
       *  varied photography. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      <div className="relative flex h-full flex-col justify-between gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.55rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(237,230,219,0.5)',
              color: '#EDE6DB',
              borderRadius: '0.2rem',
              backdropFilter: 'blur(4px)',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            {digest}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.55rem',
              letterSpacing: '0.05em',
              color: 'rgba(237,230,219,0.8)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
            aria-label={`Photo: ${opportunity.photoCredit}`}
          >
            {opportunity.photoCredit}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 2.6rem)',
              lineHeight: 1.1,
              color: '#EDE6DB',
              textShadow: '0 2px 6px rgba(0,0,0,0.55)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            {opportunity.destination.name}
          </h2>
          {opportunity.flavor && (
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-body-md)',
                lineHeight: 1.45,
                color: '#EDE6DB',
                textShadow: '0 1px 3px rgba(0,0,0,0.55)',
                margin: 0,
                maxWidth: '36rem',
              }}
            >
              {opportunity.flavor}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** "2 adults · Sep 1–5 · luxury, walkable" - compact summary for the chip. */
function describeDigest(o: SearchOpportunity): string {
  const { intentDigest } = o;
  const partyParts: string[] = [];
  partyParts.push(`${intentDigest.adults} ${intentDigest.adults === 1 ? 'adult' : 'adults'}`);
  if (intentDigest.children > 0) {
    partyParts.push(
      `${intentDigest.children} ${intentDigest.children === 1 ? 'child' : 'children'}`,
    );
  }
  const party = partyParts.join(' · ');

  const dates = formatDateRange(intentDigest.checkIn, intentDigest.checkOut);

  const vibe = intentDigest.vibeTags.slice(0, 3).join(', ');

  return [party, dates, vibe].filter(Boolean).join(' · ');
}

function formatDateRange(checkIn: string, checkOut: string): string {
  // ISO YYYY-MM-DD → "Sep 1–5". Same year assumed.
  try {
    const start = new Date(checkIn + 'T00:00:00Z');
    const end = new Date(checkOut + 'T00:00:00Z');
    const monthIn = start.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const monthOut = end.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const dayIn = start.getUTCDate();
    const dayOut = end.getUTCDate();
    if (monthIn === monthOut) {
      return `${monthIn} ${dayIn}–${dayOut}`;
    }
    return `${monthIn} ${dayIn} – ${monthOut} ${dayOut}`;
  } catch {
    return `${checkIn} – ${checkOut}`;
  }
}
