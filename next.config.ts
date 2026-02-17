import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7219',
        pathname: '/uploads/**',
      },
    ],
    // Allow loading images from localhost
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // Disable loopback detection for localhost images
  experimental: {
    loopbackDetection: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
