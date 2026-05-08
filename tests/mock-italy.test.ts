import { describe, expect, it } from 'vitest';
import { MockItalyProvider } from '@/providers/mock-italy';
import type { ProviderContext, ProviderSearchQuery } from '@core/provider';

const ctx: ProviderContext = {
  signal: new AbortController().signal,
  secrets: {},
};

function buildQuery(overrides: Partial<ProviderSearchQuery> = {}): ProviderSearchQuery {
  return {
    destinations: [{ kind: 'curated', name: 'Tuscany', country: 'IT' }],
    dates: { kind: 'unspecified' },
    travelers: { adults: 2, children: { count: 0 }, infants: 0 },
    ...overrides,
  };
}

describe('MockItalyProvider', () => {
  it('knows curated Italian destinations', () => {
    expect(MockItalyProvider.knowsDestination({ country: 'IT', name: 'Tuscany' })).toBe(true);
    expect(MockItalyProvider.knowsDestination({ country: 'IT', name: 'florence' })).toBe(true);
    expect(MockItalyProvider.knowsDestination({ country: 'JP', name: 'Tokyo' })).toBe(false);
    expect(MockItalyProvider.knowsDestination({ country: 'IT', name: 'Mars Bar' })).toBe(false);
  });

  it('returns Tuscany stays for a Tuscany query', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
    const result = await MockItalyProvider.search(buildQuery(), ctx);
    expect(result.stays.length).toBeGreaterThan(0);
    for (const s of result.stays) {
      expect(s.location.region).toBe('Tuscany');
    }
  });

  it('emits a curated badge', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
    const result = await MockItalyProvider.search(buildQuery(), ctx);
    expect(result.badges.some((b) => b.kind === 'curated')).toBe(true);
  });

  it('emits closest-match badge for unknown Italian destinations', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
    const result = await MockItalyProvider.search(
      buildQuery({ destinations: [{ kind: 'curated', name: 'Mars Bar', country: 'IT' }] }),
      ctx,
    );
    expect(result.badges.some((b) => b.kind === 'closest-match')).toBe(true);
  });

  it('filters by capacity', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
    const big = buildQuery({
      travelers: { adults: 8, children: { count: 0 }, infants: 0 },
    });
    const result = await MockItalyProvider.search(big, ctx);
    for (const s of result.stays) expect(s.capacity.sleeps).toBeGreaterThanOrEqual(8);
  });

  it('determinism: same query returns same stays in same order', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
    const a = await MockItalyProvider.search(buildQuery(), ctx);
    const b = await MockItalyProvider.search(buildQuery(), ctx);
    expect(a.stays.map((s) => s.id)).toEqual(b.stays.map((s) => s.id));
  });

  it('respects abort signal', async () => {
    process.env.MOCK_PROVIDER_LATENCY_MS = '500';
    const ctrl = new AbortController();
    const p = MockItalyProvider.search(buildQuery(), { signal: ctrl.signal, secrets: {} });
    ctrl.abort();
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    process.env.MOCK_PROVIDER_LATENCY_MS = '0';
  });
});
