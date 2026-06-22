import { NextResponse } from "next/server";

import { getAdminAuthProxy } from "@/lib/auth/server";

import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const adminAuthProxy = getAdminAuthProxy();

  if (!adminAuthProxy) {
    return NextResponse.next();
  }

  return adminAuthProxy(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
