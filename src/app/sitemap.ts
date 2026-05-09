import type { MetadataRoute } from 'next';
import { ITALIAN_DESTINATIONS } from '@lib/curation/destinations';

/**
 * Crawler-facing sitemap. Includes:
 *   - `/` (the workspace landing)
 *   - `/destinations` (curated index)
 *   - `/destinations/[slug]` (one per curated entry)
 *
 * Deliberately EXCLUDES `/t/[slug]` — share slugs are unguessable
 * (~95 bits of entropy) and meant for direct sharing, not indexing.
 * Crawling them would defeat the privacy intent.
 */

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${base}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...ITALIAN_DESTINATIONS.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
