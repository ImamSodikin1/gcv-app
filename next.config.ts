import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during build (production)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build (production)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
