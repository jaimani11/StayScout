import { MockMonitoringChecker } from './checker';
import { getInMemoryMonitoringStore } from './in-memory-monitoring-store';
import { MonitoringRunner } from './runner';
import type { MonitoringStore } from './monitoring-store';
import type { MonitoringChecker } from './checker';

/**
 * Builds the monitoring subsystem. C2 ships only the mock-checker
 * path; C2.x adds real-provider re-checking when those keys are stable.
 *
 *   - Store: in-memory (HMR-safe singleton). Postgres impl in C2.x.
 *   - Checker: MockMonitoringChecker (synthetic events). Real checker
 *     opt-in via STAYSCOUT_MONITORING_CHECKER=real (lands later).
 *
 * Cached per-process so the same runner is shared across `/api/trips/list`
 * calls and the eventual admin views.
 */

export interface MonitoringSubsystem {
  store: MonitoringStore;
  checker: MonitoringChecker;
  runner: MonitoringRunner;
  /** Surfaced via getServerFeatures() for the admin dashboard. */
  kind: 'mock' | 'real';
}

let _cached: MonitoringSubsystem | null = null;

export function getMonitoringSubsystem(): MonitoringSubsystem {
  if (_cached) return _cached;
  const store = getInMemoryMonitoringStore();
  const checker = new MockMonitoringChecker();
  const runner = new MonitoringRunner(store, checker);
  _cached = { store, checker, runner, kind: 'mock' };
  return _cached;
}

export function _resetMonitoringSubsystemForTesting(): void {
  _cached = null;
}
