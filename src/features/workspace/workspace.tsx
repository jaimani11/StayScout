'use client';

import { Suspense } from 'react';
import { Header } from '@/features/landing/header';
import { ChatSidebar } from './chat-sidebar/chat-sidebar';
import { Canvas } from './canvas/canvas';
import { SavedTripsPanel } from './saved-trips/saved-trips-panel';
import { UrlInit } from './url-init';
import { MobileBottomSheet } from './mobile-bottom-sheet';
import { useIsMobile } from '@/features/shared/use-media-query';

/**
 * Single-screen workspace shell.
 *
 *   Desktop (≥768px): split chat (38%) + canvas (62%) — Slice A layout.
 *   Mobile  (<768px): canvas full-screen background; chat lives in a
 *                     draggable bottom sheet with peek/half/full snaps.
 *
 * The two layouts are switched via media-query state, NOT CSS classes,
 * because the mobile sheet needs JS-driven drag + viewport
 * measurement. SSR + first-paint render the desktop layout; mobile
 * flips post-mount via useIsMobile (which is SSR-safe → false).
 */
export function Workspace() {
  const isMobile = useIsMobile();
  return (
    <div className="flex h-screen flex-col">
      {/* useSearchParams is gated behind Suspense per Next 16's CSR rules. */}
      <Suspense fallback={null}>
        <UrlInit />
      </Suspense>
      <Header />

      {isMobile ? (
        // Mobile shell: canvas owns the full viewport; chat is a sheet
        // anchored to the bottom edge.
        <main className="relative min-h-0 flex-1">
          <div className="absolute inset-0">
            <Canvas />
          </div>
          <MobileBottomSheet>
            <ChatSidebar />
          </MobileBottomSheet>
        </main>
      ) : (
        <main className="grid min-h-0 flex-1 grid-cols-[38%_62%]">
          <div className="min-h-0 border-r" style={{ borderColor: 'var(--border-subtle)' }}>
            <ChatSidebar />
          </div>
          <section className="relative min-h-0">
            <Canvas />
          </section>
        </main>
      )}

      <SavedTripsPanel />
    </div>
  );
}
