import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@hool/design-system'],
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GUILD_API_URL: process.env.NEXT_PUBLIC_GUILD_API_URL,
    NEXT_PUBLIC_PROGRESS_API_URL: process.env.NEXT_PUBLIC_PROGRESS_API_URL,
    NEXT_PUBLIC_RECRUITMENT_API_URL: process.env.NEXT_PUBLIC_RECRUITMENT_API_URL,
  },
};

export default nextConfig;
