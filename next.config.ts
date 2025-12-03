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
    ]
  }
};

export default nextConfig;
