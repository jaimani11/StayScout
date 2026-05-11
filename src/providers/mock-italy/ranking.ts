import type { Stay } from '@core/stay';
import type { TripIntent, VibeTag } from '@core/trip-intent';

/**
 * Deterministic signal-weighted ranking for the in-process providers.
 *
 * Two stages:
 *   1. Hard filters (capacity, must-have amenities, avoid amenities,
 *      hard budget cap). Stays that fail any are dropped before scoring.
 *   2. Score-and-sort by vibe overlap, signal-driven bonuses, budget
 *      Gaussian fit, capacity headroom, tier match.
 *
 * Slice E1 broadened the bonus surface so a refine like "wellness,
 * foodie, romantic" actually changes ranking - every vibe tag the
 * user requested contributes a small bonus when the stay carries it,
 * in addition to the strong tag-overlap multiplier and the bespoke
 * walkability/familyFit/remoteness/quiet signals.
 *
 * Function signature stays `(stays, intent) => Stay[]` so the swap
 * to a future LLM-driven RankingAgent is local.
 */

const W_TAG_OVERLAP = 30;
const W_GENERIC_VIBE_BONUS = 5; // any matching tag, per overlap
const W_FAMILY_FIT = 20;
const W_WALKABILITY = 15;
const W_REMOTENESS = 12;
const W_QUIET = 10;
const W_BUDGET_FIT = 15;
const W_CAPACITY_FIT = 10;
const W_TIER_MATCH = 10;

/** Vibes that map to bespoke `Stay.signals` numerics. The generic tag
 *  bonus still applies to any matching tag in `Stay.signals.tags`. */
const SIGNAL_VIBE_WEIGHTS: ReadonlyArray<{
  vibe: VibeTag;
  signal: 'walkability' | 'familyFit' | 'remoteness' | 'noise';
  weight: number;
  /** Higher signal value is better when true; lower is better when false. */
  higherBetter: boolean;
}> = [
  { vibe: 'walkable', signal: 'walkability', weight: W_WALKABILITY, higherBetter: true },
  { vibe: 'family-friendly', signal: 'familyFit', weight: W_FAMILY_FIT, higherBetter: true },
  { vibe: 'remote', signal: 'remoteness', weight: W_REMOTENESS, higherBetter: true },
  { vibe: 'slow', signal: 'noise', weight: W_QUIET, higherBetter: false },
];

const TIER_TAGS: readonly VibeTag[] = ['luxury', 'budget', 'mid-range'];

export function rankStays(stays: readonly Stay[], intent: TripIntent): Stay[] {
  // Stage 1: hard filters
  const filtered = stays.filter((s) => passesFilters(s, intent));
  // If filtering empties the result, fall back to scoring the original
  // set rather than returning nothing - better to give the user a
  // ranked-but-imperfect list than an empty board. The provider
  // builder will surface the gap via badges.
  const pool = filtered.length > 0 ? filtered : stays;

  // Stage 2: score + sort
  const scored = pool.map((s) => ({ stay: s, score: scoreStay(s, intent) }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tiebreaker so determinism survives across V8 sort changes
    return a.stay.id.localeCompare(b.stay.id);
  });
  return scored.map((s) => s.stay);
}

/**
 * Hard-filter pass. Rejects stays the user explicitly can't accept:
 *   - Sleeping capacity below the party size.
 *   - Must-have amenity absent (any-of semantics - at least ONE
 *     listed must overlap with the stay's amenities).
 *   - Avoided amenity present (any match drops the stay).
 *   - Per-night budget exceeded by > 50% (soft cap is in the budget-fit
 *     Gaussian; this hard cap drops stays that should never surface).
 */
function passesFilters(stay: Stay, intent: TripIntent): boolean {
  const totalTravelers =
    intent.travelers.adults + intent.travelers.children.count + intent.travelers.infants;
  if (stay.capacity.sleeps < totalTravelers) return false;

  const required = intent.preferences.amenities;
  if (required.length > 0) {
    const stayAmenityIds = stay.amenities.map((a) => a.id.toLowerCase());
    const overlap = required.some((r) => stayAmenityIds.includes(r.toLowerCase()));
    if (!overlap) return false;
  }

  const avoid = intent.preferences.avoid;
  if (avoid.length > 0) {
    const stayAmenityIds = stay.amenities.map((a) => a.id.toLowerCase());
    if (avoid.some((bad) => stayAmenityIds.includes(bad.toLowerCase()))) return false;
  }

  const budgetPerNight = derivePerNightBudget(intent);
  if (budgetPerNight !== null && budgetPerNight > 0) {
    if (stay.pricing.pricePerNight.amount > budgetPerNight * 1.5) return false;
  }

  return true;
}

function scoreStay(stay: Stay, intent: TripIntent): number {
  const intentTags = new Set<VibeTag>(intent.vibe.tags);
  const stayTagSet = new Set(stay.signals.tags);

  // Tag overlap - strongest signal.
  const overlap = stay.signals.tags.filter((t) => intentTags.has(t)).length;
  let score = overlap * W_TAG_OVERLAP;

  // Generic per-vibe nudge for ANY tag the user requested + stay carries -
  // ensures wellness/foodie/romantic/cultural/nature/iconic-landmarks/
  // adventure/etc. all move the order, not just the four hand-coded ones.
  let extraVibeBonus = 0;
  for (const vibe of intentTags) {
    if (stayTagSet.has(vibe)) extraVibeBonus += W_GENERIC_VIBE_BONUS;
  }
  score += extraVibeBonus;

  // Bespoke signal-driven bonuses for the requested vibes that map to
  // numeric signals on the stay.
  for (const { vibe, signal, weight, higherBetter } of SIGNAL_VIBE_WEIGHTS) {
    if (!intentTags.has(vibe)) continue;
    const v = stay.signals[signal];
    if (typeof v !== 'number') continue;
    const norm = Math.max(0, Math.min(100, v)) / 100;
    score += (higherBetter ? norm : 1 - norm) * weight;
  }

  // Budget Gaussian - closer to the requested per-night budget is better.
  const budgetPerNight = derivePerNightBudget(intent);
  if (budgetPerNight !== null) {
    const diff = Math.abs(stay.pricing.pricePerNight.amount - budgetPerNight);
    const sigma = budgetPerNight * 0.4 || 100;
    const fit = Math.exp(-(diff * diff) / (2 * sigma * sigma));
    score += fit * W_BUDGET_FIT;
  }

  // Capacity headroom - passing capacity already cleared the filter,
  // but the bonus keeps it consistent across pre- and post-filter use.
  const totalTravelers =
    intent.travelers.adults + intent.travelers.children.count + intent.travelers.infants;
  if (stay.capacity.sleeps >= totalTravelers) {
    score += W_CAPACITY_FIT;
  }

  // Tier (luxury / budget / mid-range) match - explicit shoulder.
  const wantedTier = TIER_TAGS.find((t) => intentTags.has(t));
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
