// Canonical metadata for the seven Italian destinations covered by the
// Slice A demo. Used by MockItalyProvider's destination matcher and by
// the MoodSnapshotAgent (A6) for keying mood data. Slice B's real
// providers will read aliases for query normalization.

export interface CuratedDestination {
  slug: string;
  name: string;
  country: 'IT';
  region: string;
  aliases: readonly string[];
  coordinates: { lat: number; lng: number };
}

export const ITALIAN_DESTINATIONS: readonly CuratedDestination[] = [
  {
    slug: 'tuscany',
    name: 'Tuscany',
    country: 'IT',
    region: 'Tuscany',
    aliases: ['florence', 'siena', 'chianti', "val d'orcia", 'pienza', 'montalcino'],
    coordinates: { lat: 43.7711, lng: 11.2486 },
  },
  {
    slug: 'umbria',
    name: 'Umbria',
    country: 'IT',
    region: 'Umbria',
    aliases: ['perugia', 'assisi', 'orvieto', 'spello', 'todi'],
    coordinates: { lat: 43.0978, lng: 12.5419 },
  },
  {
    slug: 'amalfi',
    name: 'Amalfi Coast',
    country: 'IT',
    region: 'Campania',
    aliases: ['positano', 'ravello', 'capri', 'sorrento', 'amalfi'],
    coordinates: { lat: 40.634, lng: 14.6027 },
  },
  {
    slug: 'rome',
    name: 'Rome',
    country: 'IT',
    region: 'Lazio',
    aliases: ['roma', 'trastevere', 'monti', 'prati'],
    coordinates: { lat: 41.9028, lng: 12.4964 },
  },
  {
    slug: 'venice',
    name: 'Venice',
    country: 'IT',
    region: 'Veneto',
    aliases: ['venezia', 'cannaregio', 'dorsoduro', 'san marco'],
    coordinates: { lat: 45.4408, lng: 12.3155 },
  },
  {
    slug: 'lake-como',
    name: 'Lake Como',
    country: 'IT',
    region: 'Lombardy',
    aliases: ['como', 'bellagio', 'tremezzo', 'varenna', 'lago di como'],
    coordinates: { lat: 45.9866, lng: 9.2531 },
  },
  {
    slug: 'cinque-terre',
    name: 'Cinque Terre',
    country: 'IT',
    region: 'Liguria',
    aliases: ['monterosso', 'vernazza', 'corniglia', 'manarola', 'riomaggiore'],
    coordinates: { lat: 44.1234, lng: 9.7081 },
  },
] as const;

export function findDestinationBySlugOrAlias(input: string): CuratedDestination | null {
  const needle = input.trim().toLowerCase();
  for (const d of ITALIAN_DESTINATIONS) {
    if (d.slug === needle) return d;
    if (d.name.toLowerCase() === needle) return d;
    if (d.aliases.includes(needle)) return d;
  }
  return null;
}
