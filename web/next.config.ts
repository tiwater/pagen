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
  serverExternalPackages: ['@supabase/ssr']
};

export default nextConfig;