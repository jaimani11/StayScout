import { describe, expect, it } from 'vitest';
import { pickFeaturedToday } from '@/features/workspace/featured-today';

describe('pickFeaturedToday', () => {
  it('returns the same stay for the same UTC day', () => {
    const a = pickFeaturedToday(new Date('2026-05-08T03:00:00Z'));
    const b = pickFeaturedToday(new Date('2026-05-08T20:00:00Z'));
    expect(a.id).toBe(b.id);
  });

  it('rotates across days', () => {
    const ids = new Set<string>();
    for (let day = 0; day < 30; day++) {
      const date = new Date(Date.UTC(2026, 5, day + 1));
      ids.add(pickFeaturedToday(date).id);
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});
