import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We can also ignore typescript errors if there are any
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
