// Layer: providers
// Deps: core, lib

import type { Provider } from '@core/provider';
import type { ProviderId } from '@core/ids';
import type { TripIntent } from '@core/trip-intent';
import { MockItalyProvider } from './mock-italy';
import { LLMSynthesizedProvider } from './llm-synthesized';

export const ProviderRegistry: Readonly<Record<string, Provider>> = {
  'mock-italy': MockItalyProvider,
  'llm-synthesized': LLMSynthesizedProvider,
};

/**
 * Route an intent to the right provider. Slice A: simple if/else.
 * Slice B replaces with a parallel ProviderRouter that fans out to
 * multiple real providers and merges results — same return type.
 */
export function routeProvider(intent: TripIntent): Provider {
  const dest = intent.destinations[0];
  if (dest && dest.country === 'IT' && MockItalyProvider.knowsDestination(dest)) {
    return MockItalyProvider;
  }
  return LLMSynthesizedProvider;
}

export function getProvider(id: ProviderId | string): Provider | null {
  return ProviderRegistry[id] ?? null;
}

export { MockItalyProvider } from './mock-italy';
export { LLMSynthesizedProvider } from './llm-synthesized';
