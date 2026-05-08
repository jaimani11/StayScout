import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Move Next's dev indicator out of the bottom-left so it doesn't sit
  // on top of the chat-sidebar input bar.
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    // Slice A photos come from Unsplash. Real-provider domains added in Slice B.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    formats: ['image/avif', 'image/webp'],
  },
};

export default config;
