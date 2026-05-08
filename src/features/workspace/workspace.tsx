'use client';

import { Header } from '@/features/landing/header';
import { ChatSidebar } from './chat-sidebar/chat-sidebar';
import { Canvas } from './canvas/canvas';
import { SavedTripsPanel } from './saved-trips/saved-trips-panel';

/**
 * Single-screen workspace shell. Desktop: split chat (38%) + canvas (62%).
 * Mobile (<768px): canvas stacked above chat (60vh / 40vh), chat keeps the
 * input bar pinned at the bottom of its panel. Header always 100% width.
 *
 * The whole component is exactly 100vh tall — marketing sections scroll
 * below it (mounted by the page).
 */
export function Workspace() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="grid min-h-0 flex-1 grid-rows-[60vh_minmax(0,1fr)] md:grid-cols-[38%_62%] md:grid-rows-1">
        {/* Mobile: canvas FIRST (visual anchor); Desktop: chat first */}
        <section className="order-1 min-h-0 md:order-2">
          <Canvas />
        </section>
        <div className="order-2 min-h-0 border-t md:order-1 md:border-t-0">
          <ChatSidebar />
        </div>
      </main>
      <SavedTripsPanel />
    </div>
  );
}
