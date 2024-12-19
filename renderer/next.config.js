/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Disable static optimization for /p/[id] routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure /p/[id] pages are not statically optimized
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
