'use client';

import { useEffect, useState } from 'react';
import { ExperienceSchema, type Experience } from '@core/experience';
import { DiscoveryExperienceRail } from '@/features/discovery';

interface ThingsToDoRailProps {
  /** Free-text destination name from the resolved intent ("Tokyo",
   *  "Cinque Terre", "Maldives"). Drives the Viator search term. */
  destination: string;
}

/**
 * Live "Things to do" rail rendered below the partner cards on the
 * SearchOpportunityBoard. Hits /api/discovery/experiences with the
 * resolved destination so the canvas shows real bookable activities
 * alongside the stay-search-opportunity CTAs.
 *
 * Mirrors LiveExperiencesRail on the landing page but scoped to a
 * single destination (the homepage uses themed editorial searches).
 *
 * Empty + error states degrade gracefully so a Viator outage never
 * blocks the user from clicking through to the stay partners above.
 */
export function ThingsToDoRail({ destination }: ThingsToDoRailProps) {
  const [experiences, setExperiences] = useState<readonly Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!destination) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      query: `things to do ${destination}`,
      limit: '8',
    });
    fetch(`/api/discovery/experiences?${params.toString()}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as
          | { experiences?: unknown; error?: string }
          | null;
        if (res.status === 503) {
          setExperiences([]);
          return;
        }
        if (!res.ok) {
          setError(body?.error ?? `HTTP ${res.status}`);
          return;
        }
        const raw = Array.isArray(body?.experiences) ? body.experiences : [];
        const parsed: Experience[] = [];
        for (const item of raw) {
          const result = ExperienceSchema.safeParse(item);
          if (result.success) parsed.push(result.data);
        }
        setExperiences(parsed);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
    return () => controller.abort();
  }, [destination]);

  // Suppress the entire section when Viator isn't configured AND we
  // also haven't received an error. The partner cards above are
  // enough to satisfy the user's request; an empty "Things to do"
  // shouldn't visually compete with them.
  if (!loading && !error && experiences.length === 0) return null;

  return (
    <div className="mt-6">
      <DiscoveryExperienceRail
        section={{
          slug: `opportunity-things-to-do-${destination.toLowerCase().replace(/\s+/g, '-')}`,
          eyebrow: 'Live · Things to do',
          title: `Bookable in ${destination} right now.`,
          subtitle:
            "Real Viator inventory matched to your destination. Click any card to land on the Viator booking page; the link carries the partner id automatically.",
          layout: 'carousel',
          query: destination,
        }}
        experiences={experiences}
        loading={loading}
        error={error}
      />
    </div>
  );
}
