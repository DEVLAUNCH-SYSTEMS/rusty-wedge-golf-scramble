import { securityHeaderGroups } from "@/lib/security/http-headers";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return securityHeaderGroups;
  },
};

export default nextConfig;
