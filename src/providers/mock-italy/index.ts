import type {
  Provider,
  ProviderBadge,
  ProviderContext,
  ProviderSearchQuery,
  ProviderSearchResult,
} from '@core/provider';
import { providerId } from '@core/ids';
import { findDestinationBySlugOrAlias } from '@lib/curation/destinations';
import { searchMockItaly } from './search';

const PROVIDER_ID = providerId('mock-italy');
const DEFAULT_LATENCY_MS = 300;

function getLatencyMs(): number {
  const env = typeof process !== 'undefined' ? process.env.MOCK_PROVIDER_LATENCY_MS : undefined;
  const parsed = env ? Number.parseInt(env, 10) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LATENCY_MS;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export const MockItalyProvider: Provider & {
  knowsDestination(d: { country: string; name: string }): boolean;
} = {
  id: PROVIDER_ID,
  displayName: 'StayScout Curated · Italy',
  capabilities: {
    realtime: false,
    affiliateAttribution: false,
    supportsAvailability: false,
    supportsBooking: false,
    regions: ['IT'],
  },

  knowsDestination(d) {
    if (d.country !== 'IT') return false;
    return findDestinationBySlugOrAlias(d.name) !== null;
  },

  async search(query: ProviderSearchQuery, ctx: ProviderContext): Promise<ProviderSearchResult> {
    await delay(getLatencyMs(), ctx.signal);

    const { stays, closestMatch } = searchMockItaly(query);
    const badges: ProviderBadge[] = [];
    if (closestMatch) {
      badges.push({ kind: 'closest-match', label: 'Closest Italian destination' });
    }
    badges.push({ kind: 'curated', label: 'Hand-curated' });

    return {
      stays,
      badges,
      freshness: {
        fetchedAt: new Date().toISOString(),
        dataMaxAgeMs: 24 * 60 * 60 * 1000,
        source: 'cached',
      },
    };
  },
};
