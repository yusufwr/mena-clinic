import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache during development to eliminate OneDrive disk lock latency & V8 heap crashes
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
