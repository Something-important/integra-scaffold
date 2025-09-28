import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true"
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true"
  },
  experimental: {
    esmExternals: true
  },
  webpack: config => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false
    };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader'
    });
    return config;
  }
};

// Enable static export for client-only build
nextConfig.output = "export";
nextConfig.trailingSlash = true;
nextConfig.images = {
  unoptimized: true,
};



module.exports = nextConfig;