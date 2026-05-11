import type { TripIntent } from '@core/trip-intent';
import type { SearchOpportunity, SearchOpportunityProvider } from '@core/search-opportunity';
import {
  buildExpediaSearchUrl,
  getExpediaAffiliateConfig,
  type ExpediaAffiliateConfig,
} from './expedia-link-builder';
import { resolveDestinationPhoto } from '@lib/imagery/destination-photo';

/**
 * Slice F1 - build a SearchOpportunity from intent.
 *
 * Emitted when the orchestrator decides the destination isn't backed
 * by real or curated inventory. Instead of synthesizing fake
 * property listings, we surface per-provider affiliate search URLs
 * prefilled with the user's intent. Click → /r/[id] → real provider
 * site with our affcid attached.
 *
 * Three providers in display order:
 *   1. Expedia        - broadest hotel inventory; affcid carries
 *   2. Vrbo           - vacation rentals; same Expedia Group affiliate
 *   3. Hotels.com     - Expedia Group sibling; same affcid often works
 *
 * Per Slice F1 plan: Hotels.com reuses the Expedia affcid for now.
 * Adding a distinct Hotels.com affiliate program is a one-line env
 * var addition later.
 *
 * The flavor copy + photo are optional; resolved by caller before
 * emission (DestinationFlavorAgent + destination-photo lookup).
 * This builder produces the deterministic URL set + intent digest.
 */

export interface BuildSearchOpportunityArgs {
  intent: TripIntent;
  /** Optional one-line editorial line about the destination. */
  flavor?: string;
}

export function buildSearchOpportunity(args: BuildSearchOpportunityArgs): SearchOpportunity {
  const config = getExpediaAffiliateConfig();
  const intent = args.intent;
  const dest = intent.destinations[0];
  if (!dest) {
    throw new Error('buildSearchOpportunity: intent has no destinations');
  }

  const { checkIn, checkOut } = resolveDates(intent);
  const adults = Math.max(1, intent.travelers.adults);
  const children = Math.max(0, intent.travelers.children.count);
  const childrenAges = children > 0 ? Array.from({ length: children }, () => 8) : [];

  const providers: SearchOpportunityProvider[] = [
    expediaSearchOpportunity(
      { destination: dest.name, checkIn, checkOut, adults, childrenAges },
      config,
    ),
    vrboSearchOpportunity({ destination: dest.name, checkIn, checkOut, adults, children, config }),
    hotelsComSearchOpportunity({
      destination: dest.name,
      checkIn,
      checkOut,
      adults,
      children,
      config,
    }),
  ];

  const photo = resolveDestinationPhoto({
    name: dest.name,
    country: dest.country,
    ...(dest.region ? { region: dest.region } : {}),
  });

  return {
    destination: {
      name: dest.name,
      country: dest.country,
      ...(dest.region ? { region: dest.region } : {}),
    },
    intentDigest: {
      vibeTags: intent.vibe.tags,
      checkIn,
      checkOut,
      adults,
      children,
    },
    providers,
    ...(args.flavor && args.flavor.trim().length > 0 ? { flavor: args.flavor.trim() } : {}),
    photoUrl: photo.url,
    photoAlt: photo.alt,
    photoCredit: photo.credit,
    fetchedAt: new Date().toISOString(),
  };
}

// ============== per-provider URL builders ==============

function expediaSearchOpportunity(
  args: {
    destination: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    childrenAges: number[];
  },
  config: ExpediaAffiliateConfig,
): SearchOpportunityProvider {
  const url = buildExpediaSearchUrl(
    {
      destination: args.destination,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      adults: args.adults,
      ...(args.childrenAges.length > 0 ? { childrenAges: args.childrenAges } : {}),
    },
    config,
  );
  return {
    providerId: 'expedia',
    displayName: 'Expedia',
    url,
    hint: 'Hotels, apart-hotels, broadest inventory.',
  };
}

function vrboSearchOpportunity(args: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  config: ExpediaAffiliateConfig;
}): SearchOpportunityProvider {
  // Vrbo affiliate-search URL. Vrbo's search box submits to
  // `/search?destination=...&from=YYYY-MM-DD&to=YYYY-MM-DD&adults=N`
  // (the same shape we capture when typing in their own UI). The
  // previous `?q=` form did NOT trigger a search and dumped the user
  // on the homepage.
  const params = new URLSearchParams();
  params.set('destination', args.destination);
  params.set('from', args.checkIn);
  params.set('to', args.checkOut);
  params.set('adults', String(args.adults));
  if (args.children > 0) params.set('children', String(args.children));
  if (args.config.cid) {
    // Vrbo uses `affiliateId` for Expedia Group's Creator Platform
    // affcid (same id as Expedia.com, different param name).
    params.set('affiliateId', args.config.cid);
  }
  if (args.config.label) params.set('label', args.config.label);
  params.set('_src', 'stayscout');
  return {
    providerId: 'vrbo',
    displayName: 'Vrbo',
    url: `https://www.vrbo.com/search?${params.toString()}`,
    hint: 'Vacation rentals: cottages, villas, cabins, private homes.',
  };
}

function hotelsComSearchOpportunity(args: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  config: ExpediaAffiliateConfig;
}): SearchOpportunityProvider {
  // Hotels.com is an Expedia Group brand. Their search box submits to
  // /Hotel-Search?destination=<name>&q-check-in=...&q-check-out=...
  // The previous form (q-destination=) was Expedia.com's pattern and
  // dropped Hotels.com on the home page. The rest of the q- params
  // mirror Hotels.com's own URL structure for occupancy.
  const params = new URLSearchParams();
  params.set('destination', args.destination);
  params.set('q-check-in', args.checkIn);
  params.set('q-check-out', args.checkOut);
  params.set('q-rooms', '1');
  params.set('q-room-0-adults', String(args.adults));
  if (args.children > 0) params.set('q-room-0-children', String(args.children));
  if (args.config.cid) params.set('rffrid', args.config.cid);
  if (args.config.label) params.set('label', args.config.label);
  params.set('_src', 'stayscout');
  return {
    providerId: 'hotels-com',
    displayName: 'Hotels.com',
    url: `https://www.hotels.com/Hotel-Search?${params.toString()}`,
    hint: 'Hotels.com - Expedia Group sibling; loyalty rewards.',
  };
}

// ============== helpers ==============

function resolveDates(intent: TripIntent): { checkIn: string; checkOut: string } {
  if (intent.dates.kind === 'specific') {
    return { checkIn: intent.dates.start, checkOut: intent.dates.end };
  }
  // Same fallback used elsewhere in the app (booking-agent, ExpediaCta):
  // today + 30 days check-in, +nights check-out. Keeps URLs consistent
  // for a given saved trip / refine cycle.
  const nights = intent.duration.nights > 0 ? intent.duration.nights : 5;
  const today = new Date();
  const checkIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}
