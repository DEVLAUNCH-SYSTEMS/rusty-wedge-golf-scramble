import { describe, expect, it } from "vitest";

import { normalizeNeonAuthBaseUrl } from "@/lib/auth/env";

describe("normalizeNeonAuthBaseUrl", () => {
  it("adds https when the scheme is omitted", () => {
    expect(normalizeNeonAuthBaseUrl("ep-xxx.neonauth.us-east-1.aws.neon.tech")).toBe(
      "https://ep-xxx.neonauth.us-east-1.aws.neon.tech",
    );
  });

  it("trims whitespace and surrounding quotes", () => {
    expect(normalizeNeonAuthBaseUrl(' "https://ep-xxx.neonauth.neon.tech/" ')).toBe(
      "https://ep-xxx.neonauth.neon.tech",
    );
  });

  it("rejects values that cannot form an absolute URL", () => {
    expect(() => normalizeNeonAuthBaseUrl("not a url")).toThrow(
      "NEON_AUTH_BASE_URL must be a valid absolute URL",
    );
  });
});
