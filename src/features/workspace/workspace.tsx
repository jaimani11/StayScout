'use client';

import { Header } from '@/features/landing/header';
import { ChatSidebar } from './chat-sidebar/chat-sidebar';
import { Canvas } from './canvas/canvas';

export function Workspace() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="grid min-h-0 flex-1 grid-cols-[38%_62%]">
        <ChatSidebar />
        <section className="min-h-0">
          <Canvas />
        </section>
      </main>
    </div>
  );
}
