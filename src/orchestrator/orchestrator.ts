import type { Agent, AgentContext, TraceLogger } from '@core/agent';
import type { ConciergeRequest } from '@core/concierge-request';
import { stepId, turnId as turnIdBrand } from '@core/ids';
import type { ModelClient } from '@core/model-client';
import type { OrchestratorEvent } from '@core/orchestrator-event';
import type { Provider, ProviderContext, ProviderSearchQuery } from '@core/provider';
import type { Destination, TripIntent } from '@core/trip-intent';
import type { TripProposal, AgentTraceSummary } from '@core/trip-proposal';
import type { MoodSnapshot } from '@core/reasoning';
import type { IntentAgentInput } from '@/agents/intent-agent';
import { IntentAgent } from '@/agents/intent-agent';
import type { MoodSnapshotAgentInput } from '@/agents/mood-snapshot-agent';
import { MoodSnapshotAgent } from '@/agents/mood-snapshot-agent';
import { routeProvider } from '@/providers';
import { NoOpTraceLogger } from '@lib/observability/trace-logger';
import { MemoryHinter } from '@lib/memory-hinter';
import { computeIntentDelta } from './intent-delta';
import { computeProposalDiff } from './proposal-diff';
import { buildProposal, buildProposalRef } from './proposal-builder';
import { synthesizeAdaptationNotes } from './synthesize-adaptation';

interface TurnRecord {
  turnId: string;
  sessionId: string;
  intent: TripIntent;
  proposal: TripProposal;
  completedAt: number;
}

export interface OrchestratorOptions {
  modelClient: ModelClient;
  traceLogger?: TraceLogger;
  intentAgent?: Agent<IntentAgentInput, TripIntent>;
  moodSnapshotAgent?: Agent<MoodSnapshotAgentInput, MoodSnapshot>;
  providerRouter?: (intent: TripIntent) => Provider;
}

/**
 * Walks the agent graph for a turn and emits a typed event stream. Slice A
 * graph is sequential — Intent → Provider.search → buildProposal. Slice B
 * replaces this class with a LangGraph.js graph; the emitted event shape
 * stays identical so consumers don't change.
 */
export class Orchestrator {
  private readonly modelClient: ModelClient;
  private readonly traceLogger: TraceLogger;
  private readonly intentAgent: Agent<IntentAgentInput, TripIntent>;
  private readonly moodSnapshotAgent: Agent<MoodSnapshotAgentInput, MoodSnapshot>;
  private readonly providerRouter: (intent: TripIntent) => Provider;
  private readonly turns = new Map<string, TurnRecord>();
  private readonly seenSessions = new Set<string>();
  private readonly seenTurnIds = new Set<string>();
  // One MemoryHinter per session — keyed by sessionId, lazy-init.
  private readonly hinterBySession = new Map<string, MemoryHinter>();

  constructor(opts: OrchestratorOptions) {
    this.modelClient = opts.modelClient;
    this.traceLogger = opts.traceLogger ?? NoOpTraceLogger;
    this.intentAgent = opts.intentAgent ?? IntentAgent;
    this.moodSnapshotAgent = opts.moodSnapshotAgent ?? MoodSnapshotAgent;
    this.providerRouter = opts.providerRouter ?? routeProvider;
  }

  private getHinter(sessionId: string): MemoryHinter {
    let h = this.hinterBySession.get(sessionId);
    if (!h) {
      h = new MemoryHinter();
      this.hinterBySession.set(sessionId, h);
    }
    return h;
  }

  async *run(
    req: ConciergeRequest,
    ctx: { signal: AbortSignal },
  ): AsyncIterable<OrchestratorEvent> {
    const turnStartedAt = performance.now();

    // Idempotency guard (spec §6.6) — same turnId twice = early exit.
    if (this.seenTurnIds.has(req.turnId)) {
      yield {
        kind: 'turn.failed',
        turnId: req.turnId,
        error: 'duplicate turnId',
        recoverable: false,
      };
      return;
    }
    this.seenTurnIds.add(req.turnId);

    // First turn of session → emit session.started.
    if (!this.seenSessions.has(req.sessionId)) {
      this.seenSessions.add(req.sessionId);
      yield {
        kind: 'session.started',
        sessionId: req.sessionId,
        timestamp: Date.now(),
      };
    }

    const priorTurn = req.input.priorProposalRef
      ? this.turns.get(req.input.priorProposalRef.turnId)
      : undefined;

    yield {
      kind: 'turn.started',
      turnId: req.turnId,
      type: req.type,
      ...(priorTurn ? { priorTurnId: priorTurn.turnId } : {}),
    };

    const agentTrace: AgentTraceSummary = { agents: [], totalDurationMs: 0 };

    // ============== Step 1 — Intent ==============
    const intentStepId = stepId(`${req.turnId}-intent`);
    yield {
      kind: 'agent.step.started',
      turnId: req.turnId,
      stepId: intentStepId,
      agentId: 'intent',
      label: req.type === 'refine' ? 'Adjusting your trip' : 'Reading your trip',
    };

    const intentStartedAt = performance.now();
    let intent: TripIntent;
    try {
      const agentCtx = this.buildAgentContext(req, ctx.signal);
      const agentInput: IntentAgentInput = priorTurn?.intent
        ? { rawInput: req.input.rawInput, priorIntent: priorTurn.intent }
        : { rawInput: req.input.rawInput };
      intent = await this.intentAgent.run(agentInput, agentCtx);
    } catch (err) {
      yield this.failStep(req.turnId, intentStepId, err);
      yield this.failTurn(req.turnId, err, false);
      return;
    }
    const intentDurationMs = Math.round(performance.now() - intentStartedAt);
    agentTrace.agents.push({ id: 'intent', durationMs: intentDurationMs });

    yield {
      kind: 'agent.step.completed',
      turnId: req.turnId,
      stepId: intentStepId,
      durationMs: intentDurationMs,
    };

    if (req.type === 'refine' && priorTurn?.intent) {
      yield {
        kind: 'intent.refined',
        turnId: req.turnId,
        intent,
        delta: computeIntentDelta(priorTurn.intent, intent),
      };
    } else {
      yield { kind: 'intent.extracted', turnId: req.turnId, intent };
    }

    // ============== Step 2 — Provider search ==============
    const provider = this.providerRouter(intent);
    const searchStepId = stepId(`${req.turnId}-search`);
    yield {
      kind: 'agent.step.started',
      turnId: req.turnId,
      stepId: searchStepId,
      agentId: 'search',
      label: `Searching ${provider.displayName}`,
    };

    const searchStartedAt = performance.now();
    let searchResult;
    try {
      const providerCtx: ProviderContext = { signal: ctx.signal, secrets: {} };
      const query = this.buildProviderQuery(intent, req);
      searchResult = await provider.search(query, providerCtx);
    } catch (err) {
      yield this.failStep(req.turnId, searchStepId, err);
      yield this.failTurn(req.turnId, err, false);
      return;
    }
    const searchDurationMs = Math.round(performance.now() - searchStartedAt);
    agentTrace.agents.push({ id: 'search', durationMs: searchDurationMs });

    yield {
      kind: 'provider.search.completed',
      turnId: req.turnId,
      providerId: provider.id,
      staysFound: searchResult.stays.length,
      badges: searchResult.badges,
      freshness: searchResult.freshness,
    };
    yield {
      kind: 'agent.step.completed',
      turnId: req.turnId,
      stepId: searchStepId,
      durationMs: searchDurationMs,
    };

    if (searchResult.stays.length === 0) {
      yield {
        kind: 'concierge.message',
        turnId: req.turnId,
        message: "*Couldn't find anything that fits — try broadening the dates?*",
        tone: 'apologize',
      };
      yield {
        kind: 'turn.completed',
        turnId: req.turnId,
        durationMs: Math.round(performance.now() - turnStartedAt),
      };
      return;
    }

    // ============== Step 3 — Compose proposal ==============
    // Slice A has no separate ranking agent — the provider's order is the
    // ranking. Slice B inserts RankingAgent here behind the same step id.
    agentTrace.totalDurationMs = Math.round(performance.now() - turnStartedAt);
    const proposal = buildProposal({ intent, stays: searchResult.stays, agentTrace });
    const proposalRef = buildProposalRef(proposal, req.turnId);

    if (req.type === 'refine' && priorTurn?.proposal) {
      yield {
        kind: 'proposal.refining',
        turnId: req.turnId,
        priorProposalRef: buildProposalRef(priorTurn.proposal, priorTurn.turnId),
      };
      // Slice A: synthesize adaptation notes from the IntentDelta we
      // already computed. Slice B's RankingAgent replaces this with real
      // reasoning — same wire format, banner UI unchanged.
      const synthDelta = computeIntentDelta(priorTurn.intent, intent);
      const notes = synthesizeAdaptationNotes(synthDelta);
      if (notes.length > 0) {
        yield { kind: 'proposal.adaptation', turnId: req.turnId, notes };
      }
      yield {
        kind: 'proposal.evolved',
        turnId: req.turnId,
        proposal,
        diff: computeProposalDiff(priorTurn.proposal, proposal),
      };
    } else {
      yield {
        kind: 'proposal.shimmering',
        turnId: req.turnId,
        expectedCount: 1 + proposal.alternatives.length,
      };
      yield { kind: 'proposal.ready', turnId: req.turnId, proposal };
    }

    yield {
      kind: 'proposal.bookmarkable',
      turnId: req.turnId,
      ref: proposalRef,
      storage: 'session',
    };

    yield {
      kind: 'concierge.message',
      turnId: req.turnId,
      message: proposal.reasoning.summary,
      ...(req.type === 'refine' ? { tone: 'narrate' as const } : {}),
    };

    // ============== Step 4 — Mood snapshot (post-proposal, non-blocking) ==============
    // Failures here NEVER block the turn — proposal already shipped.
    const dest = intent.destinations[0];
    if (dest) {
      yield* this.runMoodSnapshotEvents(req, dest, ctx.signal);
    }

    // ============== Memory hint (session-scoped, fires once max) ==============
    const hinter = this.getHinter(req.sessionId);
    hinter.observeTurn({ intent });
    const hint = hinter.evaluate();
    if (hint) {
      hinter.markFired();
      yield {
        kind: 'concierge.memory.hint',
        turnId: req.turnId,
        message: hint.message,
        signalKey: hint.signalKey,
        confidence: hint.confidence,
      };
    }

    yield {
      kind: 'turn.completed',
      turnId: req.turnId,
      durationMs: Math.round(performance.now() - turnStartedAt),
    };

    this.turns.set(req.turnId, {
      turnId: req.turnId,
      sessionId: req.sessionId,
      intent,
      proposal,
      completedAt: Date.now(),
    });
  }

  private async *runMoodSnapshotEvents(
    req: ConciergeRequest,
    destination: Destination,
    signal: AbortSignal,
  ): AsyncIterable<OrchestratorEvent> {
    const moodStepId = stepId(`${req.turnId}-mood`);
    yield {
      kind: 'agent.step.started',
      turnId: req.turnId,
      stepId: moodStepId,
      agentId: 'mood',
      label: 'Composing the vibe',
    };

    const startedAt = performance.now();
    try {
      const agentCtx = this.buildAgentContext(req, signal);
      const snapshot = await this.moodSnapshotAgent.run({ destination }, agentCtx);
      const durationMs = Math.round(performance.now() - startedAt);
      yield {
        kind: 'agent.step.completed',
        turnId: req.turnId,
        stepId: moodStepId,
        durationMs,
      };
      yield {
        kind: 'mood.snapshot.ready',
        turnId: req.turnId,
        destinationName: snapshot.destinationName,
        snapshot,
      };
    } catch (err) {
      yield {
        kind: 'agent.step.failed',
        turnId: req.turnId,
        stepId: moodStepId,
        error: errorMessage(err),
        recoverable: true,
      };
    }
  }

  private buildAgentContext(req: ConciergeRequest, signal: AbortSignal): AgentContext {
    return {
      turnId: turnIdBrand(req.turnId),
      signal,
      emit: { progress: () => {}, explanation: () => {} },
      modelClient: this.modelClient,
      traceLogger: this.traceLogger,
    };
  }

  private buildProviderQuery(intent: TripIntent, req: ConciergeRequest): ProviderSearchQuery {
    return {
      destinations: intent.destinations,
      dates: intent.dates,
      travelers: intent.travelers,
      ...(intent.budget.kind !== 'unspecified' ? { budget: intent.budget } : {}),
      preferences: intent.preferences,
      ...(req.input.compareSet ? { compareSet: req.input.compareSet } : {}),
    };
  }

  private failStep(turnId: string, stepIdValue: string, err: unknown): OrchestratorEvent {
    return {
      kind: 'agent.step.failed',
      turnId,
      stepId: stepIdValue,
      error: errorMessage(err),
      recoverable: false,
    };
  }

  private failTurn(turnId: string, err: unknown, recoverable: boolean): OrchestratorEvent {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        kind: 'turn.failed',
        turnId,
        error: 'cancelled',
        recoverable: true,
      };
    }
    return {
      kind: 'turn.failed',
      turnId,
      error: errorMessage(err),
      recoverable,
    };
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
