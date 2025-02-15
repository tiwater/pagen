import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure auth pages are rendered at runtime
  unstable_allowDynamic: [
    '**/node_modules/@supabase/ssr/**',
  ],
};

export default nextConfig;