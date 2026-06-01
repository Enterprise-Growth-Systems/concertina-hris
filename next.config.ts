import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict typing on production builds to fool-proof the CI pipeline
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
