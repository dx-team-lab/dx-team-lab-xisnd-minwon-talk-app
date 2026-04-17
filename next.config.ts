import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/xisnd-minwon-talk-app' : '',
  assetPrefix: isProd ? '/xisnd-minwon-talk-app/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure build errors don't stop the export as previously configured
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
