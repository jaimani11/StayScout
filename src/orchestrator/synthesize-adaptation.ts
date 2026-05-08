import type { AdaptationNote } from '@core/reasoning';
import type { IntentDelta } from '@core/intent-delta';

/**
 * Slice A synthesizer — derives AdaptationNotes from a structural
 * IntentDelta. Slice B's RankingAgent replaces with real reasoning. The
 * note `description` is restrained-editorial, not chatty.
 */
export function synthesizeAdaptationNotes(delta: IntentDelta): AdaptationNote[] {
  const notes: AdaptationNote[] = [];

  for (const change of delta.changed) {
    if (change.key === 'vibe') {
      const before = (change.before as { tags: string[] } | undefined)?.tags ?? [];
      const after = (change.after as { tags: string[] } | undefined)?.tags ?? [];
      const beforeSet = new Set(before);
      const afterSet = new Set(after);
      for (const t of after) {
        if (!beforeSet.has(t)) {
          notes.push({
            description: `Prioritized ${humanize(t)}`,
            signal: t,
            direction: 'up',
          });
        }
      }
      for (const t of before) {
        if (!afterSet.has(t)) {
          notes.push({
            description: `Reduced ${humanize(t)} weighting`,
            signal: t,
            direction: 'down',
          });
        }
      }
    } else if (change.key === 'budget') {
      notes.push({
        description: 'Adjusted budget weighting',
        signal: 'budget',
        direction: 'add',
      });
    } else if (change.key === 'duration') {
      notes.push({
        description: 'Adjusted trip length',
        signal: 'duration',
        direction: 'add',
      });
    } else if (change.key === 'destinations') {
      notes.push({
        description: 'Updated destination set',
        signal: 'destinations',
        direction: 'add',
      });
    }
  }

  return notes;
}

function humanize(tag: string): string {
  return tag.replace(/-/g, ' ');
}
