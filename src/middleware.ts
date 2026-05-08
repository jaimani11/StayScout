import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerFeatures } from '@lib/env';
import { resolveSession, SESSION_COOKIE } from '@lib/session/anonymous';

/**
 * Two responsibilities, in order:
 *
 *   1. Mint the anonymous session cookie if it's missing. The first
 *      request a fresh user makes (page or API) ends up here, so by
 *      the time layout/route-handlers call cookies(), the session id
 *      is already there. cookies().set() isn't available in server
 *      components — middleware is.
 *
 *   2. Delegate to Clerk's middleware when auth is configured.
 *      Otherwise NextResponse.next() — keeps Clerk completely off the
 *      keyless build path.
 *
 * The dynamic import on the Clerk branch ensures keyless dev never
 * evaluates Clerk's runtime.
 */
export default async function middleware(req: NextRequest) {
  const session = resolveSession(req.headers.get('cookie'));

  let res: Response | undefined;
  if (getServerFeatures().auth) {
    const { clerkMiddleware } = await import('@clerk/nextjs/server');
    res = (await clerkMiddleware()(req, undefined as never)) ?? undefined;
  }
  if (!res) {
    res = NextResponse.next();
  }

  if (session.isNew) {
    res.headers.append(
      'Set-Cookie',
      `${SESSION_COOKIE}=${session.sessionId}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; HttpOnly`,
    );
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
