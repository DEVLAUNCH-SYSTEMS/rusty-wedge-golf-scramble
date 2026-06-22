import { describe, expect, it } from "vitest";

import {
  checkRateLimit,
  resetRateLimitsForTests,
} from "@/lib/services/rate-limit";

describe("rate limiting", () => {
  it("allows up to five requests per hour per IP", () => {
    resetRateLimitsForTests();
    const tournamentId = "tournament-1";
    const ip = "203.0.113.10";

    for (let index = 0; index < 5; index += 1) {
      expect(checkRateLimit("registration_submit", tournamentId, ip)).toBe(true);
    }

    expect(checkRateLimit("registration_submit", tournamentId, ip)).toBe(false);
  });

  it("tracks registration and waitlist separately", () => {
    resetRateLimitsForTests();
    const tournamentId = "tournament-1";
    const ip = "203.0.113.10";

    for (let index = 0; index < 5; index += 1) {
      expect(checkRateLimit("registration_submit", tournamentId, ip)).toBe(true);
    }

    expect(checkRateLimit("waitlist_submit", tournamentId, ip)).toBe(true);
  });
});
