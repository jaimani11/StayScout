import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { fontVariables } from '@/lib/fonts';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { getServerTheme } from '@/lib/theme/get-server-theme';

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

  return (
    <html lang="en" data-theme={theme} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider initial={theme}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
