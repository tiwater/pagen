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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://pagen.dustland.ai https://*.dustland.ai http://localhost:* http://127.0.0.1:*`,
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://pagen.dustland.ai http://localhost:3001',
          },
        ],
      },
    ]
  },
}
