import type { NextConfig } from "next";
import { BUCKET } from "@/lib/utils"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaqyfotwczgnsrgvouph.supabase.co",
        port: "",
        pathname: `/storage/v1/object/public/${BUCKET}/**`
      }
    ],

    // Cache optimized images longer to reduce repeated timeouts
    minimumCacheTTL: 300,
  },
};

export default nextConfig;
