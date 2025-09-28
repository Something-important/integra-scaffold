import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
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