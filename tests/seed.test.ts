import { describe, expect, it } from 'vitest';
import { ALL_STAYS, STAYS_BY_DESTINATION } from '@/providers/mock-italy/data';
import { StaySchema } from '@core/stay';
import { CURATED_MOODS } from '@lib/curation/moods';
import { ITALIAN_DESTINATIONS } from '@lib/curation/destinations';
import { lintField } from '@lib/quality/taste-lint';

describe('seed quality - curated stays', () => {
  it('has the expected total count', () => {
    expect(ALL_STAYS.length).toBe(30);
  });

  it('every stay validates against StaySchema', () => {
    for (const s of ALL_STAYS) {
      expect(() => StaySchema.parse(s)).not.toThrow();
    }
  });

  it('stay ids are unique and namespaced as mock-italy:<slug>', () => {
    const seen = new Set<string>();
    for (const s of ALL_STAYS) {
      expect(s.id).toMatch(/^mock-italy:[a-z0-9-]+$/);
      expect(seen.has(s.id)).toBe(false);
      seen.add(s.id);
    }
  });

  it('descriptions pass the banned-word lint', () => {
    const issues = ALL_STAYS.flatMap((s) => lintField(s.id, 'description', s.description));
    if (issues.length > 0) {
      const summary = issues
        .map((i) => `[${i.path}.${i.field}] "${i.word}" near "${i.sample}"`)
        .join('\n');
      throw new Error(`taste-lint failed on ${issues.length} stay(s):\n${summary}`);
    }
  });

  it('every stay has at least one photo with an https URL', () => {
    for (const s of ALL_STAYS) {
      expect(s.photos.length).toBeGreaterThan(0);
      for (const p of s.photos) expect(p.url).toMatch(/^https:\/\//);
    }
  });

  it('prices are in a sane range', () => {
    for (const s of ALL_STAYS) {
      expect(s.pricing.pricePerNight.amount).toBeGreaterThanOrEqual(50);
      expect(s.pricing.pricePerNight.amount).toBeLessThanOrEqual(3000);
    }
  });

  it('every destination has at least one stay', () => {
    for (const dest of ITALIAN_DESTINATIONS) {
      expect((STAYS_BY_DESTINATION[dest.slug] ?? []).length).toBeGreaterThan(0);
    }
  });

  it('every curated mood passes banned-word lint', () => {
    const issues = Object.entries(CURATED_MOODS).flatMap(([slug, m]) =>
      lintField(slug, 'mood.text', m.text),
    );
    if (issues.length > 0) {
      throw new Error(
        `mood lint failed:\n${issues.map((i) => `[${i.path}] "${i.word}"`).join('\n')}`,
      );
    }
  });

  it('every destination has a curated mood', () => {
    for (const dest of ITALIAN_DESTINATIONS) {
      expect(CURATED_MOODS[dest.slug]).toBeDefined();
    }
  });
});

describe('voice lint smoke', () => {
  it('catches an obvious banned word', () => {
    const r = lintField(
      'test',
      'desc',
      'A magical place - your unforgettable journey starts here.',
    );
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  it('passes restrained editorial copy', () => {
    const r = lintField(
      'test',
      'desc',
      'A working vineyard since the 1100s; six rooms above the cellars.',
    );
    expect(r.length).toBe(0);
  });
});
