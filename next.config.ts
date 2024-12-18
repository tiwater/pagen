import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Make webpack ignore dynamic imports from @/generated
    config.module.rules.push({
      test: /generated[\/\\][^\/\\]+\.tsx?$/,
      loader: 'null-loader'
    });
    
    // Add path alias for generated files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/generated': '/src/generated'
    };
    
    return config;
  }
};

export default nextConfig;
