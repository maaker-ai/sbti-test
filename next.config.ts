import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/sbti',
  assetPrefix: '/sbti',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
