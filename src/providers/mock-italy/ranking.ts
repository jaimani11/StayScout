import type { Stay } from '@core/stay';
import type { TripIntent, VibeTag } from '@core/trip-intent';

/**
 * Deterministic signal-weighted ranking for Slice A. Slice B replaces
 * with a real RankingAgent; the function signature stays
 * `(stays, intent) => Stay[]` so the swap is local.
 */
const W_TAG_OVERLAP = 30;
const W_FAMILY_FIT = 20;
const W_WALKABILITY = 15;
const W_BUDGET_FIT = 15;
const W_CAPACITY_FIT = 10;
const W_TIER_MATCH = 10;

export function rankStays(stays: readonly Stay[], intent: TripIntent): Stay[] {
  const scored = stays.map((s) => ({ stay: s, score: scoreStay(s, intent) }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tiebreaker so determinism survives across V8 sort changes
    return a.stay.id.localeCompare(b.stay.id);
  });
  return scored.map((s) => s.stay);
}

function scoreStay(stay: Stay, intent: TripIntent): number {
  const intentTags = new Set<VibeTag>(intent.vibe.tags);
  const overlap = stay.signals.tags.filter((t) => intentTags.has(t)).length;
  let score = overlap * W_TAG_OVERLAP;

  if (intentTags.has('family-friendly') && typeof stay.signals.familyFit === 'number') {
    score += (stay.signals.familyFit / 100) * W_FAMILY_FIT;
  }
  if (intentTags.has('walkable') && typeof stay.signals.walkability === 'number') {
    score += (stay.signals.walkability / 100) * W_WALKABILITY;
  }

  const budgetPerNight = derivePerNightBudget(intent);
  if (budgetPerNight !== null) {
    const diff = Math.abs(stay.pricing.pricePerNight.amount - budgetPerNight);
    const sigma = budgetPerNight * 0.4 || 100;
    const fit = Math.exp(-(diff * diff) / (2 * sigma * sigma));
    score += fit * W_BUDGET_FIT;
  }

  const totalTravelers =
    intent.travelers.adults + intent.travelers.children.count + intent.travelers.infants;
  if (stay.capacity.sleeps >= totalTravelers) {
    score += W_CAPACITY_FIT;
  }

  const tierTags: VibeTag[] = ['luxury', 'budget', 'mid-range'];
  const wantedTier = tierTags.find((t) => intentTags.has(t));
  if (wantedTier && stay.signals.tags.includes(wantedTier)) {
    score += W_TIER_MATCH;
  }

  return score;
}

function derivePerNightBudget(intent: TripIntent): number | null {
  const b = intent.budget;
  if (b.kind === 'per-night') return b.amount;
  if (b.kind === 'total' && intent.duration.nights > 0) {
    return b.amount / intent.duration.nights;
  }
  return null;
}
