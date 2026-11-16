import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rendered server-side for the stock report; bundling it breaks its font/layout loaders.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rasaqbhvdwejwumztxnq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'opuhipthtvmieutlayfv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
