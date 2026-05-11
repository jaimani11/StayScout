import type { ProviderSearchQuery } from '@core/provider';
import type { Stay } from '@core/stay';
import type { TripIntent } from '@core/trip-intent';
import { findDestinationBySlugOrAlias } from '@lib/curation/destinations';
import { ALL_STAYS, STAYS_BY_DESTINATION } from './data';
import { rankStays } from './ranking';

/**
 * Match curated destinations from the query, filter by hard constraints
 * (capacity, budget if specified), and return ranked stays. Deterministic
 * given the same input.
 */
export function searchMockItaly(query: ProviderSearchQuery): {
  stays: Stay[];
  closestMatch: boolean;
} {
  const matched = matchDestinations(query.destinations.map((d) => d.name));
  let candidates: readonly Stay[] = matched.length === 0 ? ALL_STAYS : matched;
  const closestMatch = matched.length === 0 && query.destinations.length > 0;

  // Hard filter - capacity
  const totalTravelers =
    query.travelers.adults + query.travelers.children.count + query.travelers.infants;
  candidates = candidates.filter((s) => s.capacity.sleeps >= totalTravelers);

  // Hard filter - explicit per-night budget cap if specified (allow 40% headroom)
  if (query.budget?.kind === 'per-night') {
    const cap = query.budget.amount;
    candidates = candidates.filter((s) => s.pricing.pricePerNight.amount <= cap * 1.4);
  }

  if (query.filters?.minPricePerNight !== undefined) {
    const min = query.filters.minPricePerNight;
    candidates = candidates.filter((s) => s.pricing.pricePerNight.amount >= min);
  }
  if (query.filters?.maxPricePerNight !== undefined) {
    const max = query.filters.maxPricePerNight;
    candidates = candidates.filter((s) => s.pricing.pricePerNight.amount <= max);
  }
  if (query.filters?.excludedTypes && query.filters.excludedTypes.length > 0) {
    const excluded = new Set(query.filters.excludedTypes);
    candidates = candidates.filter((s) => !excluded.has(s.type));
  }

  const ranked = rankStays(candidates, syntheticIntent(query));
  const limit = query.limit ?? 12;
  return { stays: ranked.slice(0, limit), closestMatch };
}

function matchDestinations(inputs: string[]): Stay[] {
  const stays: Stay[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    const dest = findDestinationBySlugOrAlias(input);
    if (!dest) continue;
    const slugStays = STAYS_BY_DESTINATION[dest.slug] ?? [];
    for (const s of slugStays) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        stays.push(s);
      }
    }
  }
  return stays;
}

// Synthetic intent for Slice A3 - Slice A5 wires the real IntentAgent
// output through the orchestrator. We project the fields rankStays() reads.
function syntheticIntent(query: ProviderSearchQuery): TripIntent {
  return {
    destinations: query.destinations,
    dates: query.dates,
    duration: { nights: 7, flexible: true },
    travelers: query.travelers,
    budget: query.budget ?? { kind: 'unspecified' },
    vibe: { tags: [] },
    preferences: query.preferences ?? { amenities: [], avoid: [] },
    caveats: [],
    rawInput: '',
  };
}
