import {
  createNeonAuth,
  type NeonAuth,
} from "@neondatabase/auth/next/server";

import { getNeonAuthConfig, isNeonAuthConfigured } from "@/lib/auth/env";

let authInstance: NeonAuth | undefined;

export function getAuth(): NeonAuth {
  if (!authInstance) {
    authInstance = createNeonAuth(getNeonAuthConfig());
  }

  return authInstance;
}

export function getAdminAuthProxy() {
  if (!isNeonAuthConfigured()) {
    return null;
  }

  return getAuth().middleware({ loginUrl: "/auth/sign-in" });
}
