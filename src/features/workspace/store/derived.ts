import type { Stay } from '@core/stay';
import type { Turn, WorkspaceState } from './workspace-store';

export function selectCurrentTurn(s: WorkspaceState): Turn | null {
  if (!s.currentTurnId) return null;
  return s.turns.find((t) => t.turnId === s.currentTurnId) ?? null;
}

export function selectActiveStep(s: WorkspaceState) {
  const t = selectCurrentTurn(s);
  return t?.steps.find((step) => step.status === 'active') ?? null;
}

/**
 * Find a Stay by id across all turns' proposals (hero or alternative).
 * Slice A's compare/detail UIs lean on this lookup; turns is a small list
 * so the linear scan is fine. Returns null if not found.
 */
export function selectStayById(s: WorkspaceState, stayId: string): Stay | null {
  for (const t of s.turns) {
    if (!t.proposal) continue;
    if (t.proposal.hero.id === stayId) return t.proposal.hero;
    const alt = t.proposal.alternatives.find((a) => a.id === stayId);
    if (alt) return alt;
  }
  return null;
}

export function selectStaysByIds(s: WorkspaceState, ids: readonly string[]): Stay[] {
  return ids.map((id) => selectStayById(s, id)).filter((x): x is Stay => x !== null);
}
