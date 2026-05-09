import { describe, expect, it } from 'vitest';
import { ITALIAN_DESTINATIONS, findDestinationBySlugOrAlias } from '@/lib/curation/destinations';
import { CURATED_MOODS } from '@/lib/curation/moods';
import { containsBannedWord } from '@/lib/curation/voice';
import { STAYS_BY_DESTINATION } from '@/providers/mock-italy/data';

/**
 * Per-destination invariants enforced for `/destinations/[slug]` to
 * render meaningfully. Each curated entry must:
 *   - have a Fraunces-italic headline + oneLiner that pass the voice lint
 *   - resolve via findDestinationBySlugOrAlias
 *   - have a curated mood snapshot
 *   - have ≥3 stays in STAYS_BY_DESTINATION
 *
 * Adding a destination later means satisfying all of these — the test
 * is the contract.
 */

describe('destination page data', () => {
  for (const d of ITALIAN_DESTINATIONS) {
    describe(d.slug, () => {
      it('headline + oneLiner pass voice lint (no banned words)', () => {
        expect(containsBannedWord(d.headline)).toBe(false);
        expect(containsBannedWord(d.oneLiner)).toBe(false);
      });

      it('headline is short and oneLiner is single-sentence-ish', () => {
        // Headlines are fragments — fewer than 10 words.
        expect(d.headline.split(/\s+/).length).toBeLessThanOrEqual(10);
        // OneLiners are single sentences — ≤30 words to keep it tight.
        expect(d.oneLiner.split(/\s+/).length).toBeLessThanOrEqual(30);
      });

      it('resolves via findDestinationBySlugOrAlias', () => {
        const resolved = findDestinationBySlugOrAlias(d.slug);
        expect(resolved?.slug).toBe(d.slug);
      });

      it('has a curated MoodSnapshot', () => {
        const mood = CURATED_MOODS[d.slug];
        expect(mood).toBeDefined();
        expect(mood?.destinationName).toBeTruthy();
      });

      it('has at least 3 featured stays', () => {
        const stays = STAYS_BY_DESTINATION[d.slug];
        expect(stays).toBeDefined();
        expect((stays?.length ?? 0) >= 3).toBe(true);
      });

      it('first stay has a usable photo for the hero', () => {
        const stay = STAYS_BY_DESTINATION[d.slug]?.[0];
        expect(stay?.photos.length ?? 0).toBeGreaterThan(0);
      });
    });
  }
});
