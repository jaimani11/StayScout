'use client';

import { ExternalLink } from '@/features/shared/icons';
import type { Stay } from '@core/stay';
import type { TripIntent } from '@core/trip-intent';
import {
  buildExpediaSearchUrl,
  getExpediaAffiliateConfig,
  type DestinationSearchInput,
} from '@lib/affiliate/expedia-link-builder';
import { encodeAffiliateLink } from '@lib/affiliate/link-encoder';

/**
 * "View on Expedia" affiliate CTA.
 *
 * Two variants:
 *
 *   - `compact` — small inline link for the trip-board cards. Renders
 *     "View on Expedia →" without disclosure copy (the disclosure
 *     lives once on the detail panel where the primary CTA is).
 *
 *   - `primary` — full button + FTC-aligned disclosure footer
 *     ("Powered by Expedia · Affiliate link · Prices may change").
 *     Used on the detail panel, where the user has decided this is
 *     the listing they care about.
 *
 * URL resolution:
 *   1. If the stay's existing `bookingLink.url` is on `expedia.com`,
 *      use it as-is — the Rapid mapper already attached the
 *      affiliate `aid`/`affcid`. (Future: when Rapid is wired live,
 *      this is the property-level deeplink.)
 *   2. Otherwise build a destination-level Expedia search URL from
 *      the user's intent — so curated mock-italy stays and
 *      AI-synthesized stays both get a usable, monetized CTA.
 *
 * Mock-safe: when `EXPEDIA_AFFILIATE_CID` is unset, the URL still
 * resolves to a valid Expedia search; the `affcid` param just isn't
 * attached. The CTA continues to work (no broken state); commission
 * doesn't track. Honest, non-blocking.
 *
 * Server component (no `'use client'`) — pure URL math + an anchor.
 */

interface ExpediaCtaProps {
  stay: Stay;
  intent: TripIntent;
  /** When the stay was proposed — used for click attribution. */
  turnId?: string;
  variant: 'compact' | 'primary';
}

export function ExpediaCta({ stay, intent, turnId, variant }: ExpediaCtaProps) {
  const outboundUrl = resolveOutboundUrl(stay, intent);
  if (!outboundUrl) return null;

  // Encode payload so the redirect handler can record + validate.
  const id = encodeAffiliateLink({
    url: outboundUrl,
    providerId: stay.providerId,
    stayId: stay.id,
    ...(turnId ? { turnId } : {}),
  });
  const href = `/r/${id}`;

  if (variant === 'compact') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#EDE6DB',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
        aria-label={`View ${stay.name} on Expedia (affiliate link)`}
      >
        View on Expedia
        <ExternalLink size={9} strokeWidth={2.2} aria-hidden />
      </a>
    );
  }

  // Primary variant
  return (
    <div className="flex flex-col items-stretch gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-body-sm)',
          letterSpacing: '0.04em',
          padding: '0.75rem 1.1rem',
          background: 'var(--accent-primary)',
          color: 'var(--surface-base)',
          border: 'none',
          borderRadius: '0.4rem',
          fontWeight: 500,
        }}
        aria-label={`Check availability for ${stay.name} on Expedia (affiliate link)`}
      >
        Check availability on Expedia
        <ExternalLink size={13} strokeWidth={2.2} aria-hidden />
      </a>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.65rem',
          letterSpacing: '0.04em',
          color: 'var(--ink-tertiary)',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        Powered by Expedia · <span style={{ fontWeight: 500 }}>Affiliate link</span> · Prices may
        change
      </p>
    </div>
  );
}

/**
 * Decide which URL to send the user to.
 *
 *   - If the stay's existing booking link is already on Expedia, use
 *     it. (When Rapid is wired live, this is the property-level
 *     deeplink with the affiliate `aid` already attached.)
 *   - Otherwise build a destination-level Expedia search URL from
 *     intent. Works for mock-italy, llm-synthesized, anything.
 *   - If neither path produces a valid Expedia URL, returns null and
 *     the CTA hides — better to omit a broken link than show one.
 */
function resolveOutboundUrl(stay: Stay, intent: TripIntent): string | null {
  // (1) Existing booking link on expedia host?
  const existing = stay.bookingLink.url;
  if (isExpediaHost(existing)) return existing;

  // (2) Build a destination-level search URL.
  const destination =
    intent.destinations[0]?.name ??
    stay.location.locality ??
    stay.location.region ??
    stay.location.country;
  if (!destination) return null;

  const dates = resolveDates(intent);
  const adults = Math.max(1, intent.travelers.adults);
  const childCount = intent.travelers.children.count;
  const ages = childCount > 0 ? Array.from({ length: childCount }, () => 8) : [];

  const input: DestinationSearchInput = {
    destination,
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    adults,
    ...(ages.length > 0 ? { childrenAges: ages } : {}),
  };
  return buildExpediaSearchUrl(input, getExpediaAffiliateConfig());
}

function isExpediaHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === 'expedia.com' || u.hostname.endsWith('.expedia.com');
  } catch {
    return false;
  }
}

function resolveDates(intent: TripIntent): { checkIn: string; checkOut: string } {
  if (intent.dates.kind === 'specific') {
    return { checkIn: intent.dates.start, checkOut: intent.dates.end };
  }
  // Same fallback as the booking-agent (today + 30, +nights). Keeps
  // URLs across the app consistent for a given saved trip.
  const nights = intent.duration.nights > 0 ? intent.duration.nights : 5;
  const today = new Date();
  const checkIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}
