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
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr']
  }
};

export default nextConfig;