'use client';

import { useEffect, useState } from 'react';

/**
 * Returns whether the user has requested reduced motion. SSR-safe: always
 * returns `false` on the server, then updates after hydration. Use this to
 * gate cinematic motion (shimmer, materialize, breathe) — fall back to a
 * 200ms cross-fade when true. Spec §4.5.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Server-safe motion config builder. Component code passes its preferred
 * config, and we either return it or a degraded fallback. Helps keep the
 * "200ms fade fallback" rule (spec §4.5) consistent across components.
 */
export function motionWithFallback<T>(
  preferred: T,
  fallback: T,
  reduced: boolean,
): T {
  return reduced ? fallback : preferred;
}
