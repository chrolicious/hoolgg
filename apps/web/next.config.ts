import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@hool/design-system'],
  output: 'standalone',
};

export default nextConfig;
