import { securityHeaderGroups } from "@/lib/security/http-headers";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright and some tools hit the dev server via 127.0.0.1 while Next
  // binds as localhost — without this, client hydration/HMR assets are blocked.
  allowedDevOrigins: ["127.0.0.1"],
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
