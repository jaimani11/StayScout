import type { Stay } from '@core/stay';
import { ALL_STAYS } from '@/providers/mock-italy/data';

/**
 * Daily-rotated featured stay over the curated set. Deterministic: the
 * same UTC day returns the same stay across all sessions.
 */
export function pickFeaturedToday(now: Date = new Date()): Stay {
  const dayBucket = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  const idx = dayBucket % ALL_STAYS.length;
  const stay = ALL_STAYS[idx];
  if (!stay) throw new Error('ALL_STAYS is empty');
  return stay;
}
