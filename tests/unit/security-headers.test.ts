import { describe, expect, it } from "vitest";

import { securityHeaderGroups } from "@/lib/security/http-headers";

describe("security headers", () => {
  it("H22: admin routes return noindex and no-store cache headers", () => {
    const adminGroup = securityHeaderGroups.find(
      (group) => group.source === "/admin/:path*",
    );
    const proofGroup = securityHeaderGroups.find(
      (group) => group.source === "/api/admin/payment-proofs/:path*",
    );

    expect(adminGroup?.headers).toEqual(
      expect.arrayContaining([
        { key: "Cache-Control", value: "no-store" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ]),
    );
    expect(proofGroup?.headers).toEqual(
      expect.arrayContaining([{ key: "Cache-Control", value: "no-store" }]),
    );
  });
});
