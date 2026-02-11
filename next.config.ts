import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, dev }) => {
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

    // Fix: pdfjs-dist 5.4.x ESM + webpack eval-source-map bug
    // https://github.com/vercel/next.js/issues/89177
    if (dev) {
      Object.defineProperty(config, 'devtool', {
        get() { return 'source-map' },
        set() {},
      });
    }

    return config;
  },
};

export default nextConfig;
