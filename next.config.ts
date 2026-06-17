import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enforce strict typing on production builds to fool-proof the CI pipeline
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
