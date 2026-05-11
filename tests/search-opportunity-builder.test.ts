import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TripIntent } from '@core/trip-intent';
import { buildSearchOpportunity } from '@/lib/affiliate/search-opportunity-builder';

/**
 * Slice F1 - buildSearchOpportunity output contracts. The shape is the
 * wire format consumed by `<SearchOpportunityBoard>` and persisted in
 * the F1.x analytics path. Lock the public structure down.
 */

const ENV_KEYS = [
  'NEXT_PUBLIC_EXPEDIA_AFFILIATE_CID',
  'NEXT_PUBLIC_EXPEDIA_AFFILIATE_LABEL',
  'EXPEDIA_AFFILIATE_CID',
  'EXPEDIA_AFFILIATE_LABEL',
] as const;

beforeEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});
afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

function makeIntent(args: {
  name: string;
  country: string;
  adults?: number;
  children?: number;
  tags?: string[];
}): TripIntent {
  return {
    destinations: [{ kind: 'synthesized', name: args.name, country: args.country }],
    dates: { kind: 'specific', start: '2026-09-01', end: '2026-09-05' },
    duration: { nights: 4, flexible: false },
    travelers: {
      adults: args.adults ?? 2,
      children: { count: args.children ?? 0 },
      infants: 0,
    },
    budget: { kind: 'unspecified' },
    vibe: { tags: (args.tags ?? []) as TripIntent['vibe']['tags'] },
    preferences: { amenities: [], avoid: [] },
    caveats: [],
    rawInput: '',
  };
}

describe('buildSearchOpportunity', () => {
  it('emits one provider per Expedia/Vrbo/Hotels.com in display order', () => {
    const opp = buildSearchOpportunity({ intent: makeIntent({ name: 'Vienna', country: 'AT' }) });
    expect(opp.providers.map((p) => p.providerId)).toEqual(['expedia', 'vrbo', 'hotels-com']);
    expect(opp.providers).toHaveLength(3);
  });

  it('puts the user dates + party size in every provider URL', () => {
    const opp = buildSearchOpportunity({
      intent: makeIntent({ name: 'Vancouver', country: 'CA', adults: 4, children: 2 }),
    });
    for (const p of opp.providers) {
      expect(p.url).toContain('2026-09-01');
      expect(p.url).toContain('2026-09-05');
    }
    // Expedia: flat adults + comma-joined children ages.
    // Vrbo: destination + adults + children, with from/to dates
    // matching Vrbo's own search-box submission shape.
    // Hotels.com: destination= (not q-destination=) + q-room-0-*
    // params matching Hotels.com's own search-box shape.
    const expedia = opp.providers.find((p) => p.providerId === 'expedia')!.url;
    expect(expedia).toContain('adults=4');
    expect(expedia).toContain('children=8'); // ages comma-joined when set

    const vrbo = opp.providers.find((p) => p.providerId === 'vrbo')!.url;
    expect(vrbo).toContain('destination=Vancouver');
    expect(vrbo).toContain('from=2026-09-01');
    expect(vrbo).toContain('to=2026-09-05');
    expect(vrbo).toContain('adults=4');
    expect(vrbo).toContain('children=2');

    const hotelsCom = opp.providers.find((p) => p.providerId === 'hotels-com')!.url;
    expect(hotelsCom).toContain('destination=Vancouver');
    expect(hotelsCom).not.toContain('q-destination=');
    expect(hotelsCom).toContain('q-check-in=2026-09-01');
    expect(hotelsCom).toContain('q-room-0-adults=4');
    expect(hotelsCom).toContain('q-room-0-children=2');
  });

  it('attaches affcid to all three providers when configured', () => {
    process.env.EXPEDIA_AFFILIATE_CID = 'CID-ABC';
    const opp = buildSearchOpportunity({ intent: makeIntent({ name: 'Lisbon', country: 'PT' }) });
    const expedia = opp.providers.find((p) => p.providerId === 'expedia')!.url;
    expect(expedia).toContain('CID-ABC'); // builder attaches affcid in some form

    const vrbo = opp.providers.find((p) => p.providerId === 'vrbo')!.url;
    expect(vrbo).toContain('affiliateId=CID-ABC');

    const hotelsCom = opp.providers.find((p) => p.providerId === 'hotels-com')!.url;
    expect(hotelsCom).toContain('rffrid=CID-ABC');
  });

  it('still produces a usable URL set without an affcid (commission won’t track)', () => {
    const opp = buildSearchOpportunity({ intent: makeIntent({ name: 'Lisbon', country: 'PT' }) });
    for (const p of opp.providers) {
      expect(p.url).toMatch(/^https:\/\//);
    }
  });

  it('falls back to today+30 / +nights when dates are unspecified', () => {
    const intent = makeIntent({ name: 'Lisbon', country: 'PT' });
    intent.dates = { kind: 'unspecified' };
    intent.duration = { nights: 3, flexible: true };
    const opp = buildSearchOpportunity({ intent });
    // checkOut - checkIn should equal duration.nights.
    const checkIn = new Date(opp.intentDigest.checkIn + 'T00:00:00Z');
    const checkOut = new Date(opp.intentDigest.checkOut + 'T00:00:00Z');
    const diffNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffNights).toBe(3);
  });

  it('attaches editorial flavor when provided', () => {
    const opp = buildSearchOpportunity({
      intent: makeIntent({ name: 'Vienna', country: 'AT' }),
      flavor: 'Coffee houses, gilt ceilings, Sundays that won’t hurry.',
    });
    expect(opp.flavor).toBe('Coffee houses, gilt ceilings, Sundays that won’t hurry.');
  });

  it('omits flavor when blank or whitespace-only', () => {
    const opp = buildSearchOpportunity({
      intent: makeIntent({ name: 'Vienna', country: 'AT' }),
      flavor: '   ',
    });
    expect(opp.flavor).toBeUndefined();
  });

  it('resolves a photo (URL + alt + credit) deterministically per destination', () => {
    const a = buildSearchOpportunity({ intent: makeIntent({ name: 'Vienna', country: 'AT' }) });
    const b = buildSearchOpportunity({ intent: makeIntent({ name: 'Vienna', country: 'AT' }) });
    expect(a.photoUrl).toBe(b.photoUrl);
    expect(a.photoUrl).toMatch(/^https:\/\/images\.unsplash\.com/);
    expect(a.photoAlt.length).toBeGreaterThan(0);
    expect(a.photoCredit.length).toBeGreaterThan(0);
  });

  it('puts vibe tags in the intent digest verbatim', () => {
    const opp = buildSearchOpportunity({
      intent: makeIntent({
        name: 'Vancouver',
        country: 'CA',
        tags: ['luxury', 'walkable', 'foodie'],
      }),
    });
    expect(opp.intentDigest.vibeTags).toEqual(['luxury', 'walkable', 'foodie']);
  });
});
