import type { Turn, WorkspaceState } from './workspace-store';

export function selectCurrentTurn(s: WorkspaceState): Turn | null {
  if (!s.currentTurnId) return null;
  return s.turns.find((t) => t.turnId === s.currentTurnId) ?? null;
}

export function selectActiveStep(s: WorkspaceState) {
  const t = selectCurrentTurn(s);
  return t?.steps.find((step) => step.status === 'active') ?? null;
}
