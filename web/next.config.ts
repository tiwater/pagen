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
  // Ensure Supabase auth works in production
  serverExternalPackages: ['@supabase/ssr'],
  // Disable static optimization for auth-related pages
  experimental: {
    // This ensures these pages are always rendered at runtime
    workerThreads: false,
    cpus: 1
  },
  // Force dynamic rendering for auth pages
  async headers() {
    return [
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'x-middleware-cache',
            value: 'no-cache'
          }
        ]
      }
    ];
  }
};

export default nextConfig;