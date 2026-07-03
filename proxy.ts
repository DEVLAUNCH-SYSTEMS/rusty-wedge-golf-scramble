import { NextResponse } from "next/server";

import { getAdminAuthProxy } from "@/lib/auth/server";

import type { NextRequest } from "next/server";

const SERVER_ACTION_HEADER = "next-action";

export async function proxy(request: NextRequest) {
  // Server actions must receive an RSC payload. Auth redirects break the client.
  if (request.headers.has(SERVER_ACTION_HEADER)) {
    return NextResponse.next();
  }

  const adminAuthProxy = getAdminAuthProxy();

  if (!adminAuthProxy) {
    return NextResponse.next();
  }

  return adminAuthProxy(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
