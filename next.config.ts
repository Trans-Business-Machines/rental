import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rendered server-side for the stock report; bundling it breaks its font/layout loaders.
  serverExternalPackages: ["@react-pdf/renderer"],
  // pdfkit (used by @react-pdf) lazy-loads its standard fonts via the wildcard
  // subpath import `#standard-fonts/*`, which Vercel's file tracer can't follow,
  // so the .cjs font files are missing from the deployed function.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
  },
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
