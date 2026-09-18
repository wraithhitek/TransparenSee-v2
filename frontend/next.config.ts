import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["react-leaflet"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const target = (process.env.NEXT_PUBLIC_API_URL || "https://transparensee-production.up.railway.app").replace(/\/$/, "");
    return [
      {
        source: "/backend-api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

export default nextConfig;
