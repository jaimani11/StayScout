import { describe, expect, it } from 'vitest';
import { rankStays } from '@/providers/mock-italy/ranking';
import { providerId, stayId } from '@core/ids';
import type { Stay } from '@core/stay';
import type { TripIntent } from '@core/trip-intent';

/**
 * Slice E1 strengthened the ranking surface: every vibe-tag the user
 * requested contributes; explicit must-have/avoid filters drop stays
 * before scoring; hard budget cap drops absurdly-priced stays. These
 * tests cover the new behavior.
 */

function makeStay(over: Omit<Partial<Stay>, 'id'> & { id: string }): Stay {
  // `id` here is the bare local key (e.g. "wellness-tagged"). We
  // namespace it via stayId() and write it last so the spread of
  // other overrides can't clobber the prefixed value.
  const { id: bare, ...rest } = over;
  return {
    providerId: providerId('mock-italy'),
    name: bare,
    type: 'hotel',
    location: { country: 'IT' },
    photos: [],
    pricing: { pricePerNight: { amount: 200, currency: 'EUR' } },
    capacity: { sleeps: 4 },
    amenities: [],
    signals: { tags: [] },
    description: '',
    bookingLink: { url: 'https://example.com', type: 'redirect' },
    fetchedAt: new Date().toISOString(),
    ...rest,
    id: stayId(`mock-italy:${bare}`),
  } as Stay;
}

function makeIntent(over: Partial<TripIntent> = {}): TripIntent {
  return {
    destinations: [{ kind: 'curated', name: 'Tuscany', country: 'IT' }],
    dates: { kind: 'unspecified' },
    duration: { nights: 5, flexible: false },
    travelers: { adults: 2, children: { count: 0 }, infants: 0, groupKind: 'couple' },
    budget: { kind: 'unspecified' },
    vibe: { tags: [] },
    preferences: { amenities: [], avoid: [] },
    caveats: [],
    rawInput: 'test',
    ...over,
  };
}

describe('rankStays - Slice E1 stronger ranking', () => {
  it('every vibe-tag bonus: a "wellness" refine raises wellness-tagged stays', () => {
    const wellness = makeStay({
      id: 'wellness-tagged',
      signals: { tags: ['wellness', 'mid-range'] },
    });
    const random = makeStay({
      id: 'random',
      signals: { tags: ['mid-range'] },
    });
    const noVibe = makeIntent({ vibe: { tags: ['mid-range'] } });
    const withWellness = makeIntent({ vibe: { tags: ['mid-range', 'wellness'] } });

    const orderNoVibe = rankStays([random, wellness], noVibe).map((s) => s.id);
    const orderWithVibe = rankStays([random, wellness], withWellness).map((s) => s.id);

    // Without 'wellness' both stays score the same (mid-range tag overlap)
    // and tiebreak on id; with 'wellness' the wellness-tagged stay wins.
    expect(orderWithVibe[0]).toBe('mock-italy:wellness-tagged');
    expect(orderNoVibe).not.toEqual(orderWithVibe);
  });

  it('avoid filter drops stays carrying the avoided amenity', () => {
    const withPool = makeStay({
      id: 'with-pool',
      amenities: [{ id: 'pool', label: 'Pool' }],
    });
    const noPool = makeStay({
      id: 'no-pool',
      amenities: [{ id: 'breakfast', label: 'Breakfast' }],
    });
    const intent = makeIntent({ preferences: { amenities: [], avoid: ['pool'] } });
    const ranked = rankStays([withPool, noPool], intent).map((s) => s.id);
    expect(ranked).toEqual(['mock-italy:no-pool']);
  });

  it('must-have filter (any-of) requires at least one match', () => {
    const a = makeStay({
      id: 'has-pool',
      amenities: [{ id: 'pool', label: 'Pool' }],
    });
    const b = makeStay({
      id: 'has-breakfast',
      amenities: [{ id: 'breakfast', label: 'Breakfast' }],
    });
    const c = makeStay({
      id: 'has-neither',
      amenities: [{ id: 'wifi', label: 'Wi-Fi' }],
    });
    const intent = makeIntent({ preferences: { amenities: ['pool', 'breakfast'], avoid: [] } });
    const ranked = rankStays([a, b, c], intent).map((s) => s.id);
    expect(ranked).toContain('mock-italy:has-pool');
    expect(ranked).toContain('mock-italy:has-breakfast');
    expect(ranked).not.toContain('mock-italy:has-neither');
  });

  it('hard budget cap drops stays > 1.5× the per-night budget', () => {
    const cheap = makeStay({
      id: 'cheap',
      pricing: { pricePerNight: { amount: 150, currency: 'EUR' } },
    });
    const overcap = makeStay({
      id: 'overcap',
      pricing: { pricePerNight: { amount: 400, currency: 'EUR' } },
    });
    const intent = makeIntent({
      budget: { kind: 'per-night', amount: 200, currency: 'EUR', flexibility: 'firm' },
    });
    const ranked = rankStays([cheap, overcap], intent).map((s) => s.id);
    // 200 × 1.5 = 300; the 400 stay drops, the 150 stay stays.
    expect(ranked).toEqual(['mock-italy:cheap']);
  });

  it('falls back to the unfiltered set when filters empty everything', () => {
    const a = makeStay({
      id: 'a',
      amenities: [{ id: 'wifi', label: 'Wi-Fi' }],
    });
    const intent = makeIntent({
      preferences: { amenities: ['nonexistent-amenity'], avoid: [] },
    });
    // No stay has the required amenity; instead of returning [], the
    // ranker scores the original set so the user gets ranked-but-
    // imperfect results rather than an empty board.
    const ranked = rankStays([a], intent);
    expect(ranked).toHaveLength(1);
  });

  it('capacity filter drops stays below party size', () => {
    const small = makeStay({ id: 'small', capacity: { sleeps: 2 } });
    const big = makeStay({ id: 'big', capacity: { sleeps: 6 } });
    const intent = makeIntent({
      travelers: { adults: 2, children: { count: 2 }, infants: 0, groupKind: 'family' },
    });
    const ranked = rankStays([small, big], intent).map((s) => s.id);
    // Total = 4; small (sleeps 2) drops, big (sleeps 6) stays.
    expect(ranked).toEqual(['mock-italy:big']);
  });
});
