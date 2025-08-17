import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@opgrapes/ui"],
  output: "standalone",
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Handle monorepo packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@opgrapes/ui': require.resolve('../../packages/ui'),
    };
    
    return config;
  },
};

export default nextConfig;


