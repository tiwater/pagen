/** @type {import('next').NextConfig} */
const nextConfig = {
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
    maxInactiveAge: 10 * 1000,
    pagesBufferLength: 1,
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
