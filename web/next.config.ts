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