import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // We can also ignore typescript errors if there are any
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
