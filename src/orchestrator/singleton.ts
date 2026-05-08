import {
  createOrchestratorEngine,
  getOrchestratorEngineKind,
  type OrchestratorEngine,
} from './engine';

/**
 * Process-level singleton so refine-flow state persists across requests
 * within the same Node process. Lazily constructs on first use.
 *
 * Async because the LangGraph engine awaits PostgresSaver.setup() when
 * DATABASE_URL is present. The hand-rolled engine resolves immediately,
 * so the cost is one microtask in the no-key path.
 *
 * The engine kind is captured at construction time. Flipping
 * STAYSCOUT_ORCHESTRATOR mid-process requires a server restart — by
 * design; we don't want a hot-swap mid-conversation.
 */
let _instance: OrchestratorEngine | null = null;
let _construction: Promise<OrchestratorEngine> | null = null;
let _kindAtConstruction: ReturnType<typeof getOrchestratorEngineKind> | null = null;

export async function getOrchestrator(): Promise<OrchestratorEngine> {
  if (_instance) return _instance;
  if (_construction) return _construction;
  _kindAtConstruction = getOrchestratorEngineKind();
  _construction = createOrchestratorEngine().then((e) => {
    _instance = e;
    return e;
  });
  return _construction;
}

/** Diagnostic: what engine is currently mounted? */
export function getOrchestratorKind(): ReturnType<typeof getOrchestratorEngineKind> | null {
  return _kindAtConstruction;
}

// Test-only: replace the instance with one constructed by the test.
export function _setOrchestratorForTesting(instance: OrchestratorEngine | null): void {
  _instance = instance;
  _construction = null;
  _kindAtConstruction = null;
}
