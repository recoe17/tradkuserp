import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdfkit': 'commonjs pdfkit',
      });
    }
    return config;
  },
};

export default nextConfig;
