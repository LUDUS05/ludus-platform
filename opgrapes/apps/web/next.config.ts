import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ui"],
  output: "standalone",
};

export default nextConfig;


