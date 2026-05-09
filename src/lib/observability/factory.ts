import type { TraceLogger } from '@core/agent';
import { CompositeTraceLogger } from './composite-trace-logger';
import { LangfuseTraceLogger } from './langfuse-trace-logger';
import { MemoryTraceLogger } from './memory-trace-logger';

/**
 * Build the process-wide TraceLogger composite. Always includes the
 * in-memory sink; conditionally adds Langfuse when keys are set.
 *
 * Cached per-process — same instance across the orchestrator + the
 * dashboard's read API. Reset only when env changes (tests).
 */

let _cached: TraceLogger | null = null;

export function getTraceLogger(): TraceLogger {
  if (_cached) return _cached;
  const sinks: TraceLogger[] = [new MemoryTraceLogger()];
  const langfuse = LangfuseTraceLogger.fromEnv();
  if (langfuse) sinks.push(langfuse);
  _cached = new CompositeTraceLogger(sinks);
  return _cached;
}

/** Test-only — drop the cached composite so env changes take effect. */
export function _resetTraceLoggerForTesting(): void {
  _cached = null;
}
