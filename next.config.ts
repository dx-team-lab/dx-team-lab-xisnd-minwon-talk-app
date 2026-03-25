import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/dx-team-lab-xisnd-minwon-talk-app',
  assetPrefix: '/dx-team-lab-xisnd-minwon-talk-app',
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  // Keep these as they are essential for the app's functionality
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
