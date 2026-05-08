import type { NextRequest } from 'next/server';
import { jsonResponse, resolveRouteContext } from '../../_lib/route-context';

export const runtime = 'nodejs';

/**
 * GET /api/trips/list — list saved trips for the current owner.
 * Anonymous sessions see only the trips they bookmarked; authenticated
 * users see only theirs. Order: most recently bookmarked first.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const ctx = await resolveRouteContext(req);
  try {
    const trips = await ctx.store.listTrips({
      ownerKind: ctx.owner.ownerKind,
      ownerId: ctx.owner.ownerId,
    });
    return jsonResponse({ trips }, { status: 200 }, ctx.setCookie);
  } catch (err) {
    console.error('[trips/list] failed', err);
    return jsonResponse(
      { error: 'list failed', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
      ctx.setCookie,
    );
  }
}
