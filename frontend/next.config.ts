import type { NextConfig } from "next";
import { apiProxyTarget } from "./src/lib/apiBase";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    const target = apiProxyTarget();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${target}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
