import { Orchestrator } from './orchestrator';
import { AnthropicModelClient } from '@lib/ai/anthropic-client';
import { NoOpTraceLogger } from '@lib/observability/trace-logger';
import { getSessionStore } from '@lib/session';
import { createDefaultProviderRouter } from '@/providers';

/**
 * Process-level singleton so refine-flow state persists across requests
 * within the same Node process. Lazily constructs on first use because
 * route handler imports run at build time and we don't want to require
 * external keys at build time.
 */
let _instance: Orchestrator | null = null;

export function getOrchestrator(): Orchestrator {
  if (_instance) return _instance;
  const modelClient = new AnthropicModelClient();
  _instance = new Orchestrator({
    modelClient,
    traceLogger: NoOpTraceLogger,
    providerRouter: createDefaultProviderRouter(modelClient),
    sessionStore: getSessionStore(),
  });
  return _instance;
}

// Test-only: replace the instance with one that uses a MockModelClient.
export function _setOrchestratorForTesting(instance: Orchestrator | null): void {
  _instance = instance;
}
