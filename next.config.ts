import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['http://192.168.88.2'],
  },
};

export default nextConfig;
