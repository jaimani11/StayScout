import type { ProviderSearchQuery } from '@core/provider';
import { httpJson } from '../_shared/http';
import { ExpediaSearchResponseSchema, type ExpediaSearchResponse } from './types';

/**
 * Expedia EPS Rapid search client. Uses HTTP Basic auth with the EPS
 * api key + shared secret pair (real EAN partners use a per-request
 * HMAC signature; v3 also accepts simple Basic which is what we wire
 * for the reference impl).
 *
 * Endpoint shape matches Expedia's public Property Search docs. New
 * partners typically tune query params for rate limits + filters once
 * they have real credentials; the structural mapping stays the same.
 */

const ENDPOINT = 'https://api.ean.com/v3/properties/search';

export interface ExpediaCredentials {
  apiKey: string;
  sharedSecret: string;
}

function buildAuthHeader(creds: ExpediaCredentials): string {
  const raw = `${creds.apiKey}:${creds.sharedSecret}`;
  // btoa is available in modern Node + Edge runtimes; Buffer fallback
  // for older environments.
  const encoded =
    typeof btoa === 'function' ? btoa(raw) : Buffer.from(raw, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}

export async function searchExpedia(
  query: ProviderSearchQuery,
  creds: ExpediaCredentials,
  signal: AbortSignal,
): Promise<ExpediaSearchResponse | null> {
  const params = new URLSearchParams();
  const dest = query.destinations[0];
  if (dest?.country) params.set('country_code', dest.country.toUpperCase());
  if (dest?.name) params.set('q', dest.name);

  if (query.dates.kind === 'specific') {
    params.set('checkin', query.dates.start);
    params.set('checkout', query.dates.end);
  }
  params.set('occupancy', `${query.travelers.adults}`);
  if (query.travelers.children.count > 0) {
    params.set('children', String(query.travelers.children.count));
  }
  params.set('limit', String(query.limit ?? 25));

  const url = `${ENDPOINT}?${params.toString()}`;
  const raw = await httpJson<unknown>(url, {
    method: 'GET',
    headers: {
      authorization: buildAuthHeader(creds),
      'accept-encoding': 'gzip',
    },
    signal,
    providerId: 'expedia',
  });

  if (raw === null) return null;
  const parsed = ExpediaSearchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn('[expedia] response failed Zod validation:', parsed.error.issues.slice(0, 3));
    return { properties: [] };
  }
  return parsed.data;
}
