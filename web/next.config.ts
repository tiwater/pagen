import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rgcbvwtxfkbscuggrcks.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'jx.tisvc.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jianxin-files.oss-cn-hangzhou.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
