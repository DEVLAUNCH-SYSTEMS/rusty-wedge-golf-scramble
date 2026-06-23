import { securityHeaderGroups } from "@/lib/security/http-headers";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return securityHeaderGroups;
  },
};

export default nextConfig;
