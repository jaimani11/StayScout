'use client';

import { useWorkspaceStore } from '../store/workspace-store';
import { selectCurrentTurn } from '../store/derived';
import { EmptyState } from './empty-state';
import { ShimmerPlaceholder } from './shimmer-placeholder';
import { TripBoard } from './trip-board/trip-board';

export function Canvas() {
  const phase = useWorkspaceStore((s) => s.phase);
  const turn = useWorkspaceStore((s) => selectCurrentTurn(s));

  if (phase === 'idle' || !turn) return <EmptyState />;
  if (phase === 'shimmering') return <ShimmerPlaceholder />;
  if (turn.proposal) {
    return <TripBoard proposal={turn.proposal} adaptationNotes={turn.adaptationNotes} />;
  }
  if (phase === 'refining') return <ShimmerPlaceholder />;
  return <EmptyState />;
}
