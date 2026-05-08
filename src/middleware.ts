import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerFeatures } from '@lib/env';

/**
 * Conditional auth middleware.
 *
 * When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY are set,
 * delegates to Clerk's middleware so request handlers can call auth().
 * Otherwise returns NextResponse.next() so the dev "no keys" mode runs
 * with zero Clerk surface area.
 *
 * The dynamic import prevents Clerk from being evaluated at module load
 * when the flag is off — keeps build clean for keyless dev.
 */
export default async function middleware(req: NextRequest) {
  if (!getServerFeatures().auth) {
    return NextResponse.next();
  }
  const { clerkMiddleware } = await import('@clerk/nextjs/server');
  // clerkMiddleware() returns a NextMiddleware which we invoke with
  // (req, event). We pass undefined for event because we don't use
  // waitUntil here; Clerk handles its own background work.
  return clerkMiddleware()(req, undefined as never);
}

export const config = {
  // Match everything except Next internals + static files. Clerk's docs
  // recommend the same pattern; keeps marketing routes (/) and API
  // routes both inside the matcher.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
