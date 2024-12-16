/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Allow HMR in development
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}
