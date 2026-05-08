'use client';

import { useWorkspaceStore } from '../store/workspace-store';
import { selectCurrentTurn } from '../store/derived';
import { EmptyState } from './empty-state';
import { ShimmerPlaceholder } from './shimmer-placeholder';
import { StayList } from './stay-list';

export function Canvas() {
  const phase = useWorkspaceStore((s) => s.phase);
  const turn = useWorkspaceStore((s) => selectCurrentTurn(s));

  if (phase === 'idle' || !turn) {
    return <EmptyState />;
  }
  if (phase === 'shimmering' || phase === 'refining') {
    return <ShimmerPlaceholder />;
  }
  if (turn.proposal) {
    return <StayList hero={turn.proposal.hero} alternatives={turn.proposal.alternatives} />;
  }
  return <EmptyState />;
}
