import type {
  Provider,
  ProviderContext,
  ProviderSearchQuery,
  ProviderSearchResult,
} from '@core/provider';
import { providerId } from '@core/ids';

/**
 * Stub. Slice A6 wires the real Claude-driven generation + Unsplash
 * keyword photo resolution + 24h LRU cache. Until then, returns an
 * empty result with a 'preview' badge so callers can render the
 * "preview/AI-synthesized" UI affordance correctly.
 */
export const LLMSynthesizedProvider: Provider = {
  id: providerId('llm-synthesized'),
  displayName: 'StayScout Preview',
  capabilities: {
    realtime: false,
    affiliateAttribution: false,
    supportsAvailability: false,
    supportsBooking: false,
  },

  async search(_query: ProviderSearchQuery, _ctx: ProviderContext): Promise<ProviderSearchResult> {
    return {
      stays: [],
      badges: [{ kind: 'preview', label: 'AI Preview (Slice A6)' }],
      freshness: {
        fetchedAt: new Date().toISOString(),
        dataMaxAgeMs: 0,
        source: 'synthesized',
      },
    };
  },
};
