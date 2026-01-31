import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure PDF.js worker
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };

      // Handle PDF.js worker files
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });
    }

    return config;
  },
};

export default nextConfig;
