import type { ConciergeRequest } from '@core/concierge-request';
import type { OrchestratorEvent } from '@core/orchestrator-event';
import { AnthropicModelClient } from '@lib/ai/anthropic-client';
import { NoOpTraceLogger } from '@lib/observability/trace-logger';
import { getSessionStore } from '@lib/session';
import { getServerFeatures } from '@lib/env';
import { createDefaultProviderRouter } from '@/providers';
import { Orchestrator } from './orchestrator';
import { LangGraphOrchestrator } from './langgraph';
import { getCheckpointer } from './langgraph/checkpointer';

/**
 * The structural type both engines satisfy. Anything calling
 * `engine.run()` works against either implementation.
 */
export interface OrchestratorEngine {
  run(req: ConciergeRequest, ctx: { signal: AbortSignal }): AsyncIterable<OrchestratorEvent>;
}

export type OrchestratorEngineKind = 'hand-rolled' | 'langgraph';

/**
 * Read STAYSCOUT_ORCHESTRATOR at call time. Default `hand-rolled`. Any
 * other value (including missing) falls back to default — typo-safe.
 */
export function getOrchestratorEngineKind(): OrchestratorEngineKind {
  const v = process.env.STAYSCOUT_ORCHESTRATOR;
  return v === 'langgraph' ? 'langgraph' : 'hand-rolled';
}

/**
 * Construct a fresh engine instance honoring the env flag. Async so the
 * LangGraph path can await PostgresSaver.setup() when DATABASE_URL is
 * present. The hand-rolled path resolves immediately.
 */
export async function createOrchestratorEngine(): Promise<OrchestratorEngine> {
  const modelClient = new AnthropicModelClient();
  const sessionStore = getSessionStore();
  const providerRouter = createDefaultProviderRouter(modelClient);
  const kind = getOrchestratorEngineKind();

  if (kind === 'langgraph') {
    const checkpointer = await getCheckpointer();
    return new LangGraphOrchestrator({
      modelClient,
      traceLogger: NoOpTraceLogger,
      providerRouter,
      sessionStore,
      checkpointer,
    });
  }
  return new Orchestrator({
    modelClient,
    traceLogger: NoOpTraceLogger,
    providerRouter,
    sessionStore,
  });
}

// For diagnostics / future telemetry.
export { getServerFeatures };
