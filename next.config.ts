import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaqyfotwczgnsrgvouph.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/media/**"
      }
    ],
    // Cache optimized images longer to reduce repeated timeouts
    minimumCacheTTL: 300, // 5 minutes
    // Limit concurrent image processing
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  // Experimental features to help with timeouts
  experimental: {
    // Increase default timeout for external requests  
    proxyTimeout: 120000 // 2 minutes
  }
};

export default nextConfig;
