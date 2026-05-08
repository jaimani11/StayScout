// Layer: providers
// Deps: core, lib

import type { Provider } from '@core/provider';
import type { ProviderId } from '@core/ids';
import type { TripIntent } from '@core/trip-intent';
import type { ModelClient } from '@core/model-client';
import { MockItalyProvider } from './mock-italy';
import { LLMSynthesizedProvider, LLMSynthesizedProviderStub } from './llm-synthesized';

export const ProviderRegistry: Readonly<Record<string, Provider>> = {
  'mock-italy': MockItalyProvider,
  'llm-synthesized': LLMSynthesizedProviderStub,
};

/**
 * Default route — used by tests and any caller without a model client.
 * Italy queries hit the curated MockItalyProvider; others hit the stub.
 */
export function routeProvider(intent: TripIntent): Provider {
  const dest = intent.destinations[0];
  if (dest && dest.country === 'IT' && MockItalyProvider.knowsDestination(dest)) {
    return MockItalyProvider;
  }
  return LLMSynthesizedProviderStub;
}

/**
 * Production factory — builds a router that uses a real LLM provider.
 * Called from the orchestrator singleton at construction time.
 */
export function createDefaultProviderRouter(
  modelClient: ModelClient,
): (intent: TripIntent) => Provider {
  const llmProvider = new LLMSynthesizedProvider(modelClient);
  return (intent) => {
    const dest = intent.destinations[0];
    if (dest && dest.country === 'IT' && MockItalyProvider.knowsDestination(dest)) {
      return MockItalyProvider;
    }
    return llmProvider;
  };
}

export function getProvider(id: ProviderId | string): Provider | null {
  return ProviderRegistry[id] ?? null;
}

export { MockItalyProvider } from './mock-italy';
export { LLMSynthesizedProvider, LLMSynthesizedProviderStub } from './llm-synthesized';
