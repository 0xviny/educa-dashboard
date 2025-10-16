import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  distDir: "dist",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  transpilePackages: ['@react-pdf/renderer'],
}

export default nextConfig
