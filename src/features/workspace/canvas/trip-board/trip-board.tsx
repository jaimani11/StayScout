'use client';

import { AnimatePresence } from 'framer-motion';
import type { TripProposal } from '@core/trip-proposal';
import type { AdaptationNote } from '@core/reasoning';
import { HeroStayCard } from './hero-stay-card';
import { AlternativeCard } from './alternative-card';
import { ReasoningStrip } from './reasoning-strip';
import { AdaptationBanner } from './adaptation-banner';

export function TripBoard({
  proposal,
  adaptationNotes = [],
}: {
  proposal: TripProposal;
  adaptationNotes?: AdaptationNote[];
}) {
  const alts = proposal.alternatives.slice(0, 2);

  return (
    <div className="flex h-full flex-col gap-3 px-6 py-6">
      <AdaptationBanner notes={adaptationNotes} />

      <AnimatePresence mode="popLayout" initial={false}>
        <HeroStayCard key={proposal.hero.id} stay={proposal.hero} />
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {alts.map((s, i) => (
            <AlternativeCard key={s.id} stay={s} index={i} />
          ))}
        </AnimatePresence>
      </div>

      <ReasoningStrip
        highlights={proposal.reasoning.highlights}
        {...(proposal.reasoning.totalCost ? { totalCost: proposal.reasoning.totalCost } : {})}
      />
    </div>
  );
}
