import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { fontVariables } from '@/lib/fonts';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { getServerTheme } from '@/lib/theme/get-server-theme';
import { AuthProvider, MigrateOnSignIn } from '@/lib/auth';
import { resolveSession } from '@/lib/session/anonymous';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'StayScout — Travel concierge software',
  description:
    'AI-native travel orchestration. Describe your trip in a sentence; specialized agents handle the rest.',
  metadataBase: new URL(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  ),
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await getServerTheme();
  // Middleware mints the anonymous session cookie on first request, so
  // by the time we get here it's present. resolveSession() also handles
  // the rare case where middleware hasn't run yet (RSC dev hot path) by
  // generating a value — the next request will overwrite it consistently.
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const { sessionId } = resolveSession(cookieHeader || null);

  return (
    <html lang="en" data-theme={theme} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider initial={theme}>
          <AuthProvider sessionId={sessionId}>
            <MigrateOnSignIn />
            <div
              className="relative min-h-screen"
              style={{
                backgroundColor: 'var(--surface-base)',
                backgroundImage: 'var(--bloom-warm), var(--bloom-cool)',
                backgroundAttachment: 'fixed',
              }}
            >
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
