import { Orchestrator } from './orchestrator';
import { AnthropicModelClient } from '@lib/ai/anthropic-client';
import { NoOpTraceLogger } from '@lib/observability/trace-logger';

/**
 * Process-level singleton so the in-memory turn map persists across
 * requests within the same Node process. Lazily constructs on first use
 * because route handler imports run at build time and we don't want to
 * require ANTHROPIC_API_KEY at build.
 */
let _instance: Orchestrator | null = null;

export function getOrchestrator(): Orchestrator {
  if (_instance) return _instance;
  const modelClient = new AnthropicModelClient();
  _instance = new Orchestrator({
    modelClient,
    traceLogger: NoOpTraceLogger,
  });
  return _instance;
}

// Test-only: replace the instance with one that uses a MockModelClient.
export function _setOrchestratorForTesting(instance: Orchestrator | null): void {
  _instance = instance;
}
